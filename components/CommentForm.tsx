"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api-client";

// Helper function to format author name from various response formats
export function formatCommentAuthor(comment: Comment): Comment {
  if (typeof comment.author === "string" && comment.author) {
    return comment;
  }

  if (comment.author_name) {
    return { ...comment, author: comment.author_name };
  }

  if (comment.author && typeof comment.author === "object") {
    const authorObj = comment.author as { first_name?: string; last_name?: string };
    const firstName = authorObj.first_name || "";
    const lastName = authorObj.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Anonymous";
    return { ...comment, author: fullName };
  }

  // Fallback to Anonymous if no author info
  return { ...comment, author: "Anonymous" };
}

interface CommentFormProps {
  ideaId: string;
  onCommentAdded: (comment: Comment) => void;
  parentCommentId?: string | null; // Optional: if provided, creates a reply
}

export interface Comment {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null; // For nested replies
  created_at: string;
  updated_at?: string | null;
  author?: string | {
    first_name?: string;
    last_name?: string;
  };
  author_name?: string;
  replies?: Comment[]; // Nested replies
}

export default function CommentForm({ ideaId, onCommentAdded, parentCommentId }: CommentFormProps) {
  const { user } = useUser();
  const apiClient = useApiClient();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      alert("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.createComment(ideaId, content.trim(), parentCommentId || undefined);
      
      // Handle response structure
      let newComment: Comment | null = null;
      if (response && typeof response === "object") {
        const resp = response as Record<string, unknown>;
        if (resp.data && typeof resp.data === "object") {
          newComment = resp.data as Comment;
        } else {
          newComment = response as Comment;
        }
      }

      if (newComment) {
        // Get user name from Clerk
        const userName = user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.firstName || user.lastName || user.username || "Anonymous";
        
        // Set author name from Clerk user info
        newComment.author = userName;
        
        // Format author name if needed (in case backend also provides it)
        newComment = formatCommentAuthor(newComment);
        setContent(""); // Clear form
        onCommentAdded(newComment); // Notify parent
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to post comment";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
        Please sign in to leave a comment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={4}
        maxLength={5000}
        disabled={isSubmitting}
        className="w-full rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-white placeholder-slate-500 focus:border-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 resize-y"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">{content.length}/5000</span>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}

