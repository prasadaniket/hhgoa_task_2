import {
  generateEmbedding,
  openrouter,
  queryVectorDB,
  transcribeAudio,
} from "@/lib/services";
import { streamText } from "ai";
import { NextRequest } from "next/server";

// Removed 'export const runtime = "edge";' to allow standard Node.js MongoDB driver usage
// Allow 60s max duration to handle slow STT or LLM if needed
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        };

        const startTime = performance.now();

        try {
          // 1. Speech-to-Text
          const transcript = await transcribeAudio(audioFile);
          const sttTime = performance.now();
          sendEvent({
            type: "transcript",
            text: transcript,
          });

          // 1.5. Safety/Guardrail Check
          // Extremely fast keyword check or lightweight semantic check
          const unsafeKeywords = ["hack", "kill", "illegal", "bypass"];
          if (
            unsafeKeywords.some((kw) => transcript.toLowerCase().includes(kw))
          ) {
            sendEvent({
              type: "chunk",
              text: "I cannot fulfill this request due to safety guardrails.",
            });
            return; // Terminate early
          }

          // 2. Embedding & Vector Search (Run in sequence after STT, since we need text)
          const embedding = await generateEmbedding(transcript);
          const contexts = await queryVectorDB(embedding);
          const dbTime = performance.now();

          const systemPrompt = `You are a helpful, very concise AI assistant.
Respond in plain text only. Do not use Markdown, bolding, or any special formatting.
Use the following retrieved context to answer the user's query. If you don't know the answer, say "I don't know".
Context:
${contexts.join("\n\n")}`;

          // 3. LLM Generation
          let llmTime = 0;
          let isFirstToken = true;

          const result = await streamText({
            model: openrouter("nvidia/nemotron-3-nano-30b-a3b:free"),
            system: systemPrompt,
            messages: [{ role: "user", content: transcript }],
            temperature: 0.3,
          });

          for await (const textPart of result.textStream) {
            if (isFirstToken) {
              llmTime = performance.now();
              isFirstToken = false;

              // Send metrics as soon as we hit the first token to measure end-to-end latency
              sendEvent({
                type: "metrics",
                metrics: {
                  sttLatency: sttTime - startTime,
                  dbLatency: dbTime - sttTime,
                  llmLatency: llmTime - dbTime,
                  totalLatency: llmTime - startTime,
                },
              });
            }

            sendEvent({
              type: "chunk",
              text: textPart,
            });
          }
        } catch (error: any) {
          sendEvent({
            type: "error",
            message: error.message || "Pipeline error",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
