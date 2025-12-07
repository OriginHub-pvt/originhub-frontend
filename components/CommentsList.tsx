"use client";

import { useState, useEffect } from "react";
import { useApiClient } from "@/lib/api-client";
import CommentItem from "./CommentItem";
import CommentForm, { Comment, formatCommentAuthor } from "./CommentForm";

interface CommentsListProps {
  ideaId: string;
  ideaOwnerId?: string;
}

export default function CommentsList({ ideaId, ideaOwnerId }: CommentsListProps) {
  const apiClient = useApiClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getIdeaComments(ideaId);
        
        // Handle response structure
        let commentsData: Comment[] = [];
        if (response && typeof response === "object") {
          const resp = response as Record<string, unknown>;
          if (Array.isArray(resp.data)) {
            commentsData = resp.data as Comment[];
          } else if (Array.isArray(resp.comments)) {
            commentsData = resp.comments as Comment[];
          } else if (Array.isArray(response)) {
            commentsData = response as Comment[];
          }
        } else if (Array.isArray(response)) {
          commentsData = response as Comment[];
        }

        // Helper function to format a single comment and its replies recursively
        const formatComment = (comment: Comment): Comment => {
          // Format author name
          let formattedComment = comment;
          
          // If author is already a string and not empty, use it
          if (typeof comment.author === "string" && comment.author.trim()) {
            formattedComment = comment;
          } else if (comment.author_name && typeof comment.author_name === "string") {
            formattedComment = { ...comment, author: comment.author_name };
          } else if (comment.author && typeof comment.author === "object") {
            const authorObj = comment.author as { first_name?: string; last_name?: string };
            const firstName = authorObj.first_name || "";
            const lastName = authorObj.last_name || "";
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName) {
              formattedComment = { ...comment, author: fullName };
            } else {
              formattedComment = formatCommentAuthor(comment);
            }
          } else {
            // Check for other possible fields
            const commentAny = comment as Record<string, unknown>;
            if (commentAny.user && typeof commentAny.user === "object") {
              const userObj = commentAny.user as { first_name?: string; last_name?: string; name?: string };
              if (userObj.name) {
                formattedComment = { ...comment, author: userObj.name };
              } else {
                const firstName = userObj.first_name || "";
                const lastName = userObj.last_name || "";
                const fullName = `${firstName} ${lastName}`.trim();
                if (fullName) {
                  formattedComment = { ...comment, author: fullName };
                } else {
                  formattedComment = formatCommentAuthor(comment);
                }
              }
            } else if (commentAny.user_name && typeof commentAny.user_name === "string") {
              formattedComment = { ...comment, author: commentAny.user_name };
            } else {
              formattedComment = formatCommentAuthor(comment);
            }
          }

          // Recursively format replies if they exist
          if (comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0) {
            formattedComment = {
              ...formattedComment,
              replies: comment.replies.map(formatComment),
            };
          }

          return formattedComment;
        };

        // Format all comments (including nested replies)
        const formattedComments = commentsData.map(formatComment);
        
        // Sort top-level comments by newest first
        formattedComments.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });

        // Also sort replies within each comment (newest first)
        const sortReplies = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.replies && comment.replies.length > 0) {
              const sortedReplies = sortReplies(comment.replies).sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA;
              });
              return {
                ...comment,
                replies: sortedReplies,
              };
            }
            return comment;
          });
        };
        
        const sortedComments = sortReplies(formattedComments);
        setComments(sortedComments);
      } catch (err) {
        console.error("Error loading comments:", err);
        setError("Failed to load comments");
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (ideaId) {
      loadComments();
    }
  }, [ideaId, apiClient]);

  // Handle new comment added (could be top-level or reply)
  const handleCommentAdded = (newComment: Comment) => {
    // If it's a reply, find the parent and add it to that comment's replies
    if (newComment.parent_comment_id) {
      setComments((prev) => {
        const updateCommentReplies = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === newComment.parent_comment_id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
              };
            }
            // Recursively check replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentReplies(comment.replies),
              };
            }
            return comment;
          });
        };
        return updateCommentReplies(prev);
      });
    } else {
      // Top-level comment - add to top
      setComments((prev) => [newComment, ...prev]);
    }
  };

  // Handle comment deleted (could be top-level or reply)
  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => {
      const removeComment = (comments: Comment[]): Comment[] => {
        return comments
          .filter((c) => c.id !== commentId)
          .map((comment) => {
            // Recursively remove from replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: removeComment(comment.replies),
              };
            }
            return comment;
          });
      };
      return removeComment(prev);
    });
  };

  // Helper function to count all comments including replies
  const countAllComments = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countAllComments(comment.replies) : 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900/70 p-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#14b8a6]" />
        <p className="mt-4 text-sm text-slate-400">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900/70 p-6">
      <h3 className="mb-6 text-xl font-semibold text-white">
        Comments ({countAllComments(comments)})
      </h3>

      {error && (
        <div className="mb-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          {error}
        </div>
      )}

      {/* Comment Form */}
      <CommentForm ideaId={ideaId} onCommentAdded={handleCommentAdded} />

      {/* Comments List */}
      <div className="mt-6">
          {comments.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                ideaId={ideaId}
                ideaOwnerId={ideaOwnerId}
                onDelete={handleCommentDeleted}
                onReply={handleCommentAdded}
              />
            ))
          )}
      </div>
    </div>
  );
}

