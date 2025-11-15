"use client";

import { useState, useMemo, useEffect } from "react";
import IdeaCard, { Idea } from "@/components/IdeaCard";
import PostIdeaModal from "@/components/PostIdeaModal";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/moving-border";
import { Spotlight } from "@/components/ui/spotlight";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "upvotes">(
    "newest"
  );
  const [ideas, setIdeas] = useState<Idea[]>([]); // Start with empty array - only database data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract all unique tags from ideas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ideas.forEach((idea) => {
      idea.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [ideas]);

  // Fetch ideas from backend API - only display database content
  const fetchIdeas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getIdeas({
        search: searchQuery || undefined,
        tags: selectedTag ? [selectedTag] : undefined,
        sort_by: sortBy,
      });

      console.log("API Response:", response); // Debug log
      console.log("Response type:", typeof response); // Debug log
      console.log("Response keys:", response ? Object.keys(response) : "null"); // Debug log

      // Handle different response structures from backend
      // Expected format: { success: true, data: { ideas: [...] }, message: "..." }
      let ideasData: unknown = null;

      // Try different possible response structures
      if (Array.isArray(response)) {
        // Response is directly an array
        ideasData = response;
      } else if (response && typeof response === "object") {
        // Response is an object - try common keys
        const resp = response as Record<string, unknown>;

        // First check if data exists and is an object (nested structure)
        if (
          resp.data &&
          typeof resp.data === "object" &&
          !Array.isArray(resp.data)
        ) {
          // Handle nested structure: { success: true, data: { ideas: [...] } }
          const dataObj = resp.data as Record<string, unknown>;
          ideasData =
            dataObj.ideas ||
            dataObj.data ||
            dataObj.items ||
            dataObj.results ||
            dataObj.content ||
            null;
        } else if (Array.isArray(resp.data)) {
          // Handle: { success: true, data: [...] }
          ideasData = resp.data;
        } else {
          // Try top-level keys
          ideasData =
            resp.ideas ||
            resp.data ||
            resp.items ||
            resp.results ||
            resp.content ||
            null;
        }
      }

      console.log("Ideas Data:", ideasData); // Debug log
      console.log("Is Array?", Array.isArray(ideasData)); // Debug log
      console.log("Ideas Data type:", typeof ideasData); // Debug log

      if (Array.isArray(ideasData)) {
        // Convert API response to Idea format
        const formattedIdeas: Idea[] = ideasData.map(
          (item: Record<string, unknown>, index: number) => ({
            id: String(item.id || item._id || `temp-${Date.now()}-${index}`),
            title: String(item.title || "Untitled Idea"),
            description: String(item.description || ""),
            problem: String(item.problem || ""),
            solution: String(item.solution || ""),
            marketSize: (item.marketSize || item.market_size || "Medium") as
              | "Small"
              | "Medium"
              | "Large",
            tags: Array.isArray(item.tags)
              ? item.tags.map((t) => String(t))
              : [],
            author: String(item.author || item.author_name || "Anonymous"),
            createdAt: item.createdAt
              ? new Date(String(item.createdAt))
              : item.created_at
              ? new Date(String(item.created_at))
              : item.created
              ? new Date(String(item.created))
              : new Date(),
            upvotes: Number(
              item.upvotes || item.upvotes_count || item.upvote_count || 0
            ),
            views: Number(
              item.views || item.views_count || item.view_count || 0
            ),
            status: (item.status || "draft") as
              | "draft"
              | "active"
              | "validated"
              | "launched",
          })
        );
        console.log("Formatted Ideas:", formattedIdeas); // Debug log
        console.log("Formatted Ideas Count:", formattedIdeas.length); // Debug log
        // Only set ideas from database - no mock data fallback
        setIdeas(formattedIdeas);
      } else {
        // If response structure is unexpected, log everything for debugging
        console.error("Unexpected API response structure:", {
          response,
          responseType: typeof response,
          isArray: Array.isArray(response),
          keys:
            response && typeof response === "object"
              ? Object.keys(response)
              : null,
          ideasData,
          ideasDataType: typeof ideasData,
        });
        setIdeas([]);
        setError(
          `Unexpected response format from server. Received: ${typeof response}. Check browser console for full response details.`
        );
      }
    } catch (err: unknown) {
      console.error("Error fetching ideas from backend:", err);
      // Don't use mock data - show error instead
      setError(
        "Failed to load ideas from the database. Please ensure the backend is running."
      );
      setIdeas([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch ideas on component mount
  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when search/filter changes
  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTag, sortBy]);

  // Handle new idea submission
  const handlePostIdea = async (
    _ideaData: Omit<Idea, "id" | "createdAt" | "upvotes" | "views" | "status">
  ) => {
    try {
      // The API call is already handled in PostIdeaModal
      // After successful POST, refresh the ideas list from the database
      await fetchIdeas();
    } catch (err) {
      console.error("Error refreshing ideas after adding new idea:", err);
      // Don't add optimistic update - only show what's in the database
    }
  };

  // Display ideas from backend
  // Backend already handles search/filter/sort, so we just display what we get
  const filteredIdeas = useMemo(() => {
    console.log("Displaying ideas. Total ideas from backend:", ideas.length); // Debug log
    console.log("Ideas array:", ideas); // Debug log

    // Since backend already handles filtering, just return the ideas directly
    // Only do minimal client-side sorting if backend doesn't sort
    const sorted = [...ideas].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.views - a.views;
        case "upvotes":
          return b.upvotes - a.upvotes;
        case "newest":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    console.log("Final ideas to display:", sorted.length); // Debug log
    return sorted;
  }, [ideas, sortBy]);

  // Create tabs for sort options
  const sortTabs = [
    {
      title: "Newest",
      value: "newest",
      content: null,
    },
    {
      title: "Popular",
      value: "popular",
      content: null,
    },
    {
      title: "Upvoted",
      value: "upvotes",
      content: null,
    },
  ];

  const avgUpvotes =
    filteredIdeas.length > 0
      ? Math.round(
          filteredIdeas.reduce((sum, idea) => sum + idea.upvotes, 0) /
            filteredIdeas.length
        )
      : 0;

  const stats = [
    { label: "Live ideas", value: filteredIdeas.length || "—" },
    { label: "Avg. upvotes", value: avgUpvotes || "0" },
    { label: "Active founders", value: "2.4K+" },
  ];

  return (
    <div className="flex h-full flex-col gap-10 overflow-hidden px-2">
      <div className="flex flex-col gap-10">
        <section className="relative rounded-3xl border border-white/5 bg-slate-950/85 p-6 shadow-[0_25px_70px_rgba(2,6,23,0.6)] backdrop-blur-lg sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14b8a6]/50 to-transparent" />
          <Spotlight className="-top-32 right-0 md:-right-10" fill="#14b8a6" />
          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">
                  OriginHub // Quantum Board
                </p>
                <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
                  Idea Marketplace
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-300">
                  Scan live concept streams, filter by market forces, and deploy
                  AI-generated startups with cinematic precision.
                </p>
              </div>
              <Button
                as="button"
                onClick={() => setIsModalOpen(true)}
                borderRadius="1.75rem"
                className="border-white/10 bg-slate-900 text-white shadow-[0_0_45px_rgba(20,184,166,0.35)]"
                containerClassName="h-16"
                borderClassName="bg-gradient-to-r from-[#0e3a5f] via-[#14b8a6] to-[#0e3a5f]"
              >
                <span className="flex items-center gap-2 text-base font-medium">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Launch new idea
                </span>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="relative rounded-2xl border border-white/10 bg-slate-950/70 p-1 text-white">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/60">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Trace a concept, problem, or tag…"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-14 pr-4 text-base text-white placeholder-white/40 focus:border-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm uppercase tracking-[0.45em] text-white/60">
                    Sort
                  </span>
                  <div className="flex flex-1 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                    {sortTabs.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() =>
                          setSortBy(
                            tab.value as "newest" | "popular" | "upvotes"
                          )
                        }
                        className={`flex flex-1 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
                          sortBy === tab.value
                            ? "bg-[#14b8a6] text-white shadow-lg"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedTag === null
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    All tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setSelectedTag(tag === selectedTag ? null : tag)
                      }
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        selectedTag === tag
                          ? "bg-[#14b8a6] text-white"
                          : "bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(6,12,29,0.6)] backdrop-blur-lg sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/70">
                Showing{" "}
                <span className="font-semibold text-white">
                  {filteredIdeas.length}
                </span>{" "}
                {filteredIdeas.length === 1 ? "idea" : "ideas"}
                {searchQuery && <span> for &quot;{searchQuery}&quot;</span>}
                {selectedTag && <span> tagged &quot;{selectedTag}&quot;</span>}
              </p>
              <p className="text-xs uppercase tracking-[0.45em] text-white/30">
                Live feed · quantum filtered
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#14b8a6]" />
              <h3 className="mt-4 text-lg font-semibold text-white">
                Synchronizing with the grid…
              </h3>
            </div>
          )}

          {error && !isLoading && (
            <div className="mb-6 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              {error}
            </div>
          )}

          {!isLoading && filteredIdeas.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          )}

          {!isLoading && filteredIdeas.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-white">
                The radar is clear
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Adjust your query or tag filters to reveal more futuristic
                blueprints.
              </p>
            </div>
          )}
        </section>

        <PostIdeaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handlePostIdea}
        />
      </div>
    </div>
  );
}
