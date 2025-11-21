"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { useApiClient } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";

export interface Idea {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  marketSize: string;
  tags: string[];
  author: string;
  createdAt: Date;
  upvotes: number;
  views: number;
  status: "draft" | "active" | "validated" | "launched" | "posted";
  user_id?: string; // Optional: Clerk user ID of the idea owner
  link?: string | null; // Optional: Link to existing solution if idea is solved (null to clear)
}

interface IdeaCardProps {
  idea: Idea;
  onUpvote?: (ideaId: string, newUpvoteCount: number) => void;
}

export default function IdeaCard({ idea, onUpvote }: IdeaCardProps) {
  const apiClient = useApiClient();
  const { user } = useUser();
  const [upvotes, setUpvotes] = useState(idea.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  // Check upvote status when component loads or when idea/user changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!idea.id || !user?.id) {
        // If not authenticated, user can't have upvoted
        setHasUpvoted(false);
        return;
      }

      try {
        const response = await apiClient.checkUpvoteStatus(idea.id);
        
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

    if (idea.id && user?.id) {
      checkStatus();
    } else {
      setHasUpvoted(false);
    }
  }, [idea.id, user?.id, apiClient]);

  const statusColors = {
    draft: "bg-slate-700 text-slate-300",
    active: "bg-blue-900 text-blue-300",
    validated: "bg-teal-900 text-teal-300",
    launched: "bg-green-900 text-green-300",
    posted: "bg-green-600 text-green-100",
  };

  const handleUpvoteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card navigation

    if (isUpvoting || !user?.id) {
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
          updatedItem.upvotes || updatedItem.upvotes_count || updatedItem.upvote_count || upvotes
        );
        
        // Check if response includes upvote status
        const upvotedStatus = updatedItem.upvoted !== undefined 
          ? Boolean(updatedItem.upvoted)
          : !hasUpvoted; // Toggle if not provided
        
        setUpvotes(newUpvotes);
        setHasUpvoted(upvotedStatus);
        
        // Call parent callback if provided
        if (onUpvote) {
          onUpvote(idea.id, newUpvotes);
        }
      } else {
        // Fallback: optimistically update
        if (hasUpvoted) {
          setUpvotes((prev) => prev - 1);
        } else {
          setUpvotes((prev) => prev + 1);
        }
        setHasUpvoted(!hasUpvoted);
        if (onUpvote) {
          onUpvote(idea.id, hasUpvoted ? upvotes - 1 : upvotes + 1);
        }
      }
    } catch (error: unknown) {
      console.error("Error toggling upvote:", error);
      
      // Handle specific errors
      const errorMessage = error instanceof Error ? error.message : String(error);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link href={`/ideas/${idea.id}`} className="block h-full">
        <BackgroundGradient
          className="h-full rounded-xl bg-slate-800 p-6 shadow-sm transition-all hover:shadow-xl"
          containerClassName="h-full"
        >
          <div className="group h-full">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-[#14b8a6] transition-colors">
                  {idea.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  by {idea.author} · {idea.createdAt.toLocaleDateString()}
                </p>
              </div>
              {/* Show "Posted" status only if link exists, otherwise show nothing */}
              {idea.link && (
                <span
                  className={`ml-4 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    statusColors.posted
                  }`}
                >
                  Posted
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 line-clamp-2 text-sm text-slate-300">
              {idea.description}
            </p>

            {/* Problem Preview */}
            <div className="mt-4 rounded-lg bg-slate-900 p-3 border border-slate-700">
              <p className="text-xs font-medium text-slate-400">Problem</p>
              <p className="mt-1 line-clamp-1 text-sm text-slate-300">
                {idea.problem}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {idea.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#14b8a6]/10 px-3 py-1 text-xs font-medium text-[#14b8a6]"
                >
                  {tag}
                </span>
              ))}
              {idea.tags.length > 3 && (
                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                  +{idea.tags.length - 3} more
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <button
                  onClick={handleUpvoteToggle}
                  disabled={isUpvoting || !user}
                  className={`flex items-center space-x-1 rounded-lg px-3 py-1.5 transition-all ${
                    hasUpvoted
                      ? "bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/30 hover:bg-[#14b8a6]/30"
                      : "hover:bg-slate-700/50 text-slate-400 hover:text-white"
                  } ${isUpvoting || !user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  title={!user ? "Sign in to upvote" : hasUpvoted ? "Remove upvote" : "Upvote"}
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
                    <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>{upvotes}</span>
                  {hasUpvoted && (
                    <span className="ml-1 text-[#14b8a6]">✓</span>
                  )}
                </button>
                <div className="flex items-center space-x-1">
                  <svg
                    className="h-4 w-4"
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
                  <span>{idea.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{idea.marketSize}</span>
                </div>
              </div>
              <div className="flex items-center text-sm font-medium text-[#14b8a6]">
                View Details
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </BackgroundGradient>
      </Link>
    </motion.div>
  );
}
