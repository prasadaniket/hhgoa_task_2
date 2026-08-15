# Voice-Enabled RAG System - HH Goa 2026

![RAGInGoa](https://img.shields.io/badge/Status-In_Progress-brightgreen?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20OpenRouter%20%7C%20MongoDB-blue?style=for-the-badge)

## 📌 Project Overview

This project is an end-to-end **Voice-Enabled Retrieval-Augmented Generation (RAG) System** built for the **HH Goa 2026 Task 2**. The system accepts user voice input, transcribes it, searches through the AI4Bharat MSMARCO-XI dataset using advanced chunking strategies, and returns an accurate, contextually grounded answer.

Engineered with extreme performance in mind, this pipeline is designed to execute the full retrieval and generation loop in **under 50ms**.

## ✨ Features

- **Voice-to-Text Pipeline:** Powered by [Sarvam/ElevenLabs].
- **Advanced Context Retrieval:** Utilizes semantic and metadata-aware chunking, overlap handling, and high-speed vector search.
- **Sub-50ms Latency:** Highly optimized LLM generation and orchestration to meet strict latency demands.
- **Safety & Guardrails:** Built-in safeguards against unsafe inputs, off-topic queries, and AI hallucinations. If the answer isn't in the dataset, the system refuses to guess.
- **Robust Orchestration:** Fully structured harness handling tool calls, retries, and errors automatically.

## 📊 Latency Analytics

We measure real-time performance across test queries. Current pipeline benchmarks:

- **P50 Latency:** `[XX] ms`
- **P70 Latency:** `[XX] ms`
- **P100 Latency:** `[XX] ms`

_(Update with final metrics prior to submission)._

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- API Keys: Sarvam/ElevenLabs, OpenRouter, and MongoDB Atlas Database URI.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/hh-goa-2026-task2.git
   cd hh-goa-2026-task2
   ```

2. Install dependencies:

   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. Set up environment variables in a `.env.local` file:

   ```env
   NEXT_PUBLIC_STT_API_KEY=your_key_here
   OPENROUTER_API_KEY=your_key_here
   MONGODB_URI=your_uri_here
   ```

4. Run the data indexing script to chunk and embed the MSMARCO-XI dataset:

   ```bash
   npm run index-data
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🎥 Project Videos

- **[Video 1: Our Process](#)** _(90 seconds detailing how we approached the problem)_
- **[Video 2: End-to-End Demo](#)** _(Live working demo of the voice-enabled RAG)_

## 🤝 Team

- [Member 1 Name](https://github.com/member1)
- [Member 2 Name](https://github.com/member2)

---

**#RAGInGoa**
