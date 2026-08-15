# Proposed Tech Stack

To successfully meet the rigorous requirements of Task 2 (especially the sub-50ms end-to-end latency constraint), here is a recommended tech stack optimized for performance, scalability, and robust orchestration.

## 1. Speech-to-Text (STT)

- **Provider:** [Sarvam AI](https://www.sarvam.ai/) or [ElevenLabs](https://elevenlabs.io/) (As mandated by requirements).
- _Recommendation:_ Evaluate both on latency, but Sarvam may offer optimized latency for Indian languages if the AI4Bharat dataset has mixed dialect/accent data. Otherwise, ElevenLabs is highly robust. Use streaming transcription if the API supports it to overlap network latency.

## 2. Text Embedding & Chunking

- **Chunking Library:** `Unstructured.io`, `LangChain`, or Custom semantic chunking scripts.
- **Embedding Model:** Free models via **OpenRouter** (e.g., `nvidia/nemotron-3-embed-1b:free` or similar lightweight high-speed embedding models available on their free tier).
- **Chunking Strategy:**
  - _Primary:_ Semantic chunking (splitting on coherent semantic boundaries).
  - _Fallback/Overlap:_ Fixed-size token chunks with dynamic overlap to ensure no context is lost.
  - _Metadata:_ Enrich chunks with document IDs, source section, and hierarchy.

## 3. Vector Database

- **Provider:** **MongoDB Atlas Vector Search** (Free Tier).
- _Recommendation for <50ms:_ MongoDB offers a robust free tier cluster (M0) which includes Atlas Vector Search. To get as close to the 50ms latency target as possible, ensure your backend server is deployed in the exact same cloud region as your MongoDB cluster to minimize network round-trip time.

## 4. Large Language Model (Answer Generation)

- **Model / Provider:** Free models via **OpenRouter**.
- _Recommendation:_ Use highly optimized, small parameter models available on OpenRouter's free tier, such as `meta-llama/llama-3.1-8b-instruct:free` or `google/gemma-2-9b-it:free`. OpenRouter routes efficiently, though note that hitting a strict <50ms end-to-end constraint using free external cloud APIs will require heavy async pipelining (and streaming) to mask network latency.

## 5. Harness & Orchestration

- **Framework:** Custom `async` TypeScript implementation leveraging Next.js API Routes (Edge Functions for lower latency).
- **Requirements handled:**
  - Asynchronous parallel execution to minimize blocking calls.
  - Built-in retry mechanisms using custom utilities or lightweight libraries.
  - Structured output parsing using `Zod` and `Vercel AI SDK`.

## 6. Guardrails & Safety

- **Framework:** Lightweight semantic checks via API routes and Vercel AI SDK.
- **Checks implementation:**
  - _Off-topic/Unsafe:_ A fast initial safety check against prompts before generating embeddings.
  - _Groundedness/Hallucination:_ Post-processing LLM evaluation check, or prompting the main LLM to specifically output `"I don't know"` when context similarity scores fall below a threshold.

## 7. Web Application (Fullstack)

- **Framework:** **Next.js (App Router)** - acts as the single unified fullstack framework for both the frontend UI and the backend API endpoints.
- **Frontend/Demo:** React components utilizing the native Web Audio API or lightweight hooks (`react-use-audio-voice`) to capture voice input.
- **Backend/API:** Next.js Route Handlers (`app/api/...`), preferably deployed to Edge network for minimal cold starts and latency.
- **Latency Monitoring:** Custom middleware recording start and end timestamps (STT -> DB -> Output), accumulating data to calculate and expose P50/P70/P100 metrics on a dashboard route.

## Architecture Pipeline Diagram

1. **User Speaks** -> Web Audio API
2. **Audio streaming to STT** (Sarvam/ElevenLabs)
3. **Transcription received** -> Intent / Guardrail safety check.
4. **Embedding Generation** -> Vector DB Query (MongoDB Atlas Vector Search).
5. **Retrieval** -> Prompt Assembly with Top-K semantic + metadata chunks.
6. **LLM Generation** (via OpenRouter Free Tier) -> Output parsing.
7. **Hallucination Check** -> Final Output sent to User.
