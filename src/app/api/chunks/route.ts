import { env } from "@/lib/env";
import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    if (!env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MONGODB_URI not configured in environment" },
        { status: 500 }
      );
    }

    const client = new MongoClient(env.MONGODB_URI);
    await client.connect();

    const db = client.db(process.env.MONGODB_DATABASE || "ai_demo");
    const collection = db.collection(process.env.MONGODB_COLLECTION || "chunks");

    // Build filter query
    const filter: any = {};
    if (category && category !== "all") {
      filter["metadata.category"] = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { text: { $regex: search, $options: "i" } },
        { passage_id: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await collection.countDocuments({});
    const matchingCount = await collection.countDocuments(filter);

    // Fetch documents (projecting out large raw embedding arrays for UI efficiency)
    const docs = await collection
      .find(filter, {
        projection: {
          _id: 1,
          passage_id: 1,
          title: 1,
          text: 1,
          metadata: 1,
          indexed_at: 1,
          embedding_dim: { $size: { $ifNull: ["$embedding", []] } },
        },
      })
      .sort({ indexed_at: -1 })
      .limit(50)
      .toArray();

    // Fetch distinct categories for filters
    const categories = await collection.distinct("metadata.category");

    await client.close();

    return NextResponse.json({
      success: true,
      totalCount,
      matchingCount,
      categories: ["all", ...categories.filter(Boolean)],
      chunks: docs.map((doc) => ({
        id: doc._id.toString(),
        passage_id: doc.passage_id || `chunk_${doc._id.toString().slice(-4)}`,
        title: doc.title || "Indexed Document Chunk",
        text: doc.text || "",
        category: doc.metadata?.category || "general",
        language: doc.metadata?.language || "en",
        source: doc.metadata?.source || "ai4bharat/MSMARCO-XI",
        indexed_at: doc.indexed_at || new Date().toISOString(),
        embedding_dim: doc.embedding_dim || 1536,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching chunks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vector chunks from MongoDB" },
      { status: 500 }
    );
  }
}
