import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GRag — Voice RAG for Hindi & Marathi | Team Probix",
  description: "Speak a question in Hindi or Marathi. Get grounded, cited context from MSMARCO-XI in under 200ms.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230f1015'/><rect x='26' y='32' width='10' height='36' rx='5' fill='%2300f0ff'/><rect x='45' y='20' width='10' height='60' rx='5' fill='%2300f0ff'/><rect x='64' y='38' width='10' height='24' rx='5' fill='%2300f0ff'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090a0c] text-zinc-100 font-sans">
        {children}
      </body>
    </html>
  );
}
