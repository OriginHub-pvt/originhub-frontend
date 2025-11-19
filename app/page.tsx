import Link from "next/link";
import Navigation from "@/components/Navigation";
import { Vortex } from "@/components/ui/vortex";
import { Highlight } from "@/components/ui/hero-highlight";
import { Button } from "@/components/ui/moving-border";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { TracingBeam } from "@/components/ui/tracing-beam";

const tracingStories = [
  {
    badge: "Step 01",
    title: "Share the challenge",
    summary:
      "Tell us about the problem, tech gap, or emerging category you want to explore. The more context you give, the better we can match you.",
    bullets: [
      "Describe pain points, target users, and constraints.",
      "Drop references, docs, or market signals you’re seeing.",
    ],
  },
  {
    badge: "Step 02",
    title: "Watch OriginHub research",
    summary:
      "Our engine scans the marketplace, latest research, and startup landscape to surface existing solutions or missing links.",
    bullets: [
      "Get curated solution cards with pricing + traction.",
      "See gaps automatically translated into idea briefs.",
    ],
  },
  {
    badge: "Step 03",
    title: "Activate the marketplace",
    summary:
      "Publish the refined idea so founders, builders, and researchers can join forces with you or license the opportunity.",
    bullets: [
      "Signal interest, request collaborators, or seek funding.",
      "Track responses with real-time updates and messages.",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <ShootingStars />
        <StarsBackground />
      </div>
      <div className="relative z-10 min-h-screen">
        <Navigation />

        {/* Hero Section with Vortex */}
        <section className="relative w-full h-[80vh] overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <StarsBackground className="pointer-events-none absolute inset-0" />
          </div>
          <Vortex
            backgroundColor="transparent"
            className="flex items-center flex-col justify-between px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12 w-full h-full"
            containerClassName="relative w-full h-full"
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

        <div className="w-full space-y-20">
          {/* Stats */}
          <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { value: "1,200+", label: "Problems You&apos;ve Searched" },
                { value: "500+", label: "Startup Ideas Created" },
                { value: "300+", label: "Ideas You&apos;re Solving" },
              ].map((stat) => (
                <div
                  key={stat.value}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(8,8,20,0.8)] backdrop-blur-xl transition duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6]/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="text-3xl font-bold text-[#14b8a6]">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-sm text-slate-200">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
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
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-8 lg:p-12 shadow-[0_30px_80px_rgba(10,10,20,0.85)] backdrop-blur-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0e3a5f]/40 via-transparent to-transparent opacity-70" />
                    <div className="relative z-10">
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
                          <p className="text-slate-200 text-base lg:text-lg">
                            Tell us about your problem or the new technology
                            you&apos;re curious about
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                            2
                          </div>
                          <p className="text-slate-200 text-base lg:text-lg">
                            We search our database for existing startups,
                            software, or tech that solves exactly what you need
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                            3
                          </div>
                          <p className="text-slate-200 text-base lg:text-lg">
                            If we find a solution, you&apos;re all set! If not,
                            we automatically turn your problem into a startup
                            idea for the marketplace
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Marketplace Flow */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-8 lg:p-12 shadow-[0_30px_80px_rgba(10,10,20,0.85)] backdrop-blur-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6]/30 via-transparent to-transparent opacity-80" />
                    <div className="relative z-10">
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
                          <p className="text-slate-200 text-base lg:text-lg">
                            Browse through startup ideas that are waiting to be
                            solved by innovators like you
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                            2
                          </div>
                          <p className="text-slate-200 text-base lg:text-lg">
                            Pick an idea that excites you and collaborate with
                            others to build the solution together
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                            3
                          </div>
                          <p className="text-slate-200 text-base lg:text-lg">
                            Have your own brilliant idea? Post it directly to
                            the marketplace and watch the community bring it to
                            life
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decision Flow Diagram */}
                <div className="w-full">
                  <h3 className="text-xl lg:text-2xl font-semibold text-white mb-8 text-center">
                    Your Journey, Simplified
                  </h3>
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-full max-w-2xl rounded-2xl border border-blue-400/40 bg-blue-500/10 p-6 text-center">
                      <p className="text-white font-medium text-lg lg:text-xl">
                        You have a problem that needs solving
                      </p>
                    </div>
                    <div className="text-[#14b8a6] text-3xl">↓</div>
                    <div className="w-full max-w-2xl rounded-2xl border border-indigo-400/40 bg-indigo-500/10 p-6 text-center">
                      <p className="text-white font-medium text-lg lg:text-xl">
                        You search for existing solutions
                      </p>
                    </div>
                    <div className="text-[#14b8a6] text-3xl">↓</div>
                    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl border border-green-400/40 bg-green-500/10 p-6 text-center">
                        <p className="text-green-300 font-medium text-base lg:text-lg">
                          Solution Found
                        </p>
                        <p className="text-slate-300 text-sm mt-2">
                          Use the existing startup or software
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#14b8a6]/40 bg-[#14b8a6]/10 p-6 text-center">
                        <p className="text-[#14b8a6] font-medium text-base lg:text-lg">
                          No Solution Yet
                        </p>
                        <p className="text-slate-300 text-sm mt-2">
                          We convert it into a startup idea for you
                        </p>
                      </div>
                    </div>
                    <div className="text-[#14b8a6] text-3xl">↓</div>
                    <div className="w-full max-w-2xl rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 p-6 text-center">
                      <p className="text-white font-medium text-lg lg:text-xl">
                        Your idea goes to the marketplace
                      </p>
                      <p className="text-slate-300 text-sm mt-2">
                        Others can discover it and help you solve it
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="w-full px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Follow the OriginHub Beam
              </h2>
              <p className="mt-4 text-lg text-slate-300 sm:text-xl lg:text-2xl">
                Trace the spotlight as a single request becomes a market-ready
                opportunity.
              </p>
            </div>
            <TracingBeam className="px-0 md:px-6">
              <div className="space-y-12">
                {tracingStories.map((story) => (
                  <div
                    key={story.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.65)] backdrop-blur-xl"
                  >
                    <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#14b8a6]">
                      {story.badge}
                    </span>
                    <h3 className="mt-4 text-2xl font-semibold text-white">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-base text-slate-300">
                      {story.summary}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-400">
                      {story.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#14b8a6]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TracingBeam>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="w-full mt-20 px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full rounded-[40px] border border-white/10 bg-slate-900/70 p-10 shadow-[0_35px_100px_rgba(2,6,23,0.75)] backdrop-blur-2xl">
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
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-8 lg:p-10 shadow-[0_25px_70px_rgba(2,6,23,0.8)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0e3a5f]/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
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
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-8 lg:p-10 shadow-[0_25px_70px_rgba(2,6,23,0.8)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
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
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-8 lg:p-10 shadow-[0_25px_70px_rgba(2,6,23,0.8)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
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
                        d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                    Collaborate with Experts
                  </h3>
                  <p className="text-slate-400 text-base lg:text-lg">
                    Connect with founders, builders, and researchers to refine
                    your idea and get it market-ready faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="w-full px-4 py-12 sm:px-6 lg:px-8 xl:px-12 border-t border-slate-800 bg-slate-950/60">
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
    </div>
  );
}
