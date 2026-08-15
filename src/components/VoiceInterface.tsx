"use client";

import { Activity, Loader2, Mic, Square } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export function VoiceInterface() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [metrics, setMetrics] = useState<{
    sttLatency?: number;
    dbLatency?: number;
    llmLatency?: number;
    totalLatency?: number;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      setTranscript("");
      setAnswer("");
      setMetrics(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = performance.now();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const stopTime = performance.now();
    const formData = new FormData();
    // Use a generic audio file name and format based on the blob
    formData.append("audio", audioBlob, "recording.webm");

    // We send the frontend capture time if we want to include network latency,
    // but typically backend measures its own latency for API calls.
    formData.append("clientStartTime", stopTime.toString());

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let currentAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === "transcript") {
              setTranscript(data.text);
            } else if (data.type === "chunk") {
              currentAnswer += data.text;
              setAnswer(currentAnswer);
            } else if (data.type === "metrics") {
              setMetrics(data.metrics);
            } else if (data.type === "error") {
              console.error("Server error:", data.message);
              currentAnswer += `\n[Error: ${data.message}]`;
              setAnswer(currentAnswer);
            }
          } catch (e) {
            // Some chunks might just be raw text if not NDJSON formatted perfectly,
            // but we will enforce NDJSON in the backend.
          }
        }
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setAnswer("Error processing your request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Recording Button */}
      <div className="relative">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300
            ${
              isRecording
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 scale-110"
                : "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
            }
            ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isRecording ? (
            <Square className="w-10 h-10 fill-current" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
        {isRecording && (
          <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-20 pointer-events-none" />
        )}
      </div>

      {/* Output Area */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transcript Panel */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 h-64 flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Transcript
          </h3>
          <div className="flex-1 overflow-y-auto">
            {transcript ? (
              <p className="text-zinc-100 text-lg leading-relaxed">
                {transcript}
              </p>
            ) : (
              <p className="text-zinc-600 italic">Waiting for speech...</p>
            )}
          </div>
        </div>

        {/* Answer Panel */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 h-64 flex flex-col relative overflow-hidden">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> AI Response
          </h3>
          <div className="flex-1 overflow-y-auto">
            {answer ? (
              <div className="text-zinc-100 text-lg leading-relaxed space-y-4">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-zinc-600 italic">Waiting for AI...</p>
            )}
          </div>

          {/* Metrics Overlay */}
          {metrics && (
            <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/90 border-t border-zinc-800 p-3 flex justify-between text-xs text-zinc-400 backdrop-blur-sm">
              <span title="Speech-to-Text Latency">
                STT: {metrics.sttLatency?.toFixed(0) || 0}ms
              </span>
              <span title="Vector DB Latency">
                DB: {metrics.dbLatency?.toFixed(0) || 0}ms
              </span>
              <span title="LLM Time to First Token">
                LLM: {metrics.llmLatency?.toFixed(0) || 0}ms
              </span>
              <span
                className="text-emerald-400 font-bold"
                title="Total E2E Latency"
              >
                Total: {metrics.totalLatency?.toFixed(0) || 0}ms
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
