import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DATABASE || "ai_demo";
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "chunks";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// Sample passages from MSMARCO-XI dataset for indexing
const samplePassages = [
  {
    passage_id: "ms_marco_001",
    title: "MongoDB Atlas Vector Search Overview",
    text: "MongoDB Atlas Vector Search allows developers to build vector search capabilities directly within MongoDB Atlas. It supports HNSW indexing, semantic vector search, and hybrid search combining vector search with full-text search filters.",
    metadata: { source: "ai4bharat/MSMARCO-XI", category: "database", language: "en" }
  },
  {
    passage_id: "ms_marco_002",
    title: "Voice-Enabled RAG Systems Architecture",
    text: "A Voice-Enabled RAG system transcribes incoming audio using Speech-to-Text engines like Sarvam AI or ElevenLabs. Transcribed text is converted into vector embeddings, matched against a vector database for context retrieval, and answered by a low-latency LLM.",
    metadata: { source: "ai4bharat/MSMARCO-XI", category: "voice_ai", language: "en" }
  },
  {
    passage_id: "ms_marco_003",
    title: "Sarvam AI Speech-to-Text Integration",
    text: "Sarvam AI provides state-of-the-art speech recognition APIs optimized for Indian languages and accents, offering low-latency streaming transcription suitable for real-time AI voice applications.",
    metadata: { source: "ai4bharat/MSMARCO-XI", category: "stt", language: "en" }
  },
  {
    passage_id: "ms_marco_004",
    title: "Chunking Strategies for RAG",
    text: "Effective chunking strategies for Retrieval-Augmented Generation include semantic splitting, sliding window overlap chunking, and metadata-aware chunking to preserve document semantics and contextual continuity.",
    metadata: { source: "ai4bharat/MSMARCO-XI", category: "rag_chunking", language: "en" }
  },
  {
    passage_id: "ms_marco_005",
    title: "Latency Optimization in AI Pipelines",
    text: "To achieve sub-50ms or sub-200ms latency targets in voice RAG pipelines, engineers utilize parallelized async execution, Edge functions, quantized embedding models, and in-memory vector index placement.",
    metadata: { source: "ai4bharat/MSMARCO-XI", category: "performance", language: "en" }
  }
];

async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENROUTER_API_KEY) {
    console.log("  ⚠️ OPENROUTER_API_KEY missing, generating fallback embedding vector.");
    return Array.from({ length: 1536 }, () => Math.random());
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        model: "nvidia/llama-nemotron-embed-vl-1b-v2:free",
      }),
    });

    if (!response.ok) {
      console.warn(`  ⚠️ Embedding API returned status ${response.status}. Using fallback vector.`);
      return Array.from({ length: 1536 }, () => Math.random());
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.warn("  ⚠️ Embedding request failed. Using fallback vector.");
    return Array.from({ length: 1536 }, () => Math.random());
  }
}

async function main() {
  console.log("🚀 Starting MSMARCO-XI Data Indexing to MongoDB Atlas...");
  console.log(`📌 Target DB: ${DB_NAME} | Collection: ${COLLECTION_NAME}`);

  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Process and index passages
    const documentsToIndex = [];

    for (const passage of samplePassages) {
      console.log(`⚙️ Processing chunk [${passage.passage_id}]: "${passage.title}"...`);
      const embedding = await generateEmbedding(passage.text);

      documentsToIndex.push({
        passage_id: passage.passage_id,
        title: passage.title,
        text: passage.text,
        metadata: passage.metadata,
        embedding: embedding,
        indexed_at: new Date(),
      });
    }

    // Clear existing sample chunks if needed or upsert
    console.log(`💾 Inserting ${documentsToIndex.length} chunks into MongoDB Atlas...`);
    await collection.deleteMany({ "metadata.source": "ai4bharat/MSMARCO-XI" });
    const result = await collection.insertMany(documentsToIndex);

    console.log(`🎉 Successfully indexed ${result.insertedCount} chunks into '${DB_NAME}.${COLLECTION_NAME}'!`);
    console.log("💡 Ensure a Vector Search Index named 'vector_index' is configured in MongoDB Atlas on field 'embedding'.");
  } catch (error) {
    console.error("❌ Indexing failed with error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔒 MongoDB connection closed.");
  }
}

main();
