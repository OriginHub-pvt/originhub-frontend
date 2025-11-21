"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api-client";
import { Comment } from "./CommentForm";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  ideaId: string;
  ideaOwnerId?: string;
  onDelete: (commentId: string) => void;
  onReply?: (comment: Comment) => void;
  depth?: number; // Track nesting depth for styling
}

export default function CommentItem({
  comment,
  ideaId,
  ideaOwnerId,
  onDelete,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const { user } = useUser();
  const apiClient = useApiClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  // Check if current user can delete this comment
  const canDelete =
    user?.id === comment.user_id || user?.id === ideaOwnerId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.deleteComment(ideaId, comment.id);
      onDelete(comment.id); // Notify parent to remove from list
    } catch (error) {
      console.error("Error deleting comment:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete comment";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const isIdeaOwner = comment.user_id === ideaOwnerId;
  const commentDate = new Date(comment.created_at);
  const isReply = depth > 0;

  // Get author name - handle string or object format
  const getAuthorName = (): string => {
    if (typeof comment.author === "string" && comment.author) {
      return comment.author;
    }
    if (comment.author_name) {
      return comment.author_name;
    }
    if (comment.author && typeof comment.author === "object") {
      const authorObj = comment.author as { first_name?: string; last_name?: string };
      const firstName = authorObj.first_name || "";
      const lastName = authorObj.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || "Anonymous";
    }
    // Fallback - should not happen if formatCommentAuthor was called
    return "Anonymous";
  };

  const handleReplyAdded = (newReply: Comment) => {
    setIsReplying(false);
    if (onReply) {
      onReply(newReply);
    }
  };

  return (
    <div className={`${isReply ? "ml-8 mt-3" : "mb-4"}`}>
      <div className={`rounded-lg border border-slate-700 bg-slate-900/70 p-4 ${
        isReply ? "border-l-2 border-l-[#14b8a6]/50" : "border-l-4 border-l-[#14b8a6]"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {isIdeaOwner && "👑 "}
              {getAuthorName()}
            </span>
            {isReply && (
              <span className="text-xs text-slate-500">replied</span>
            )}
          </div>
          <span className="text-xs text-slate-500">
            {commentDate.toLocaleDateString()} at{" "}
            {commentDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-3">
          {comment.content}
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-slate-400 hover:text-[#14b8a6] transition-colors"
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "🗑️ Delete"}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && user && (
          <div className="mt-4">
            <CommentForm
              ideaId={ideaId}
              onCommentAdded={handleReplyAdded}
              parentCommentId={comment.id}
            />
          </div>
        )}
      </div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              ideaId={ideaId}
              ideaOwnerId={ideaOwnerId}
              onDelete={onDelete}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

