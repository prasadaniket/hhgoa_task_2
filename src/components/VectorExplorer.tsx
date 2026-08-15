"use client";

import {
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ChunkItem {
  id: string;
  passage_id: string;
  title: string;
  text: string;
  category: string;
  language: string;
  source: string;
  indexed_at: string;
  embedding_dim: number;
}

export function VectorExplorer() {
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChunks = async (searchQuery = search, cat = selectedCategory) => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (cat && cat !== "all") params.set("category", cat);

      const res = await fetch(`/api/chunks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch vector chunks from MongoDB");

      const data = await res.json();
      setChunks(data.chunks || []);
      setTotalCount(data.totalCount || 0);
      if (data.categories) setCategories(data.categories);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not connect to MongoDB Atlas");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChunks("", "all");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChunks(search, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchChunks(search, cat);
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase tracking-widest text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-full">
              <Database className="w-3.5 h-3.5" /> Live Vector Database
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {totalCount} Real Chunks in MongoDB
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 font-sans">
            Vector Chunks Explorer{" "}
            <span className="text-xs font-mono font-normal text-zinc-400">
              ai_demo.chunks
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchChunks()}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#0f1015] hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00f0ff]" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
            Dataset: ai4bharat/MSMARCO-XI
          </span>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chunks by title, text, or passage ID..."
            className="w-full bg-[#0f1015]/90 border border-zinc-800/80 focus:border-[#00f0ff] rounded-xl pl-9 pr-20 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchChunks("", selectedCategory);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-bold"
                  : "bg-[#0f1015] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-xl bg-[#0f1015]/90 border border-zinc-800/50 space-y-3 animate-pulse"
            >
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-5 bg-zinc-800 rounded w-3/4" />
              <div className="h-12 bg-zinc-900 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error Notice */}
      {!loading && error && (
        <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>⚠️ MongoDB Atlas Error:</span>
          </div>
          <p className="text-zinc-400">{error}</p>
        </div>
      )}

      {/* Chunk Cards Grid */}
      {!loading && !error && (
        <>
          {chunks.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#0f1015]/80 border border-zinc-800 text-zinc-500 font-mono text-xs space-y-2">
              <p>No matching chunks found for query "{search}".</p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  fetchChunks("", "all");
                }}
                className="text-[#00f0ff] underline cursor-pointer"
              >
                Reset search & filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chunks.map((chunk) => {
                const isExpanded = expandedId === chunk.id;
                return (
                  <div
                    key={chunk.id}
                    className="p-5 rounded-xl bg-[#0f1015]/90 backdrop-blur-md border border-zinc-800/60 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2.5">
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-emerald-400 font-bold tracking-wide">
                          {chunk.passage_id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 capitalize">
                            {chunk.category}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] font-bold border border-[#00f0ff]/20 uppercase">
                            {chunk.language}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-zinc-100 text-sm group-hover:text-[#00f0ff] transition-colors leading-snug">
                        {chunk.title}
                      </h4>

                      {/* Text Excerpt / Full Text */}
                      <p
                        className={`text-xs text-zinc-400 leading-relaxed font-mono ${
                          isExpanded ? "" : "line-clamp-3"
                        }`}
                      >
                        "{chunk.text}"
                      </p>
                    </div>

                    {/* Footer Details */}
                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#00f0ff]" />
                        {chunk.embedding_dim}d vector
                      </span>

                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : chunk.id)
                        }
                        className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? "Collapse" : "Full Text"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
