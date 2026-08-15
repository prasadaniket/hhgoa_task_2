import { VoiceInterface } from "@/components/VoiceInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-zinc-950 text-zinc-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-900/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-900/50 lg:p-4">
          Task 2: Low-Latency Voice AI
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl gap-8 mt-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Speak with AI</h1>
          <p className="text-zinc-400">
            End-to-end voice processing with sub-50ms target latency.
          </p>
        </div>

        <VoiceInterface />
      </div>
    </main>
  );
}
