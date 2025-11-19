"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type TracingBeamProps = {
  children: React.ReactNode;
  className?: string;
  beamClassName?: string;
};

export function TracingBeam({
  children,
  className,
  beamClassName,
}: TracingBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.15"],
  });

  const beamY = useTransform(scrollYProgress, [0, 1], ["0%", "90%"]);
  const beamOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 0.9]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.div
        aria-hidden="true"
        style={{ top: beamY, opacity: beamOpacity }}
        className={cn(
          "pointer-events-none absolute left-4 hidden h-32 w-[2px] rounded-full bg-gradient-to-b from-transparent via-[#14b8a6] to-transparent md:block",
          beamClassName
        )}
      />
      <div className="relative pl-0 md:pl-12">{children}</div>
    </div>
  );
}
