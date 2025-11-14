"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BackgroundGradient } from "@/components/ui/background-gradient";

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
  status: "draft" | "active" | "validated" | "launched";
}

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const statusColors = {
    draft: "bg-slate-700 text-slate-300",
    active: "bg-blue-900 text-blue-300",
    validated: "bg-teal-900 text-teal-300",
    launched: "bg-green-900 text-green-300",
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
              <span
                className={`ml-4 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  statusColors[idea.status]
                }`}
              >
                {idea.status}
              </span>
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
                    <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>{idea.upvotes}</span>
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
