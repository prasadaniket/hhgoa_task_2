"use client";

import { InteractiveBg } from "@/components/InteractiveBg";
import { TelemetryProfiler } from "@/components/TelemetryProfiler";
import { VectorExplorer } from "@/components/VectorExplorer";
import { VoiceInterface } from "@/components/VoiceInterface";
import gsap from "gsap";
import { Zap } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Home() {
  const headerRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const voiceSectionRef = useRef<HTMLElement | null>(null);
  const chunksSectionRef = useRef<HTMLElement | null>(null);
  const telemetrySectionRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // GSAP Staggered Entrance Animations
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
      }

      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: "power3.out" }
        );
      }

      if (voiceSectionRef.current) {
        gsap.fromTo(
          voiceSectionRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, delay: 0.3, ease: "power3.out" }
        );
      }

      if (chunksSectionRef.current) {
        gsap.fromTo(
          chunksSectionRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, delay: 0.45, ease: "power3.out" }
        );
      }

      if (telemetrySectionRef.current) {
        gsap.fromTo(
          telemetrySectionRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, delay: 0.6, ease: "power3.out" }
        );
      }

      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1, delay: 0.75, ease: "power2.out" }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#090a0c] text-zinc-100 selection:bg-[#00f0ff] selection:text-black flex flex-col justify-between overflow-x-hidden">
      {/* Live Interactive Background */}
      <InteractiveBg />

      {/* =====================================================
          1. FIXED TOP HEADER (GSAP ANIMATED)
      ====================================================== */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 w-full px-6 sm:px-12 lg:px-16 py-4 flex items-center justify-between opacity-0"
      >
        <div className="flex items-center gap-3">
          {/* Audio Equalizer Icon Mark */}
          <div className="w-9 h-9 rounded-lg bg-[#0f1015] border border-zinc-800/60 p-2 flex items-center justify-center gap-1">
            <span className="w-1 h-3.5 rounded-full bg-[#00f0ff]" />
            <span className="w-1 h-5 rounded-full bg-[#00f0ff]" />
            <span className="w-1 h-2.5 rounded-full bg-[#00f0ff]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                GRag
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f1015] border border-zinc-800/60 text-zinc-400 font-semibold">
                v2.0
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Voice RAG • Multi Language
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800/60 bg-[#0f1015] text-zinc-400">
            <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>sub-200ms target</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800/60 bg-[#0f1015] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ready</span>
          </div>
        </div>
      </header>

      {/* =====================================================
          2. MAIN CONTENT
      ====================================================== */}
      <div className="app-content relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-28 pb-16 flex-1 space-y-16">

        {/* =====================================================
            HERO INTRO SECTION
        ====================================================== */}
        <section ref={heroRef} className="text-center space-y-5 max-w-3xl mx-auto opacity-0 pt-4">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-zinc-300 bg-[#0f1015]/90 border border-zinc-800/80 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            <span>Voice RAG · Indic Multilingual · 241,572 Chunks</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight font-sans">
            Sub-50ms Voice Intelligence{" "}
            <span className="bg-gradient-to-r from-[#00f0ff] via-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">
              Engine
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Speak in Hindi, Marathi, or English. Retrieve vector-grounded context from{" "}
            <span className="text-zinc-200 font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              ai4bharat/MSMARCO-XI
            </span>{" "}
            with end-to-end telemetry in under 200ms.
          </p>

          {/* Feature Highlights Pill Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs font-mono text-zinc-400">
            <span className="px-2.5 py-1 rounded-md bg-[#0f1015] border border-zinc-800/60 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00f0ff]" /> &lt;200ms Target
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#0f1015] border border-zinc-800/60 flex items-center gap-1.5">
              <span className="text-emerald-400">●</span> Sarvam Saaras v3
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#0f1015] border border-zinc-800/60 flex items-center gap-1.5">
              <span className="text-[#00f0ff]">●</span> MongoDB Atlas HNSW
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#0f1015] border border-zinc-800/60 flex items-center gap-1.5">
              <span className="text-purple-400">●</span> Guardrail Verified
            </span>
          </div>
        </section>

        {/* Hero Voice Console */}
        <section ref={voiceSectionRef} id="voice-console" className="w-full opacity-0">
          <VoiceInterface />
        </section>

        {/* Live Vector Database Chunks Explorer (Connected to MongoDB Atlas) */}
        <section ref={chunksSectionRef} id="vector-chunks" className="w-full pt-8 border-t border-zinc-800/30 opacity-0">
          <VectorExplorer />
        </section>

        {/* Live Latency Telemetry Profiler & Benchmark Engine */}
        <section ref={telemetrySectionRef} id="telemetry-architecture" className="w-full pt-8 border-t border-zinc-800/30 opacity-0">
          <TelemetryProfiler />
        </section>

      </div>

      {/* =====================================================
          3. REDESIGNED FOOTER (GSAP ANIMATED, MULTI-COLUMN)
      ====================================================== */}
      <footer
        ref={footerRef}
        className="relative z-10 w-full pt-12 pb-8 px-6 sm:px-12 lg:px-16 font-mono text-xs text-zinc-400 opacity-0 space-y-10"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Core Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0f1015] border border-zinc-800/80 p-1.5 flex items-center justify-center gap-0.5">
                <span className="w-0.5 h-2.5 rounded-full bg-[#00f0ff]" />
                <span className="w-0.5 h-4 rounded-full bg-[#00f0ff]" />
                <span className="w-0.5 h-2 rounded-full bg-[#00f0ff]" />
              </div>
              <span className="text-white font-bold text-base tracking-tight font-mono">
                GRag
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                v2.0
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans">
              High-throughput, sub-50ms Voice Retrieval-Augmented Generation engine engineered for Indic languages.
            </p>
          </div>

          {/* Col 2: Hackathon & Official Site */}
          <div className="space-y-2.5">
            <span className="text-white font-bold text-xs uppercase tracking-wider block">
              Event & Challenge
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://hhgoa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-[#00f0ff] underline underline-offset-2 transition-colors flex items-center gap-1 font-semibold"
                >
                  Hacker House Goa (hhgoa.com ↗)
                </a>
              </li>
              <li className="text-zinc-400">Task 2: Voice-Enabled RAG</li>
              <li className="text-zinc-400">Timeline: Aug 13 – Aug 22, 2026</li>
            </ul>
          </div>

          {/* Col 3: Dataset & Corpus */}
          <div className="space-y-2.5">
            <span className="text-white font-bold text-xs uppercase tracking-wider block">
              Dataset & Knowledge
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://huggingface.co/datasets/ai4bharat/MSMARCO-XI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-[#00f0ff] underline underline-offset-2 transition-colors flex items-center gap-1"
                >
                  ai4bharat/MSMARCO-XI ↗
                </a>
              </li>
              <li className="text-zinc-400">241,572 Multilingual Chunks</li>
              <li className="text-zinc-400">Hindi · Marathi · English</li>
            </ul>
          </div>

          {/* Col 4: Team & Mandatory Hashtag */}
          <div className="space-y-3 flex flex-col items-start lg:items-end">
            <span className="text-white font-bold text-xs uppercase tracking-wider">
              Submission & Team
            </span>
            <div className="text-zinc-300 text-xs">
              Built with precision by <strong className="text-white font-bold">Team Probix</strong>
            </div>
            <a
              href="https://hhgoa.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-extrabold text-xs tracking-wider shadow-sm hover:bg-[#00f0ff]/20 transition-colors"
            >
              <span>#RAGInGoa</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500 font-mono">
          <div>
            © 2026 GRag by Team Probix · Built for Hacker House Goa Task 2
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">Pipeline Latency Budget: &lt;200ms</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
