"use client";

import confetti from "canvas-confetti";

export function triggerConfetti() {
  if (typeof window === "undefined") return;

  // Multi-burst colorful confetti
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#EF5B5B", "#FFC94A", "#10B981", "#3B82F6"],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#EF5B5B", "#FFC94A", "#10B981", "#3B82F6"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
