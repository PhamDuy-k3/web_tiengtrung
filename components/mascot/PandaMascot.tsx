"use client";

import React, { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import mascotData from "@/app/mascot/hanyu_panda_mascot.json";

export type MascotAction = "idle" | "wave" | "celebrate" | "think" | "sad";

const ACTION_SEGMENTS: Record<MascotAction, [number, number]> = {
  idle: [0, 72],
  wave: [72, 144],
  celebrate: [144, 216],
  think: [216, 288],
  sad: [288, 360],
};

interface PandaMascotProps {
  action?: MascotAction;
  className?: string;
  loop?: boolean;
}

export const PandaMascot: React.FC<PandaMascotProps> = ({
  action = "idle",
  className = "w-32 h-28",
  loop = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const initialActionRef = useRef(action);

  useEffect(() => {
    let active = true;
    const root = mountRef.current;
    if (!root) return;

    const host = document.createElement("div");
    host.className = "w-full h-full";
    root.appendChild(host);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    void import("lottie-web").then(({ default: lottie }) => {
      if (!active) return;

      const anim = lottie.loadAnimation({
        container: host,
        renderer: "svg",
        loop: prefersReducedMotion ? false : loop,
        autoplay: false,
        // Clone so lottie-web does not mutate the imported JSON object across mounts
        animationData: JSON.parse(JSON.stringify(mascotData)),
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      animRef.current = anim;
      const segment = ACTION_SEGMENTS[initialActionRef.current];
      if (prefersReducedMotion) {
        anim.goToAndStop(segment[0] + 15, true);
      } else {
        anim.playSegments(segment, true);
      }
    });

    return () => {
      active = false;
      animRef.current?.destroy();
      animRef.current = null;
      host.remove();
    };
  }, [loop]);

  useEffect(() => {
    initialActionRef.current = action;
    const anim = animRef.current;
    if (!anim) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const segment = ACTION_SEGMENTS[action];
    if (prefersReducedMotion) {
      anim.goToAndStop(segment[0] + 15, true);
    } else {
      anim.playSegments(segment, true);
    }
  }, [action]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`select-none pointer-events-none ${className}`}
    />
  );
};
