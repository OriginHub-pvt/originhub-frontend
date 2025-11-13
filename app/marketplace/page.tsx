'use client';

import { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import IdeaCard, { Idea } from '@/components/IdeaCard';
import PostIdeaModal from '@/components/PostIdeaModal';

// Mock data - Replace with actual API call
const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'AI-Powered Food Waste Reduction Platform',
    description: 'A smart platform that connects restaurants, grocery stores, and consumers to reduce food waste through AI-driven inventory management and donation matching.',
    problem: 'Food waste is a massive global problem, with 1.3 billion tons of food wasted annually, causing environmental and economic damage.',
    solution: 'An AI-powered platform that predicts food waste, matches surplus food with donation centers, and optimizes inventory management for businesses.',
    marketSize: 'Large',
    tags: ['AI', 'Sustainability', 'Food Tech', 'Social Impact'],
    author: 'Sarah Johnson',
    createdAt: new Date('2024-01-15'),
    upvotes: 234,
    views: 1200,
    status: 'active',
  },
  {
    id: '2',
    title: 'Remote Team Wellness Assistant',
    description: 'A comprehensive wellness platform designed for remote teams, offering mental health support, virtual team building, and productivity optimization tools.',
    problem: 'Remote workers face isolation, burnout, and lack of work-life balance, leading to decreased productivity and mental health issues.',
    solution: 'A platform providing personalized wellness programs, virtual team activities, and AI-driven stress management tools for remote teams.',
    marketSize: 'Medium',
    tags: ['Remote Work', 'Health Tech', 'SaaS', 'B2B'],
    author: 'Mike Chen',
    createdAt: new Date('2024-01-20'),
    upvotes: 189,
    views: 890,
    status: 'validated',
  },
  {
    id: '3',
    title: 'Blockchain-Based Supply Chain Transparency',
    description: 'A blockchain solution that provides end-to-end transparency in supply chains, helping consumers verify product authenticity and ethical sourcing.',
    problem: 'Consumers lack visibility into supply chains, making it difficult to verify product authenticity, ethical sourcing, and environmental impact.',
    solution: 'A blockchain platform that tracks products from origin to consumer, providing immutable records of authenticity, sourcing, and sustainability metrics.',
    marketSize: 'Large',
    tags: ['Blockchain', 'Supply Chain', 'Sustainability', 'B2B2C'],
    author: 'Alex Rivera',
    createdAt: new Date('2024-01-18'),
    upvotes: 312,
    views: 1500,
    status: 'active',
  },
  {
    id: '4',
    title: 'Personalized Learning Path Generator',
    description: 'An AI-driven educational platform that creates personalized learning paths for students based on their learning style, pace, and career goals.',
    problem: 'Traditional education uses a one-size-fits-all approach, failing to accommodate individual learning styles and career aspirations.',
    solution: 'An AI platform that analyzes learning patterns, creates customized curricula, and adapts in real-time to optimize student outcomes.',
    marketSize: 'Medium',
    tags: ['EdTech', 'AI', 'Personalization', 'B2C'],
    author: 'Emily Wang',
    createdAt: new Date('2024-01-22'),
    upvotes: 156,
    views: 670,
    status: 'draft',
  },
  {
    id: '5',
    title: 'Smart Home Energy Optimization System',
    description: 'An IoT-based energy management system that optimizes home energy consumption using AI, reducing costs and carbon footprint.',
    problem: 'Homeowners waste energy due to inefficient heating, cooling, and appliance usage, leading to high costs and environmental impact.',
    solution: 'An IoT system with AI algorithms that learns usage patterns and automatically optimizes energy consumption while maintaining comfort.',
    marketSize: 'Large',
    tags: ['IoT', 'Energy', 'AI', 'Smart Home'],
    author: 'David Kim',
    createdAt: new Date('2024-01-19'),
    upvotes: 278,
    views: 1100,
    status: 'launched',
  },
  {
    id: '6',
    title: 'Mental Health Chatbot for Students',
    description: 'A 24/7 AI-powered mental health chatbot specifically designed for students, providing instant support, resources, and crisis intervention.',
    problem: 'Students face mental health challenges but often lack access to affordable, timely support, especially during crisis situations.',
    solution: 'An AI chatbot that provides immediate mental health support, connects students with resources, and escalates to human professionals when needed.',
    marketSize: 'Medium',
    tags: ['Mental Health', 'AI', 'Education', 'Healthcare'],
    author: 'Jessica Martinez',
    createdAt: new Date('2024-01-21'),
    upvotes: 201,
    views: 950,
    status: 'active',
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'upvotes'>('newest');
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract all unique tags from ideas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ideas.forEach((idea) => {
      idea.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [ideas]);

  // Handle new idea submission
  const handlePostIdea = (ideaData: Omit<Idea, 'id' | 'createdAt' | 'upvotes' | 'views' | 'status'>) => {
    const newIdea: Idea = {
      ...ideaData,
      id: Date.now().toString(),
      createdAt: new Date(),
      upvotes: 0,
      views: 0,
      status: 'draft',
    };
    setIdeas((prev) => [newIdea, ...prev]);
  };

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    const filtered = ideas.filter((idea) => {
      const matchesSearch =
        searchQuery === '' ||
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesTag = selectedTag === null || idea.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });

    // Sort ideas (create a new array to avoid mutating)
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'upvotes':
          return b.upvotes - a.upvotes;
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  }, [ideas, searchQuery, selectedTag, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                Idea Marketplace
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Discover innovative startup ideas generated by our AI and community
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#14b8a6]/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#14b8a6]/40"
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
                <path d="M12 4v16m8-8H4" />
              </svg>
              Post an Idea
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="relative mx-auto max-w-2xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <svg
                  className="h-5 w-5 text-slate-400"
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
                placeholder="Search ideas by title, description, problem, or tags..."
                className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
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
          </div>

          {/* Filters and Sort */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Tags Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Filter by tag:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-[#14b8a6] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-[#14b8a6] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'newest' | 'popular' | 'upvotes')
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="upvotes">Most Upvoted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredIdeas.length}</span>{' '}
            {filteredIdeas.length === 1 ? 'idea' : 'ideas'}
            {searchQuery && (
              <span> for &quot;{searchQuery}&quot;</span>
            )}
            {selectedTag && (
              <span> tagged &quot;{selectedTag}&quot;</span>
            )}
          </p>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
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
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No ideas found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting your search query or filters to find more ideas.
            </p>
          </div>
        )}
      </div>

      {/* Post Idea Modal */}
      <PostIdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostIdea}
      />
    </div>
  );
}

