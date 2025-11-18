"use client";

import { useState, FormEvent, useEffect } from "react";
import { Idea } from "./IdeaCard";
import { useApiClient } from "@/lib/api-client";

interface PostIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    idea: Omit<Idea, "id" | "createdAt" | "upvotes" | "views" | "status">
  ) => void;
}

export default function PostIdeaModal({
  isOpen,
  onClose,
  onSubmit,
}: PostIdeaModalProps) {
  const apiClient = useApiClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problem: "",
    solution: "",
    marketSize: "Medium" as "Small" | "Medium" | "Large",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.problem.trim()) {
      newErrors.problem = "Problem statement is required";
    }

    if (!formData.solution.trim()) {
      newErrors.solution = "Solution description is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Call backend API to add idea (user_id and author are added automatically)
      const response = await apiClient.addIdea({
        title: formData.title.trim(),
        description: formData.description.trim(),
        problem: formData.problem.trim(),
        solution: formData.solution.trim(),
        marketSize: formData.marketSize,
        tags: formData.tags,
      });

      // Call the onSubmit callback with the response data
      // The response should contain the created idea with ID, timestamps, etc.
      if (response.data || response.idea) {
        const createdIdea = response.data || response.idea;
        onSubmit({
          title: createdIdea.title || formData.title.trim(),
          description: createdIdea.description || formData.description.trim(),
          problem: createdIdea.problem || formData.problem.trim(),
          solution: createdIdea.solution || formData.solution.trim(),
          marketSize: createdIdea.marketSize || formData.marketSize,
          tags: createdIdea.tags || formData.tags,
          author: createdIdea.author || "Anonymous",
        });
      } else {
        // Fallback if backend returns different structure
        onSubmit({
          title: formData.title.trim(),
          description: formData.description.trim(),
          problem: formData.problem.trim(),
          solution: formData.solution.trim(),
          marketSize: formData.marketSize,
          tags: formData.tags,
          author: "Anonymous",
        });
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        problem: "",
        solution: "",
        marketSize: "Medium",
        tags: [],
      });
      setTagInput("");
      setErrors({});
      onClose();
    } catch (error: unknown) {
      console.error("Error submitting idea:", error);
      // Handle error response
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { error?: string; message?: string } };
        };
        if (axiosError.response?.data?.error) {
          setSubmitError(axiosError.response.data.error);
        } else if (axiosError.response?.data?.message) {
          setSubmitError(axiosError.response.data.message);
        } else {
          setSubmitError("Failed to submit idea. Please try again.");
        }
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Failed to submit idea. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 mx-4 max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-[0_25px_120px_rgba(2,6,23,0.9)] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Post a New Idea</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
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
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Idea Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a catchy title for your idea..."
                className={`w-full rounded-lg border-2 border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-2 ${
                  errors.title
                    ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                    : "focus:border-[#14b8a6] focus:ring-[#14b8a6]/20"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Briefly describe your startup idea..."
                className={`w-full resize-none rounded-lg border-2 border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-2 ${
                  errors.description
                    ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                    : "focus:border-[#14b8a6] focus:ring-[#14b8a6]/20"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Problem */}
            <div>
              <label
                htmlFor="problem"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Problem Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                id="problem"
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the real-world problem your idea solves..."
                className={`w-full resize-none rounded-lg border-2 border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-2 ${
                  errors.problem
                    ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                    : "focus:border-[#14b8a6] focus:ring-[#14b8a6]/20"
                }`}
              />
              {errors.problem && (
                <p className="mt-1 text-sm text-red-600">{errors.problem}</p>
              )}
            </div>

            {/* Solution */}
            <div>
              <label
                htmlFor="solution"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Solution <span className="text-red-500">*</span>
              </label>
              <textarea
                id="solution"
                name="solution"
                value={formData.solution}
                onChange={handleChange}
                rows={4}
                placeholder="Explain how your idea solves the problem..."
                className={`w-full resize-none rounded-lg border-2 border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-2 ${
                  errors.solution
                    ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                    : "focus:border-[#14b8a6] focus:ring-[#14b8a6]/20"
                }`}
              />
              {errors.solution && (
                <p className="mt-1 text-sm text-red-600">{errors.solution}</p>
              )}
            </div>

            {/* Market Size and Author */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="marketSize"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Market Size
                </label>
                <select
                  id="marketSize"
                  name="marketSize"
                  value={formData.marketSize}
                  onChange={handleChange}
                  className="w-full rounded-lg border-2 border-white/10 bg-slate-900/70 px-4 py-3 text-white transition-colors focus:border-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Tags <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-[#14b8a6]/15 px-3 py-1 text-sm font-medium text-[#14b8a6]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-[#0d9488] transition-colors"
                      aria-label={`Remove ${tag} tag`}
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
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Add tags (press Enter to add)..."
                  className={`flex-1 rounded-lg border-2 border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-2 ${
                    errors.tags
                      ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                      : "focus:border-[#14b8a6] focus:ring-[#14b8a6]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-lg border-2 border-white/15 bg-transparent px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:border-[#14b8a6] hover:text-[#14b8a6]"
                >
                  Add
                </button>
              </div>
              {errors.tags && (
                <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
              )}
              <p className="mt-2 text-xs text-white/50">
                Add relevant tags to help others find your idea (e.g., AI, SaaS,
                Healthcare)
              </p>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-600 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 border-t border-white/10 bg-slate-900/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-6 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#14b8a6]/25 transition-all hover:shadow-xl hover:shadow-[#14b8a6]/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
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
                Posting...
              </span>
            ) : (
              "Post Idea"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
