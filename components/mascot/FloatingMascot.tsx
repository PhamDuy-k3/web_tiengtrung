"use client";

import React from "react";
import { MascotAction } from "./PandaMascot";
import { MascotWithBubble, MascotTone } from "./MascotWithBubble";

interface FloatingMascotProps {
  action: MascotAction;
  title?: string;
  message: string;
  onClose?: () => void;
  tone?: "celadon" | "gilt" | "vermillion" | "parchment";
  bottomOffsetClass?: string;
}

export const FloatingMascot: React.FC<FloatingMascotProps> = ({
  action,
  message,
  onClose,
  tone = "celadon",
  bottomOffsetClass = "bottom-20 md:bottom-6",
}) => {
  const mappedTone: MascotTone = tone === "parchment" ? "celadon" : tone;

  return (
    <aside
      aria-live="polite"
      className={`fixed right-3 sm:right-6 ${bottomOffsetClass} z-40 animate-fade-up`}
    >
      <MascotWithBubble
        action={action}
        tone={mappedTone}
        size="sm"
        message={message}
        onClose={onClose}
        closeLabel="Ẩn linh vật"
      />
    </aside>
  );
};
