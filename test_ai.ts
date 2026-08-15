import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "dummy",
});

async function main() {
  try {
    const result = await streamText({
      model: openrouter("meta-llama/llama-3.1-8b-instruct"),
      instructions: "You are a helpful assistant.",
      messages: [{ role: "user", content: "Hello" }],
      temperature: 0.3,
    });
    console.log("No exception before stream iteration!");
  } catch(e) {
    console.error("Caught error:", e);
  }
}
main();
