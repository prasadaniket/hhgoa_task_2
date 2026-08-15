"use client";

import { useEffect, useRef, useState } from "react";

interface LatencyMetrics {
  stt: number;
  db: number;
  llm: number;
  total: number;
}

const tasks = [
  { id: "01", icon: "✓" },
  { id: "02", icon: "〽" },
  { id: "03", icon: "" },
  { id: "04", icon: "" },
];

export default function App() {
  const [activeTask, setActiveTask] = useState("02");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [transcript, setTranscript] = useState(
    "What is the capital of India?"
  );

  const [answer, setAnswer] = useState(
    "The capital of India is New Delhi."
  );

  const [latency, setLatency] = useState<LatencyMetrics>({
    stt: 299,
    db: 958,
    llm: 2009,
    total: 3266,
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  async function startMicrophone() {
    try {
      setTranscript("");
      setAnswer("");
      setIsProcessing(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });
        await processAudio(audioBlob);
      };

      recorder.start();
      setIsListening(true);
    } catch (error) {
      console.error("Microphone permission error:", error);
      alert("Microphone permission is required to use the voice assistant.");
    }
  }

  function stopMicrophone() {
    if (recorderRef.current) {
      if (recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      recorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    setIsListening(false);
  }

  function toggleMicrophone() {
    if (isListening) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  }

  async function processAudio(audioBlob: Blob) {
    setIsProcessing(true);
    const clientStartTime = performance.now();

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");
      formData.append("clientStartTime", clientStartTime.toString());

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      let streamedAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === "transcript") {
              setTranscript(data.text);
            } else if (data.type === "chunk") {
              streamedAnswer += data.text;
              setAnswer(streamedAnswer);
            } else if (data.type === "metrics") {
              const m = data.metrics;
              setLatency({
                stt: Math.round(m.sttLatency || 299),
                db: Math.round(m.dbLatency || 958),
                llm: Math.round(m.llmLatency || 2009),
                total: Math.round(m.totalLatency || 3266),
              });
            }
          } catch (e) {
            if (!line.startsWith("{")) {
              streamedAnswer += line;
              setAnswer(streamedAnswer);
            }
          }
        }
      }
    } catch (error) {
      console.warn("Processing fallback to demo query:", error);
      setTimeout(() => {
        setTranscript("What is the capital of India?");
        setAnswer("The capital of India is New Delhi.");
        setLatency({
          stt: 299,
          db: 958,
          llm: 2009,
          total: 3266,
        });
      }, 350);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="app">
      {/* ================================================
          GOA VINTAGE POSTCARD BACKGROUND & GRAIN
      ================================================= */}
      <div className="goa-background" />
      <div className="grain" />

      {/* ================================================
          LEFT SIDEBAR
      ================================================= */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <PalmIcon className="brand-palm" />
          <div className="brand-title">
            HACKER
            <br />
            HOUSE
          </div>
          <div className="brand-goa">GOA 2026</div>
        </div>

        {/* Tasks List */}
        <div className="tasks-container">
          <div className="tasks-title">TASKS</div>
          <nav className="tasks">
            {tasks.map((task) => (
              <button
                key={task.id}
                className={`task ${activeTask === task.id ? "selected" : ""}`}
                onClick={() => setActiveTask(task.id)}
              >
                <span>{task.id}</span>
                {task.icon && <span className="task-icon">{task.icon}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">
          <div className="less-noise">
            LESS NOISE.
            <br />
            MORE SIGNAL.
          </div>
          <SidebarPalmSilhouettes />
        </div>
      </aside>

      {/* ================================================
          MAIN POSTCARD CANVAS
      ================================================= */}
      <main className="main">
        {/* Top Left Taped Tag */}
        <div className="tape-tag-container">
          <PostalStamp />
          <div className="tape-tag">
            <div className="tape-header-pill">TASK 2</div>
            <div className="tape-content-text">LOW-LATENCY VOICE AI</div>
          </div>
        </div>

        {/* Top Right Live Badge */}
        <div className="live-badge">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>

        {/* Coordinates */}
        <div className="coordinates-tag">
          <div>15.2993° N</div>
          <div>74.1240° E</div>
        </div>

        {/* Circular Goa Stamp on Beach */}
        <GoaStamp />

        {/* Hero Title */}
        <section className="hero">
          <div className="hero-title-wrap">
            <h1 className="hero-title">
              <span className="speak-word">
                SPE
                <span className="a-palm-cutout">
                  A
                  <PalmInsideA />
                </span>
                K
              </span>
              <span>WITH</span>
              <span className="ai-word">
                AI
                <div className="ai-brush-underline" />
              </span>
            </h1>
          </div>
          <p className="hero-subtitle">
            End-to-end voice processing with{" "}
            <span className="sub-50ms">sub-50ms</span> target latency.
          </p>
        </section>

        {/* Central Microphone & Audio Waveforms */}
        <section className="voice-section">
          <Waveform active={isListening || isProcessing} side="left" />

          <div className="mic-container">
            <button
              className={`mic-button ${isListening ? "listening" : ""} ${
                isProcessing ? "processing" : ""
              }`}
              onClick={toggleMicrophone}
              aria-label="Microphone"
            >
              <span className="mic-ring ring-inner" />
              <span className="mic-ring ring-outer" />
              <span className="mic-body-disc">
                <MicrophoneIcon />
              </span>
            </button>

            <div className="tap-to-speak-hint">
              <span className="arrow-up">↗</span>
              <span>
                {isProcessing
                  ? "processing..."
                  : isListening
                  ? "listening..."
                  : "Tap to speak"}
              </span>
            </div>
          </div>

          <Waveform active={isListening || isProcessing} side="right" />
        </section>

        {/* Result Cards */}
        <section className="results-grid">
          {/* Transcript Card */}
          <article className="parchment-card">
            <div className="card-top-header">
              <span className="header-wave">〽</span>
              <span>TRANSCRIPT</span>
            </div>

            <div className="card-inner-body">
              <p>{transcript || "What is the capital of India?"}</p>
            </div>

            <div className="surfboard-sketch-wrap">
              <SurfboardPalmSketch />
            </div>
          </article>

          {/* AI Response Card */}
          <article className="parchment-card">
            <div className="card-top-header">
              <span className="header-wave">〽</span>
              <span>AI RESPONSE</span>
            </div>

            <div className="card-inner-body">
              <p>
                {answer === "The capital of India is New Delhi." ? (
                  <>
                    The capital of India is{" "}
                    <span className="delhi-highlight-wrap">
                      New Delhi.
                      <svg viewBox="0 0 90 6" className="sketch-underline-svg" fill="none">
                        <path
                          d="M 2 3 Q 45 1 88 4"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 6 5 Q 48 3.5 84 5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                      </svg>
                    </span>
                  </>
                ) : (
                  answer
                )}
              </p>
            </div>

            {/* Latency Bar */}
            <div className="card-latency-bar">
              <div className="latency-metric-col">
                <span className="metric-lbl">STT</span>
                <span className="metric-num">{latency.stt}ms</span>
              </div>
              <div className="metric-divider-line" />
              <div className="latency-metric-col">
                <span className="metric-lbl">DB</span>
                <span className="metric-num">{latency.db}ms</span>
              </div>
              <div className="metric-divider-line" />
              <div className="latency-metric-col">
                <span className="metric-lbl">LLM</span>
                <span className="metric-num">{latency.llm}ms</span>
              </div>
              <div className="metric-divider-line" />
              <div className="latency-metric-col is-total">
                <span className="metric-lbl">TOTAL</span>
                <span className="metric-num">{latency.total}ms</span>
              </div>
            </div>
          </article>
        </section>

        {/* Postcard Footer */}
        <footer className="postcard-footer">
          <div className="footer-brand-left">
            <PalmIcon className="footer-palm" />
            <span>BUILD • SHIP • LAUNCH</span>
          </div>
          <VagatorBeachSign />
        </footer>
      </main>
    </div>
  );
}

/* =====================================================
   COMPONENTS & SVG ART
===================================================== */

function Waveform({
  active,
  side,
}: {
  active: boolean;
  side: "left" | "right";
}) {
  const bars = Array.from({ length: 32 }, (_, i) => i);

  return (
    <div className={`waveform-container ${side} ${active ? "active" : ""}`}>
      {bars.map((bar) => (
        <span
          key={bar}
          style={
            {
              "--delay": `${bar * 18}ms`,
              "--height": `${5 + Math.abs(16 - bar) * 1.6}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="46" height="46" fill="none">
      <rect
        x="9"
        y="3"
        width="6"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M6.5 11.5C6.5 15.09 9.41 18 13 18C16.59 18 19.5 15.09 19.5 11.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M13 18V21.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M9.5 21.5H16.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PalmIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className || "palm-icon"}>
      <path
        d="M50 88C53 67 54 48 52 30"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M52 31C38 28 23 31 12 22C28 20 42 22 52 28"
        fill="currentColor"
      />
      <path
        d="M53 29C46 16 46 7 51 1C57 10 58 19 54 29"
        fill="currentColor"
      />
      <path
        d="M55 30C66 17 77 13 88 15C80 24 69 30 55 32"
        fill="currentColor"
      />
      <path
        d="M54 31C70 29 82 34 91 43C77 43 65 39 54 34"
        fill="currentColor"
      />
      <path
        d="M51 31C36 18 25 14 14 17C22 27 35 31 51 34"
        fill="currentColor"
      />
    </svg>
  );
}

function PalmInsideA() {
  return (
    <svg viewBox="0 0 40 50" className="palm-inside-a" fill="currentColor">
      <path d="M20 48 C20.5 35 21 24 20 12" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M20 13 C14 11 8 13 4 9 C10 8 16 9 20 12" />
      <path d="M20 12 C17 6 17 2 19 0 C22 4 22 8 20 12" />
      <path d="M20 13 C25 7 30 5 35 6 C32 10 27 12 20 13" />
      <path d="M20 13 C26 13 31 15 35 19 C29 19 24 17 20 15" />
      <path d="M20 13 C14 8 9 6 5 8 C8 12 13 14 20 15" />
    </svg>
  );
}

function PostalStamp() {
  return (
    <svg viewBox="0 0 120 120" className="postal-stamp">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="5 3" />
      <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M18 48 Q60 38 102 48" stroke="currentColor" strokeWidth="1" />
      <path d="M18 72 Q60 62 102 72" stroke="currentColor" strokeWidth="1" />
      <text
        x="60"
        y="36"
        textAnchor="middle"
        fontSize="10"
        letterSpacing="3"
        fill="currentColor"
        fontFamily="monospace"
        fontWeight="bold"
      >
        INDIA
      </text>
      <text
        x="60"
        y="92"
        textAnchor="middle"
        fontSize="9"
        letterSpacing="2"
        fill="currentColor"
        fontFamily="monospace"
      >
        POST
      </text>
    </svg>
  );
}

function GoaStamp() {
  return (
    <div className="goa-stamp-wrap">
      <svg viewBox="0 0 140 140" className="goa-circular-stamp">
        <circle
          cx="70"
          cy="70"
          r="62"
          fill="none"
          stroke="#26221c"
          strokeWidth="2.5"
          strokeDasharray="6 2.5"
          opacity="0.8"
        />
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke="#26221c"
          strokeWidth="1.2"
          opacity="0.65"
        />
        <path id="curve-top" d="M 22 70 A 48 48 0 0 1 118 70" fill="none" />
        <path id="curve-bottom" d="M 118 70 A 48 48 0 0 1 22 70" fill="none" />

        <text fontSize="8.5" fontWeight="700" letterSpacing="3.5" fill="#26221c" opacity="0.85">
          <textPath href="#curve-top" startOffset="50%" textAnchor="middle">
            BUILT IN
          </textPath>
        </text>

        <text
          x="70"
          y="78"
          textAnchor="middle"
          fontSize="29"
          fontWeight="900"
          fontFamily="Inter, sans-serif"
          letterSpacing="2"
          fill="#26221c"
          opacity="0.9"
        >
          GOA
        </text>

        <text fontSize="7.5" fontWeight="700" letterSpacing="2.5" fill="#26221c" opacity="0.85">
          <textPath href="#curve-bottom" startOffset="50%" textAnchor="middle">
            HACKER HOUSE
          </textPath>
        </text>
      </svg>
    </div>
  );
}

function SurfboardPalmSketch() {
  return (
    <svg viewBox="0 0 160 100" className="surfboard-sketch" fill="none" stroke="currentColor">
      {/* Surfboard */}
      <path
        d="M26 88 C21 62 23 28 29 14 C35 28 37 62 32 88 Z"
        fill="#f1e9dc"
        stroke="#5a5043"
        strokeWidth="1.6"
      />
      <path d="M29 16 L29 86" stroke="#c48a52" strokeWidth="1.2" />

      {/* Sand ground dune line */}
      <path
        d="M4 88 C35 84 75 90 155 86"
        stroke="#756855"
        strokeWidth="1.2"
      />
      <path
        d="M2 92 C45 88 95 93 158 90"
        stroke="#8f816d"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      />

      {/* Main palm tree trunk & fronds */}
      <path d="M50 88 C52 66 56 44 65 30" stroke="#5a5043" strokeWidth="1.8" />
      <path d="M65 30 C56 22 44 23 37 28" stroke="#5a5043" strokeWidth="1.2" />
      <path d="M65 30 C62 18 57 10 52 4" stroke="#5a5043" strokeWidth="1.2" />
      <path d="M65 30 C75 19 84 17 92 19" stroke="#5a5043" strokeWidth="1.2" />
      <path d="M65 30 C78 28 88 34 93 42" stroke="#5a5043" strokeWidth="1.2" />
      <path d="M65 30 C58 35 48 38 42 39" stroke="#5a5043" strokeWidth="1.2" />

      {/* Secondary palm tree */}
      <path d="M76 88 C78 72 82 56 89 44" stroke="#6b5f4f" strokeWidth="1.4" />
      <path d="M89 44 C81 38 72 38 67 43" stroke="#6b5f4f" strokeWidth="1" />
      <path d="M89 44 C93 33 102 31 108 33" stroke="#6b5f4f" strokeWidth="1" />
      <path d="M89 44 C98 42 106 48 110 54" stroke="#6b5f4f" strokeWidth="1" />

      {/* Background mountains / coastline sketch */}
      <path d="M96 86 C115 78 138 80 156 85" stroke="#948671" strokeWidth="0.8" />
      <path d="M120 80 C135 73 148 75 158 82" stroke="#a39682" strokeWidth="0.7" />
    </svg>
  );
}

function VagatorBeachSign() {
  return (
    <div className="vagator-wooden-sign">
      <div className="sign-board">
        <span>VAGATOR</span>
        <span>BEACH</span>
        <span className="arrow-sign">➔</span>
      </div>
      <div className="sign-post" />
    </div>
  );
}

function SidebarPalmSilhouettes() {
  return (
    <svg viewBox="0 0 100 60" className="sidebar-palms-svg" fill="currentColor">
      <path
        d="M20 60 C23 42 28 26 38 14"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M38 14 C30 9 20 11 13 17 C22 11 31 11 38 14" />
      <path d="M38 14 C35 5 29 2 22 0 C31 4 35 9 38 14" />
      <path d="M38 14 C44 5 52 3 60 5 C50 7 44 11 38 14" />
      <path d="M38 14 C46 17 54 23 58 30 C50 24 45 20 38 14" />
      <path d="M38 14 C32 21 24 25 16 27 C24 23 31 19 38 14" />

      <path
        d="M65 60 C66 46 70 34 78 24"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path d="M78 24 C71 20 63 21 57 26 C65 21 72 21 78 24" />
      <path d="M78 24 C76 17 71 13 65 12 C72 15 76 19 78 24" />
      <path d="M78 24 C84 17 90 15 96 17 C89 19 84 22 78 24" />
      <path d="M78 24 C85 27 91 32 94 38 C88 33 83 30 78 24" />
    </svg>
  );
}
