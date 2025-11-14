"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useEffect, useRef } from "react";

type GlowingEffectProps = {
  className?: string;
  spread?: number;
  glow?: boolean;
  proximity?: number;
  inactiveZone?: number;
  disabled?: boolean;
};

export function GlowingEffect({
  className,
  spread = 80,
  glow = true,
  proximity = 96,
  inactiveZone = 0.25,
  disabled = false,
}: GlowingEffectProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const intensity = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const node = overlayRef.current?.parentElement;
    if (!node || disabled) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX.set(x);
      mouseY.set(y);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distance = Math.hypot(x - centerX, y - centerY);
      const maxDistance = Math.max(proximity, Math.hypot(centerX, centerY));
      const nextIntensity = Math.max(
        0,
        1 - Math.min(distance / maxDistance, 1)
      );
      intensity.set(nextIntensity);
    };

    const handlePointerLeave = () => {
      intensity.set(0);
    };

    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [disabled, intensity, mouseX, mouseY, proximity]);

  const gradient = useMotionTemplate`
    radial-gradient(
      ${spread}px circle at ${mouseX}px ${mouseY}px,
      rgba(20,184,166, ${glow ? "0.45" : "0.3"}),
      transparent ${(inactiveZone * 100).toFixed(0)}%
    )
  `;

  return (
    <motion.div
      ref={overlayRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition duration-300",
        className
      )}
      style={{
        backgroundImage: gradient,
        opacity: disabled ? 0 : intensity,
        mixBlendMode: glow ? "screen" : "normal",
        padding: "1.5px",
        boxSizing: "border-box",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        borderRadius: "inherit",
      }}
    />
  );
}
