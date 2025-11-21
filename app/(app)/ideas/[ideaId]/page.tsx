"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Idea } from "@/components/IdeaCard";
import { useApiClient } from "@/lib/api-client";
import EditIdeaModal from "@/components/EditIdeaModal";
import { Button } from "@/components/ui/moving-border";
import CommentsList from "@/components/CommentsList";

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const apiClient = useApiClient();
  const ideaId = params.ideaId as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  // Use ref to track if views have been incremented for this ideaId (persists across re-renders)
  const hasIncrementedViewsRef = useRef<string | null>(null);

  // Check if current user is the owner of the idea
  const isOwner = idea && user && idea.user_id === user.id;

  // Reset the ref when ideaId changes
  useEffect(() => {
    hasIncrementedViewsRef.current = null;
  }, [ideaId]);

  // Check upvote status when idea loads or when user changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!ideaId || !user?.id) {
        // If not authenticated, user can't have upvoted
        setHasUpvoted(false);
        return;
      }

      try {
        const response = await apiClient.checkUpvoteStatus(ideaId);

        // Handle response structure
        let hasUpvotedValue = false;
        if (response && typeof response === "object") {
          const resp = response as Record<string, unknown>;
          if (typeof resp.has_upvoted === "boolean") {
            hasUpvotedValue = resp.has_upvoted;
          } else if (resp.data && typeof resp.data === "object") {
            const data = resp.data as Record<string, unknown>;
            if (typeof data.has_upvoted === "boolean") {
              hasUpvotedValue = data.has_upvoted;
            }
          }
        }

        setHasUpvoted(hasUpvotedValue);
      } catch (error) {
        // If endpoint doesn't exist or user is not authenticated, default to false
        console.warn("Could not check upvote status:", error);
        setHasUpvoted(false);
      }
    };

    if (ideaId && user?.id) {
      checkStatus();
    } else {
      setHasUpvoted(false);
    }
  }, [ideaId, user?.id, apiClient]);

  useEffect(() => {
    const fetchIdeaAndIncrementViews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch idea details
        const response = await apiClient.getIdea(ideaId);

        // Handle different response structures
        let ideaData: unknown = null;
        if (response && typeof response === "object") {
          const resp = response as Record<string, unknown>;
          if (resp.data && typeof resp.data === "object") {
            ideaData = resp.data;
          } else {
            ideaData = response;
          }
        } else {
          ideaData = response;
        }

        if (ideaData && typeof ideaData === "object") {
          const item = ideaData as Record<string, unknown>;
          const formattedIdea: Idea = {
            id: String(item.id || item._id || ideaId),
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
            author: String(
              item.author ||
                item.author_name ||
                (typeof item.author === "object" && item.author
                  ? `${
                      (
                        item.author as {
                          first_name?: string;
                          last_name?: string;
                        }
                      ).first_name || ""
                    } ${
                      (
                        item.author as {
                          first_name?: string;
                          last_name?: string;
                        }
                      ).last_name || ""
                    }`.trim()
                  : "Anonymous")
            ),
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
            status: (item.link ? "posted" : item.status || "draft") as
              | "draft"
              | "active"
              | "validated"
              | "launched"
              | "posted",
            user_id: item.user_id
              ? String(item.user_id)
              : item.clerk_user_id
              ? String(item.clerk_user_id)
              : undefined,
            link:
              item.link || item.solution_link || item.solutionLink
                ? String(item.link || item.solution_link || item.solutionLink)
                : undefined,
          };
          setIdea(formattedIdea);

          // 2. Increment views (only once per ideaId)
          // Check if we've already incremented views for this specific ideaId
          // Set the ref synchronously BEFORE the async call to prevent race conditions
          if (hasIncrementedViewsRef.current !== ideaId) {
            // Mark that we're incrementing for this ideaId (set synchronously to prevent double calls)
            hasIncrementedViewsRef.current = ideaId;

            // Use an IIFE to ensure the increment happens asynchronously but only once
            (async () => {
              try {
                const viewResponse = await apiClient.incrementIdeaViews(ideaId);

                // Handle response structure
                let updatedIdeaData: unknown = null;
                if (viewResponse && typeof viewResponse === "object") {
                  const resp = viewResponse as Record<string, unknown>;
                  if (resp.data && typeof resp.data === "object") {
                    updatedIdeaData = resp.data;
                  } else {
                    updatedIdeaData = viewResponse;
                  }
                } else {
                  updatedIdeaData = viewResponse;
                }

                // Update idea with new view count if response is valid
                if (updatedIdeaData && typeof updatedIdeaData === "object") {
                  const updatedItem = updatedIdeaData as Record<
                    string,
                    unknown
                  >;
                  const newViews = Number(
                    updatedItem.views ||
                      updatedItem.views_count ||
                      updatedItem.view_count ||
                      formattedIdea.views + 1
                  );

                  // Update the idea with incremented view count
                  setIdea((prev) => {
                    if (!prev) return prev;
                    return { ...prev, views: newViews };
                  });
                } else {
                  // Fallback: optimistically increment views
                  setIdea((prev) => {
                    if (!prev) return prev;
                    return { ...prev, views: prev.views + 1 };
                  });
                }
              } catch (viewError) {
                // Silently fail - views are not critical, don't block page load
                console.warn("Failed to increment views:", viewError);
                // Optionally do optimistic update
                setIdea((prev) => {
                  if (!prev) return prev;
                  return { ...prev, views: prev.views + 1 };
                });
                // Reset the ref on error so it can retry if needed
                hasIncrementedViewsRef.current = null;
              }
            })();
          }
        } else {
          setError("Invalid response format from server.");
        }
      } catch (err: unknown) {
        console.error("Error fetching idea:", err);
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: {
              status?: number;
              data?: { error?: string; message?: string };
            };
          };
          if (axiosError.response?.status === 404) {
            setError("Idea not found.");
          } else if (axiosError.response?.data?.error) {
            setError(axiosError.response.data.error);
          } else if (axiosError.response?.data?.message) {
            setError(axiosError.response.data.message);
          } else {
            setError("Failed to load idea. Please try again.");
          }
        } else {
          setError("Failed to load idea. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (ideaId) {
      fetchIdeaAndIncrementViews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  // Handle ESC key to close delete modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDeleteModalOpen && !isDeleting) {
        setIsDeleteModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isDeleteModalOpen, isDeleting]);

  const handleUpdate = (updatedIdea: Idea) => {
    setIdea(updatedIdea);
  };

  const handleUpvoteToggle = async () => {
    if (!idea || isUpvoting || !user?.id) {
      if (!user?.id) {
        // Could show a toast or alert here
        console.log("Please sign in to upvote ideas");
      }
      return;
    }

    setIsUpvoting(true);
    try {
      let response;
      let newUpvotes: number;

      if (hasUpvoted) {
        // Remove upvote
        response = await apiClient.removeUpvote(idea.id);
      } else {
        // Add upvote
        response = await apiClient.upvoteIdea(idea.id);
      }

      // Handle response structure
      let updatedIdeaData: unknown = null;
      if (response && typeof response === "object") {
        const resp = response as Record<string, unknown>;
        if (resp.data && typeof resp.data === "object") {
          updatedIdeaData = resp.data;
        } else {
          updatedIdeaData = response;
        }
      } else {
        updatedIdeaData = response;
      }

      if (updatedIdeaData && typeof updatedIdeaData === "object") {
        const updatedItem = updatedIdeaData as Record<string, unknown>;
        newUpvotes = Number(
          updatedItem.upvotes ||
            updatedItem.upvotes_count ||
            updatedItem.upvote_count ||
            idea.upvotes
        );

        // Check if response includes upvote status
        const upvotedStatus =
          updatedItem.upvoted !== undefined
            ? Boolean(updatedItem.upvoted)
            : !hasUpvoted; // Toggle if not provided

        // Update the idea with new upvote count
        setIdea((prev) => {
          if (!prev) return prev;
          return { ...prev, upvotes: newUpvotes };
        });
        setHasUpvoted(upvotedStatus);
      } else {
        // Fallback: optimistically update
        setIdea((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            upvotes: hasUpvoted ? prev.upvotes - 1 : prev.upvotes + 1,
          };
        });
        setHasUpvoted(!hasUpvoted);
      }
    } catch (error: unknown) {
      console.error("Error toggling upvote:", error);

      // Handle specific errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("already upvoted")) {
        setHasUpvoted(true); // Sync state
        console.warn("You have already upvoted this idea");
      } else if (errorMessage.includes("not upvoted")) {
        setHasUpvoted(false); // Sync state
        console.warn("You have not upvoted this idea");
      }
      // Don't show alert, just log the error
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleDelete = async () => {
    if (!idea) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteIdea(idea.id);
      // Redirect to marketplace after successful deletion
      router.push("/marketplace");
    } catch (err: unknown) {
      console.error("Error deleting idea:", err);
      setIsDeleting(false);
      // Show error message
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { error?: string; message?: string } };
        };
        if (axiosError.response?.data?.error) {
          setError(axiosError.response.data.error);
        } else if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError("Failed to delete idea. Please try again.");
        }
      } else {
        setError("Failed to delete idea. Please try again.");
      }
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#14b8a6]" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            Loading idea...
          </h3>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-white">
            {error || "Idea not found"}
          </h3>
          <button
            onClick={() => router.push("/marketplace")}
            className="mt-4 rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 max-w-6xl mx-auto w-full">
      {/* Compact Header with Back Button and Actions */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:border-[#14b8a6]/50 hover:bg-slate-800 hover:text-[#14b8a6]"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Button
              as="button"
              onClick={() => setIsEditModalOpen(true)}
              borderRadius="1rem"
              className="border-white/10 bg-slate-800/80 text-white shadow-[0_0_20px_rgba(20,184,166,0.2)]"
              containerClassName="h-9"
              borderClassName="bg-gradient-to-r from-[#0e3a5f] via-[#14b8a6] to-[#0e3a5f]"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </span>
            </Button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Content - Compact Layout */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section with Title and Stats */}
        <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 p-6 shadow-2xl border border-slate-700/50">
          <div className="relative z-10">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">
                  {idea.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium text-slate-300">
                      {idea.author}
                    </span>
                  </div>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{idea.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {idea.link && (
                <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-green-400 border border-green-500/30">
                  ✓ Posted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections - Side by Side Layout */}
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <section className="rounded-xl bg-slate-800/60 backdrop-blur-sm p-5 border border-slate-700/50 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14b8a6]/20">
                  <svg
                    className="h-4 w-4 text-[#14b8a6]"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Description
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                {idea.description}
              </p>
            </section>

            {/* Problem */}
            <section className="rounded-xl bg-gradient-to-br from-purple-950/20 to-indigo-950/20 backdrop-blur-sm p-5 border border-purple-500/20 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
                  <svg
                    className="h-4 w-4 text-purple-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Problem Statement
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                {idea.problem}
              </p>
            </section>

            {/* Solution */}
            <section className="rounded-xl bg-gradient-to-br from-teal-950/20 to-cyan-950/20 backdrop-blur-sm p-5 border border-[#14b8a6]/20 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14b8a6]/20">
                  <svg
                    className="h-4 w-4 text-[#14b8a6]"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Solution</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                {idea.solution}
              </p>
            </section>

            {/* Solution Link */}
            {idea.link && (
              <section className="rounded-xl bg-gradient-to-r from-[#14b8a6]/10 via-[#14b8a6]/5 to-[#0e3a5f]/10 backdrop-blur-sm p-5 border border-[#14b8a6]/30 shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14b8a6]/20">
                    <svg
                      className="h-4 w-4 text-[#14b8a6]"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Startup Link
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <a
                    href={idea.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-[#14b8a6] hover:text-[#0d9488] font-medium break-all underline transition-colors"
                  >
                    {idea.link}
                  </a>
                  <a
                    href={idea.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#14b8a6] to-[#0d9488] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#14b8a6]/25 transition-all hover:shadow-xl hover:shadow-[#14b8a6]/40 hover:scale-105 whitespace-nowrap"
                  >
                    <span>Visit</span>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tags */}
            <section className="rounded-xl bg-slate-800/60 backdrop-blur-sm p-5 border border-slate-700/50 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14b8a6]/20">
                  <svg
                    className="h-4 w-4 text-[#14b8a6]"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {idea.tags.length > 0 ? (
                  idea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-lg bg-[#14b8a6]/15 px-3 py-1.5 text-xs font-medium text-[#14b8a6] border border-[#14b8a6]/30 hover:bg-[#14b8a6]/25 transition-colors"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No tags</span>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Stats Bar - Before Comments */}
        <div className="mb-6 rounded-xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 p-5 shadow-xl border border-slate-700/50">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handleUpvoteToggle}
              disabled={isUpvoting || !user}
              className={`group flex flex-col items-center gap-2 rounded-lg px-4 py-4 transition-all ${
                hasUpvoted
                  ? "bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/40"
                  : "hover:bg-slate-800/50 text-slate-300 border border-slate-700/50"
              } ${
                isUpvoting || !user
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              title={
                !user
                  ? "Sign in to upvote"
                  : hasUpvoted
                  ? "Remove upvote"
                  : "Upvote"
              }
            >
              <svg
                className={`h-6 w-6 transition-transform ${
                  hasUpvoted
                    ? "text-[#14b8a6]"
                    : "text-slate-400 group-hover:text-[#14b8a6]"
                }`}
                fill={hasUpvoted ? "currentColor" : "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="text-2xl font-bold">{idea.upvotes}</span>
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Upvotes
              </span>
            </button>
            <div className="flex flex-col items-center gap-2 rounded-lg px-4 py-4 border border-slate-700/50 bg-slate-800/30">
              <svg
                className="h-6 w-6 text-[#14b8a6]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-2xl font-bold text-white">
                {idea.views}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Views
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg px-4 py-4 border border-slate-700/50 bg-slate-800/30">
              <svg
                className="h-6 w-6 text-[#14b8a6]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-2xl font-bold text-white">
                {idea.marketSize}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Market Size
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsList ideaId={idea.id} ideaOwnerId={idea.user_id} />
      </div>

      {/* Edit Modal */}
      {idea && (
        <EditIdeaModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          idea={idea}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-50 mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 bg-slate-950 text-white shadow-[0_25px_120px_rgba(239,68,68,0.3)]">
            {/* Header */}
            <div className="border-b border-red-500/20 bg-gradient-to-r from-red-900/50 to-red-800/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Delete Idea</h2>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-slate-300">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  &quot;{idea?.title}&quot;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 border-t border-red-500/20 bg-slate-900/80 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="rounded-lg border border-white/20 px-6 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete Idea"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
