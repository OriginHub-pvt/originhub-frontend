"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Idea } from "@/components/IdeaCard";
import { useApiClient } from "@/lib/api-client";
import EditIdeaModal from "@/components/EditIdeaModal";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Button } from "@/components/ui/moving-border";

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const apiClient = useApiClient();
  const ideaId = params.ideaId as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current user is the owner of the idea
  const isOwner = idea && user && idea.user_id === user.id;

  useEffect(() => {
    const fetchIdea = async () => {
      setIsLoading(true);
      setError(null);
      try {
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
                (item.author_name ||
                  (typeof item.author === "object" && item.author
                    ? `${(item.author as { first_name?: string; last_name?: string }).first_name || ""} ${(item.author as { first_name?: string; last_name?: string }).last_name || ""}`.trim()
                    : "Anonymous"))
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
            status: (item.status || "draft") as
              | "draft"
              | "active"
              | "validated"
              | "launched",
            user_id: item.user_id
              ? String(item.user_id)
              : item.clerk_user_id
              ? String(item.clerk_user_id)
              : undefined,
          };
          setIdea(formattedIdea);
        } else {
          setError("Invalid response format from server.");
        }
      } catch (err: unknown) {
        console.error("Error fetching idea:", err);
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: { status?: number; data?: { error?: string; message?: string } };
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
      fetchIdea();
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

  const statusColors = {
    draft: "bg-slate-700 text-slate-300",
    active: "bg-blue-900 text-blue-300",
    validated: "bg-teal-900 text-teal-300",
    launched: "bg-green-900 text-green-300",
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
    <div className="flex h-full flex-col gap-6 px-2 py-6">
      {/* Header with Back Button and Edit Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-[#14b8a6] hover:text-[#14b8a6]"
        >
          <svg
            className="h-4 w-4"
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
          <div className="flex items-center gap-3">
            <Button
              as="button"
              onClick={() => setIsEditModalOpen(true)}
              borderRadius="1.75rem"
              className="border-white/10 bg-slate-900 text-white shadow-[0_0_45px_rgba(20,184,166,0.35)]"
              containerClassName="h-12"
              borderClassName="bg-gradient-to-r from-[#0e3a5f] via-[#14b8a6] to-[#0e3a5f]"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Idea
              </span>
            </Button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/20"
            >
              <svg
                className="h-4 w-4"
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

      {/* Main Content */}
      <div className="flex-1">
        <BackgroundGradient className="rounded-2xl bg-slate-800 p-8 shadow-xl">
          {/* Title and Status */}
          <div className="mb-6 flex items-start justify-between border-b border-slate-700 pb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white">{idea.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span>by {idea.author}</span>
                <span>·</span>
                <span>{idea.createdAt.toLocaleDateString()}</span>
                <span>·</span>
                <span>{idea.views} views</span>
                <span>·</span>
                <span>{idea.upvotes} upvotes</span>
              </div>
            </div>
            <span
              className={`ml-4 rounded-full px-4 py-2 text-sm font-medium capitalize ${
                statusColors[idea.status]
              }`}
            >
              {idea.status}
            </span>
          </div>

          {/* Description Section */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-white">Description</h2>
            <div className="rounded-lg bg-slate-900/70 p-6 border border-slate-700">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>
          </section>

          {/* Problem Section */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-white">
              Problem Statement
            </h2>
            <div className="rounded-lg bg-slate-900/70 p-6 border border-slate-700">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {idea.problem}
              </p>
            </div>
          </section>

          {/* Solution Section */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-white">Solution</h2>
            <div className="rounded-lg bg-slate-900/70 p-6 border border-slate-700">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {idea.solution}
              </p>
            </div>
          </section>

          {/* Metadata Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Market Size */}
            <div className="rounded-lg bg-slate-900/70 p-6 border border-slate-700">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                Market Size
              </h3>
              <p className="text-2xl font-bold text-white">{idea.marketSize}</p>
            </div>

            {/* Upvotes */}
            <div className="rounded-lg bg-slate-900/70 p-6 border border-slate-700">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                Upvotes
              </h3>
              <div className="flex items-center gap-2">
                <svg
                  className="h-6 w-6 text-[#14b8a6]"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <p className="text-2xl font-bold text-white">{idea.upvotes}</p>
              </div>
            </div>

            {/* Views */}
            <div className="rounded-lg bg-slate-900/70 p-6 border border-slate-700">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                Views
              </h3>
              <div className="flex items-center gap-2">
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
                <p className="text-2xl font-bold text-white">{idea.views}</p>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-white">Tags</h2>
            <div className="flex flex-wrap gap-3">
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#14b8a6]/15 px-4 py-2 text-sm font-medium text-[#14b8a6] border border-[#14b8a6]/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </BackgroundGradient>
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
                Are you sure you want to delete <span className="font-semibold text-white">&quot;{idea?.title}&quot;</span>? This action cannot be undone.
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

