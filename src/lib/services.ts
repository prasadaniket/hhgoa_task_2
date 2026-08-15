import { createOpenAI } from "@ai-sdk/openai";
import { MongoClient } from "mongodb";
import { env } from "./env";

// OpenRouter configured via OpenAI provider
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY || "dummy",
});

export const STT_MODEL = "elevenlabs"; // or sarvam

export async function transcribeAudio(audio: Blob): Promise<string> {
  // If no API key, return mock
  if (!env.ELEVENLABS_API_KEY && !env.SARVAM_API_KEY) {
    console.warn("No STT API Key found. Returning mock transcription.");
    await new Promise((resolve) => setTimeout(resolve, 100)); // mock latency
    return "What are the key benefits of using MongoDB Atlas?";
  }

  // Implementation for ElevenLabs Speech to Text
  if (env.ELEVENLABS_API_KEY) {
    const formData = new FormData();
    formData.append("file", audio, "audio.webm");
    // ElevenLabs STT endpoint (ensure this matches their actual API v1)
    const response = await fetch(
      "https://api.elevenlabs.io/v1/speech-to-text",
      {
        method: "POST",
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs STT error: ${await response.text()}`);
    }

    const data = await response.json();
    return data.text || "";
  }

  // Fallback to Sarvam AI if preferred
  if (env.SARVAM_API_KEY) {
    const formData = new FormData();
    formData.append("file", audio, "audio.webm");

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": env.SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Sarvam STT error: ${await response.text()}`);
    }

    const data = await response.json();
    return data.transcript || "";
  }

  return "";
}

// Simple Embedding Generation (OpenRouter doesn't natively host typical embedding models for free, but we can use a small free model if available, or just mock)
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!env.OPENROUTER_API_KEY) {
    // Return mock 1536-dimensional vector
    return Array.from({ length: 1536 }, () => Math.random());
  }

  // Note: OpenRouter supports embeddings via OpenAI compatible endpoint if a specific model is targeted.
  // We'll use a standard POST request.
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: "nvidia/llama-nemotron-embed-vl-1b-v2:free",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(
      `Embedding generation failed (${response.status}): ${errorText}. Returning mock vector.`,
    );
    return Array.from({ length: 1536 }, () => Math.random());
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function queryVectorDB(embedding: number[]): Promise<string[]> {
  if (!env.MONGODB_URI) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return [
      "MongoDB Atlas Vector Search integrates seamlessly with popular LLM frameworks.",
      "It allows developers to build semantic search capabilities quickly.",
    ];
  }

  // Using standard Node.js MongoDB driver since Edge runtime requirement is removed
  const client = new MongoClient(env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE || "ai_demo");
    const collection = db.collection(
      process.env.MONGODB_COLLECTION || "chunks",
    );

    const cursor = collection.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 10,
          limit: 3,
        },
      },
    ]);

    const documents = await cursor.toArray();
    return documents.map((doc: any) => doc.text);
  } catch (error) {
    console.error("Vector DB error:", error);
    return ["Mock retrieved context due to DB connection error."];
  } finally {
    await client.close();
  }
}
