import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-[#14b8a6]/10 px-4 py-2 text-sm font-semibold text-[#14b8a6]">
              <span className="mr-2">✨</span>
              AI-Powered Startup Ideation
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Turn Problems Into
              <span className="block bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] bg-clip-text text-transparent">
                Startup Ideas
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-xl leading-8 text-slate-600 sm:text-2xl">
              Share a real-world problem, and our AI will help you transform it
              into a viable, actionable startup concept with roadmap and
              strategy.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="group relative rounded-xl bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#14b8a6]/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#14b8a6]/40"
              >
                Start Chatting with AI
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/explore"
                className="rounded-xl border-2 border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 transition-all hover:border-[#14b8a6] hover:text-[#14b8a6]"
              >
                Explore Ideas
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="text-3xl font-bold text-[#0e3a5f]">1000+</div>
                <div className="mt-2 text-sm text-slate-600">
                  Problems Solved
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="text-3xl font-bold text-[#14b8a6]">500+</div>
                <div className="mt-2 text-sm text-slate-600">
                  Startup Ideas Generated
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="text-3xl font-bold text-[#0e3a5f]">50+</div>
                <div className="mt-2 text-sm text-slate-600">
                  Active Startups
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#14b8a6]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#0e3a5f]/10 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Three simple steps to transform problems into opportunities
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0e3a5f]/10">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                1. Share Your Problem
              </h3>
              <p className="mt-4 text-slate-600">
                Chat with our AI about a real-world problem you've encountered
                or observed in your industry.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#14b8a6]/10">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                2. AI Analysis
              </h3>
              <p className="mt-4 text-slate-600">
                Our AI analyzes the problem, identifies market opportunities, and
                generates multiple startup ideas with validation insights.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0e3a5f]/10">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900">
                3. Get Your Roadmap
              </h3>
              <p className="mt-4 text-slate-600">
                Receive a detailed roadmap, business model, and actionable steps
                to turn your idea into reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-8 py-16 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Turn Your Problem Into a Startup?
            </h2>
            <p className="mt-4 text-xl text-white/90">
              Start chatting with our AI assistant and discover your next big
              idea.
            </p>
            <Link
              href="/chat"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#0e3a5f] transition-all hover:scale-105 hover:shadow-lg"
            >
              Start Chatting Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]">
                <span className="text-sm font-bold text-white">OH</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                OriginHub
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-600 md:mt-0">
              © 2025 OriginHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
