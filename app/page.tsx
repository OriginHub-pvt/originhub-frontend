import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Vortex } from "@/components/ui/vortex";
import { Highlight, HeroHighlight } from "@/components/ui/hero-highlight";
import { Button } from "@/components/ui/moving-border";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Hero Section with Vortex */}
      <section className="relative w-full h-[80vh] overflow-hidden">
        <Vortex
          backgroundColor="black"
          className="flex items-center flex-col justify-between px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12 w-full h-full"
          containerClassName="w-full h-full"
        >
          <div className="w-full text-center flex flex-col justify-between h-full py-4">
            {/* Top Content */}
            <div className="flex flex-col items-center mt-20 lg:mt-24">
              {/* Main Heading */}
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Got a Problem?
                <Highlight className="block bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] bg-clip-text text-transparent">
                  We&apos;ve Got You Covered
                </Highlight>
              </h1>

              {/* Subheading */}
              <p className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl lg:text-2xl max-w-4xl mx-auto">
                Search for existing solutions or discover new tech. If it
                doesn&apos;t exist yet, we&apos;ll help you turn your problem
                into the next big startup idea.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  as="a"
                  href="/chat"
                  borderRadius="9999px"
                  containerClassName="group/button relative h-[4.2rem] w-full max-w-[320px] bg-transparent"
                  borderClassName="bg-[conic-gradient(at_top,_#14b8a6,_#0e3a5f,_#14b8a6)] opacity-70 blur-[2px]"
                  className="flex w-full flex-col gap-1 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/40 px-6 text-left text-white shadow-[0_15px_45px_rgba(14,58,95,0.45)] transition-all duration-300 hover:shadow-[0_20px_55px_rgba(20,184,166,0.45)]"
                >
                  <span className="text-xs font-medium uppercase tracking-[0.4em] text-teal-200/70">
                    Live AI Guide
                  </span>
                  <span className="flex items-center justify-between text-lg font-semibold">
                    Find Your Solution
                  </span>
                </Button>

                <Link href="/marketplace" className="w-full max-w-[320px]">
                  <Button
                    as="div"
                    borderRadius="9999px"
                    containerClassName="group/button relative h-[4.2rem] w-full bg-transparent"
                    borderClassName="bg-[conic-gradient(at_top,_#0e3a5f,_#14b8a6,_#0e3a5f)] opacity-60 blur-[2px]"
                    className="flex w-full flex-col items-center gap-1 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/40 via-slate-900/70 to-slate-900/90 px-6 text-center text-white shadow-[0_15px_45px_rgba(2,6,23,0.6)] transition-all duration-300 hover:shadow-[0_20px_55px_rgba(14,58,95,0.45)]"
                  >
                    <span className="text-xs font-medium uppercase tracking-[0.35em] text-teal-100/70">
                      Idea Vault
                    </span>
                    <span className="flex items-center justify-center gap-2 text-lg font-semibold">
                      Explore Ideas
                    </span>
                  </Button>
                </Link>
              </div>
              <div className="mt-22 pb-4">
                <h3 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold leading-[1.1] bg-gradient-to-r from-[#0e3a5f] via-[#14b8a6] to-[#0e3a5f] bg-clip-text text-transparent">
                  OriginHub
                </h3>
              </div>
            </div>
          </div>
        </Vortex>
      </section>

      <HeroHighlight containerClassName="w-full flex-col items-stretch justify-start bg-slate-950 px-0 py-16 sm:py-20 lg:py-24">
        <div className="w-full space-y-20">
          {/* Stats */}
          <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-sm border border-slate-700">
                <div className="text-3xl font-bold text-[#14b8a6]">1,200+</div>
                <div className="mt-2 text-sm text-slate-400">
                  Problems You&apos;ve Searched
                </div>
              </div>
              <div className="rounded-xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-sm border border-slate-700">
                <div className="text-3xl font-bold text-[#14b8a6]">500+</div>
                <div className="mt-2 text-sm text-slate-400">
                  Startup Ideas Created
                </div>
              </div>
              <div className="rounded-xl bg-slate-800/80 backdrop-blur-sm p-6 shadow-sm border border-slate-700">
                <div className="text-3xl font-bold text-[#14b8a6]">300+</div>
                <div className="mt-2 text-sm text-slate-400">
                  Ideas You&apos;re Solving
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="w-full">
              <div className="w-full text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Here&apos;s How It Works For You
                </h2>
                <p className="mt-4 text-lg text-slate-300 sm:text-xl lg:text-2xl">
                  Two simple paths to get what you need
                </p>
              </div>

              <div className="w-full">
                {/* Main Flow */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 w-full">
                  {/* Left: Search Flow */}
                  <div className="rounded-2xl bg-slate-800 p-8 lg:p-12 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0e3a5f]/20">
                        <svg
                          className="w-6 h-6 text-[#14b8a6]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-semibold text-white">
                        Start by Searching
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                          1
                        </div>
                        <p className="text-slate-300 text-base lg:text-lg">
                          Tell us about your problem or the new technology
                          you&apos;re curious about
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                          2
                        </div>
                        <p className="text-slate-300 text-base lg:text-lg">
                          We search our database for existing startups,
                          software, or tech that solves exactly what you need
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                          3
                        </div>
                        <p className="text-slate-300 text-base lg:text-lg">
                          If we find a solution, you&apos;re all set! If not, we
                          automatically turn your problem into a startup idea
                          for the marketplace
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Marketplace Flow */}
                  <div className="rounded-2xl bg-slate-800 p-8 lg:p-12 border border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#14b8a6]/20">
                        <svg
                          className="w-6 h-6 text-[#14b8a6]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-semibold text-white">
                        Join the Marketplace
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                          1
                        </div>
                        <p className="text-slate-300 text-base lg:text-lg">
                          Browse through startup ideas that are waiting to be
                          solved by innovators like you
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                          2
                        </div>
                        <p className="text-slate-300 text-base lg:text-lg">
                          Pick an idea that excites you and collaborate with
                          others to build the solution together
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                          3
                        </div>
                        <p className="text-slate-300 text-base lg:text-lg">
                          Have your own brilliant idea? Post it directly to the
                          marketplace and watch the community bring it to life
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decision Flow Diagram */}
                <div className="rounded-2xl bg-slate-800 p-8 lg:p-12 border border-slate-700 w-full">
                  <h3 className="text-xl lg:text-2xl font-semibold text-white mb-8 text-center">
                    Your Journey, Simplified
                  </h3>
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-full max-w-2xl rounded-lg bg-slate-900 p-6 border border-slate-700 text-center">
                      <p className="text-white font-medium text-lg lg:text-xl">
                        You have a problem that needs solving
                      </p>
                    </div>
                    <div className="text-[#14b8a6] text-3xl">↓</div>
                    <div className="w-full max-w-2xl rounded-lg bg-slate-900 p-6 border border-slate-700 text-center">
                      <p className="text-white font-medium text-lg lg:text-xl">
                        You search for existing solutions
                      </p>
                    </div>
                    <div className="text-[#14b8a6] text-3xl">↓</div>
                    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-6 text-center">
                        <p className="text-green-400 font-medium text-base lg:text-lg">
                          Solution Found
                        </p>
                        <p className="text-slate-400 text-sm mt-2">
                          Use the existing startup or software
                        </p>
                      </div>
                      <div className="rounded-lg bg-[#14b8a6]/20 border border-[#14b8a6]/50 p-6 text-center">
                        <p className="text-[#14b8a6] font-medium text-base lg:text-lg">
                          No Solution Yet
                        </p>
                        <p className="text-slate-400 text-sm mt-2">
                          We convert it into a startup idea for you
                        </p>
                      </div>
                    </div>
                    <div className="text-[#14b8a6] text-3xl">↓</div>
                    <div className="w-full max-w-2xl rounded-lg bg-slate-900 p-6 border border-slate-700 text-center">
                      <p className="text-white font-medium text-lg lg:text-xl">
                        Your idea goes to the marketplace
                      </p>
                      <p className="text-slate-400 text-sm mt-2">
                        Others can discover it and help you solve it
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="w-full">
              <div className="w-full text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Everything You Need, All in One Place
                </h2>
                <p className="mt-4 text-lg text-slate-300 sm:text-xl lg:text-2xl">
                  Discover what you can do on OriginHub
                </p>
              </div>

              <div className="w-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="group rounded-2xl bg-slate-900 p-8 lg:p-10 shadow-sm border border-slate-700 transition-all hover:shadow-lg hover:border-[#14b8a6]/50 hover:scale-105">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#0e3a5f]/20 mb-4">
                    <svg
                      className="w-8 h-8 text-[#14b8a6]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                    Search for Solutions
                  </h3>
                  <p className="text-slate-400 text-base lg:text-lg">
                    Find existing startups, software, or cutting-edge technology
                    that solves your specific problem right now.
                  </p>
                </div>
                ...
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="w-full">
              <div className="rounded-2xl bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-8 py-16 lg:px-16 lg:py-20 text-center shadow-xl">
                <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  Ready to Get Started?
                </h2>
                <p className="mt-4 text-xl text-white/90 lg:text-2xl">
                  Find your solution or create the next big startup idea. Your
                  journey starts here.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/chat"
                    className="rounded-xl bg-white px-8 py-4 lg:px-12 lg:py-5 text-lg lg:text-xl font-semibold text-[#0e3a5f] transition-all hover:scale-105 hover:shadow-lg"
                  >
                    Find Your Solution
                  </Link>
                  <Link
                    href="/marketplace"
                    className="rounded-xl border-2 border-white px-8 py-4 lg:px-12 lg:py-5 text-lg lg:text-xl font-semibold text-white transition-all hover:bg-white hover:text-[#0e3a5f]"
                  >
                    Explore Marketplace
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </HeroHighlight>

      {/* Key Features Section */}
      <section className="w-full px-4 py-20 sm:px-6 lg:px-8 xl:px-12 bg-slate-800">
        <div className="w-full">
          <div className="w-full text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Everything You Need, All in One Place
            </h2>
            <p className="mt-4 text-lg text-slate-300 sm:text-xl lg:text-2xl">
              Discover what you can do on OriginHub
            </p>
          </div>

          <div className="w-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl bg-slate-900 p-8 lg:p-10 shadow-sm border border-slate-700 transition-all hover:shadow-lg hover:border-[#14b8a6]/50 hover:scale-105">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#0e3a5f]/20 mb-4">
                <svg
                  className="w-8 h-8 text-[#14b8a6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                Search for Solutions
              </h3>
              <p className="text-slate-400 text-base lg:text-lg">
                Find existing startups, software, or cutting-edge technology
                that solves your specific problem right now.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl bg-slate-900 p-8 lg:p-10 shadow-sm border border-slate-700 transition-all hover:shadow-lg hover:border-[#14b8a6]/50 hover:scale-105">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#14b8a6]/20 mb-4">
                <svg
                  className="w-8 h-8 text-[#14b8a6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                Turn Problems Into Ideas
              </h3>
              <p className="text-slate-400 text-base lg:text-lg">
                When your problem doesn&apos;t have a solution yet, we
                automatically transform it into a startup idea ready for the
                marketplace.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl bg-slate-900 p-8 lg:p-10 shadow-sm border border-slate-700 transition-all hover:shadow-lg hover:border-[#14b8a6]/50 hover:scale-105">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#0e3a5f]/20 mb-4">
                <svg
                  className="w-8 h-8 text-[#14b8a6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                Browse the Marketplace
              </h3>
              <p className="text-slate-400 text-base lg:text-lg">
                Explore hundreds of unsolved startup ideas and find the ones
                that spark your interest.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl bg-slate-900 p-8 lg:p-10 shadow-sm border border-slate-700 transition-all hover:shadow-lg hover:border-[#14b8a6]/50 hover:scale-105">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#14b8a6]/20 mb-4">
                <svg
                  className="w-8 h-8 text-[#14b8a6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                Collaborate & Build
              </h3>
              <p className="text-slate-400 text-base lg:text-lg">
                Team up with other innovators to solve marketplace ideas and
                bring solutions to life together.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl bg-slate-900 p-8 lg:p-10 shadow-sm border border-slate-700 transition-all hover:shadow-lg hover:border-[#14b8a6]/50 hover:scale-105">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#0e3a5f]/20 mb-4">
                <svg
                  className="w-8 h-8 text-[#14b8a6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                Share Your Ideas
              </h3>
              <p className="text-slate-400 text-base lg:text-lg">
                Got a brilliant idea? Post it directly to the marketplace and
                let the community help you make it happen.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl bg-slate-900 p-8 lg:p-10 shadow-sm border border-slate-700 transition-all hover:shadow-lg hover:border-[#14b8a6]/50 hover:scale-105">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#14b8a6]/20 mb-4">
                <svg
                  className="w-8 h-8 text-[#14b8a6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                Discover New Tech
              </h3>
              <p className="text-slate-400 text-base lg:text-lg">
                Stay ahead of the curve by searching for the latest technology
                trends and innovations that could solve your challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 py-20 sm:px-6 lg:px-8 xl:px-12 bg-slate-900">
        <div className="w-full">
          <div className="rounded-2xl bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-8 py-16 lg:px-16 lg:py-20 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-xl text-white/90 lg:text-2xl">
              Find your solution or create the next big startup idea. Your
              journey starts here.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="rounded-xl bg-white px-8 py-4 lg:px-12 lg:py-5 text-lg lg:text-xl font-semibold text-[#0e3a5f] transition-all hover:scale-105 hover:shadow-lg"
              >
                Find Your Solution
              </Link>
              <Link
                href="/marketplace"
                className="rounded-xl border-2 border-white px-8 py-4 lg:px-12 lg:py-5 text-lg lg:text-xl font-semibold text-white transition-all hover:bg-white hover:text-[#0e3a5f]"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-700 bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]">
                <span className="text-sm font-bold text-white">OH</span>
              </div>
              <span className="text-lg font-bold text-white">OriginHub</span>
            </div>
            <p className="mt-4 text-sm text-slate-400 md:mt-0">
              © 2025 OriginHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
