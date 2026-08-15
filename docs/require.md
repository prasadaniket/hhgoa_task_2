# HH Goa 2026 Task 2 Requirements

## Objective
Build a **Voice-Enabled Retrieval-Augmented Generation (RAG) Model**.
The system should take voice input, transcribe it to text, retrieve relevant context from a vector database, and generate a final text answer.

## Dataset
- **Name:** AI4Bharat MSMARCO-XI
- **Source:** [https://huggingface.co/datasets/ai4bharat/MSMARCO-XI](https://huggingface.co/datasets/ai4bharat/MSMARCO-XI)

## Technical Specifications

### 1. Speech-to-Text (STT)
- Must use either **Sarvam** OR **ElevenLabs** for the Voice-to-Text pipeline.

### 2. Chunking & Retrieval
- **Advanced Chunking:** Do NOT use a single, naive fixed-size chunking approach.
- The strategy must be vast and well-thought-out.
- Examples expected: multiple chunking strategies, overlap handling, semantic splitting vs. fixed-size, metadata-aware chunking, etc.

### 3. Strict Latency Targets
- **Target:** The full process (STT + Chunking + Vector DB retrieval + Final output generation) must complete in **under 50ms**.
- **Analytics:** Calculate and expose latency percentiles: **P50 / P70 / P100**. This must be measured across a reasonable number of test queries (not just a single best-case run).

### 4. Robust Engineering
- **Model Harness:** Ensure structured orchestration around the model. Implement tool calls, retry mechanisms, structured I/O handling, and error recovery instead of a naive single prompt.
- **Guardrails:** Add safety limits. The model must handle:
  - Off-topic queries.
  - Unsafe / inappropriate inputs.
  - Hallucination checks.
  - Answers that are not grounded in the retrieved context. (The system must know when *not* to answer).

## Deliverables & Submission Requirements
- **Submission Form:** [https://forms.gle/MNvCjcv23Hn2Eeu58](https://forms.gle/MNvCjcv23Hn2Eeu58)
- **GitHub Repository Link**
- **Live Working Demo Link**

### Videos
- **Video 1 (Process Video):** 90 seconds showing the team's working process (not the product).
- **Video 2 (Demo Video):** Full end-to-end working demo of the final project.

### Social Media Promotion (Mandatory)
- Both videos must be uploaded to **Instagram, X (Twitter), and LinkedIn**.
- Uploads must be done by **every individual team member** (not a single shared post).
- At least **1 Instagram account** must be public.
- Every post must include the hashtag: **`#RAGInGoa`**

## Timeline
- **Launch Date:** August 13, 2026
- **Deadline:** August 22, 2026, 11:59 PM
- **Note:** No resubmissions allowed. Submit only when final.
