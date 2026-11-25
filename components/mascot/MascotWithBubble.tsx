"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { PandaMascot, MascotAction } from "./PandaMascot";
import { soundService } from "@/lib/sound";

export type MascotTone = "celadon" | "gilt" | "vermillion";

interface MascotWithBubbleProps {
  action: MascotAction;
  message: string;
  tone?: MascotTone;
  size?: "sm" | "md" | "lg";
  onClose?: () => void;
  closeLabel?: string;
  autoPlaySound?: boolean;
}

const TONE_BORDER: Record<MascotTone, string> = {
  celadon: "#3DB38A",
  gilt: "#F59E0B",
  vermillion: "#E05252",
};

const TONE_SHADOW: Record<MascotTone, string> = {
  celadon: "shadow-[3px_4px_0px_#2E9A74]",
  gilt: "shadow-[3px_4px_0px_#D97706]",
  vermillion: "shadow-[3px_4px_0px_#C23B3B]",
};

const MASCOT_SIZE: Record<NonNullable<MascotWithBubbleProps["size"]>, string> = {
  sm: "w-36 h-32 sm:w-40 sm:h-36",
  md: "w-48 h-44 sm:w-56 sm:h-48",
  lg: "w-72 h-64 sm:w-96 sm:h-80",
};

const MASCOT_TOP_OFFSET: Record<NonNullable<MascotWithBubbleProps["size"]>, string> = {
  sm: "-mt-3",
  md: "-mt-4",
  lg: "-mt-6",
};

const BUBBLE_SIZE: Record<NonNullable<MascotWithBubbleProps["size"]>, string> = {
  sm: "w-[195px] sm:w-[210px] min-h-[88px] px-4 py-3.5 pb-7",
  md: "w-[195px] sm:w-[215px] min-h-[96px] px-4 py-4 pb-7",
  lg: "w-[225px] sm:w-[250px] min-h-[124px] px-5 py-5 pb-8",
};

const BUBBLE_OFFSET: Record<NonNullable<MascotWithBubbleProps["size"]>, string> = {
  sm: "ml-12 sm:ml-16",
  md: "ml-20 sm:ml-24",
  lg: "ml-32 sm:ml-44",
};

export const MascotWithBubble: React.FC<MascotWithBubbleProps> = ({
  action,
  message,
  tone = "celadon",
  size = "md",
  onClose,
  closeLabel = "Đóng",
  autoPlaySound = true,
}) => {
  const borderColor = TONE_BORDER[tone];
  const [muted, setMuted] = useState(false);
  const [awaitingGesture, setAwaitingGesture] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const muteBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    let cleanupGesture: (() => void) | null = null;
    const initialMuted = soundService.isMascotMuted();
    setMuted(initialMuted);
    setAwaitingGesture(false);

    if (autoPlaySound && !initialMuted) {
      void soundService.playMascotAction(action).then((played) => {
        if (!active || played) return;

        // Browser blocked autoplay before first interaction: highlight speaker
        // and auto-play on the very first tap/keypress anywhere in the page.
        setAwaitingGesture(true);
        const onFirstGesture = (event: Event) => {
          const target = event.target as Node | null;
          if (
            target &&
            (closeBtnRef.current?.contains(target) || muteBtnRef.current?.contains(target))
          ) {
            return;
          }
          cleanupGesture?.();
          cleanupGesture = null;
          if (!active || soundService.isMascotMuted()) return;
          setAwaitingGesture(false);
          void soundService.playMascotAction(action, true);
        };

        window.addEventListener("pointerdown", onFirstGesture, { capture: true });
        window.addEventListener("keydown", onFirstGesture, { capture: true });
        cleanupGesture = () => {
          window.removeEventListener("pointerdown", onFirstGesture, { capture: true });
          window.removeEventListener("keydown", onFirstGesture, { capture: true });
        };
      });
    }

    return () => {
      active = false;
      cleanupGesture?.();
      soundService.stopMascotSound();
    };
  }, [action, autoPlaySound]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (awaitingGesture && !muted) {
      // First click on speaker unlocks & plays immediately instead of muting
      setAwaitingGesture(false);
      void soundService.playMascotAction(action, true);
      return;
    }
    const nextMuted = !muted;
    setMuted(nextMuted);
    setAwaitingGesture(false);
    soundService.setMascotMuted(nextMuted);
    if (!nextMuted) {
      void soundService.playMascotAction(action, true);
    }
  };

  const handleReplay = () => {
    if (muted) return;
    setAwaitingGesture(false);
    void soundService.playMascotAction(action, true);
  };

  return (
    <div className="inline-flex flex-col items-start select-none">
      {/* Speech Bubble */}
      <div
        style={{ borderColor }}
        className={`relative bg-white border-[3px] rounded-3xl flex items-center text-left ${TONE_SHADOW[tone]} ${BUBBLE_SIZE[size]} ${BUBBLE_OFFSET[size]} z-10`}
      >
        {onClose && (
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => {
              soundService.stopMascotSound();
              onClose();
            }}
            aria-label={closeLabel}
            title={closeLabel}
            className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-vermillion hover:bg-vermillion-dark text-white border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}

        <p className="text-xs sm:text-sm font-semibold text-ink leading-relaxed">
          {message}
        </p>

        {/* Speaker / Mute toggle at bottom-right inside bubble */}
        <button
          ref={muteBtnRef}
          type="button"
          onClick={handleToggleMute}
          aria-label={
            muted
              ? "Bật âm thanh linh vật"
              : awaitingGesture
              ? "Bấm để nghe âm thanh"
              : "Tắt âm thanh linh vật"
          }
          title={
            muted
              ? "Bật âm thanh"
              : awaitingGesture
              ? "Trình duyệt chặn tự phát — bấm để nghe"
              : "Tắt âm thanh"
          }
          className={`absolute bottom-2 right-2.5 h-6 rounded-full flex items-center justify-center gap-1 px-1.5 transition-colors ${
            awaitingGesture && !muted
              ? "bg-celadon-100 text-celadon-dark animate-pulse"
              : "text-ink-light hover:text-ink hover:bg-parchment-100"
          }`}
        >
          {awaitingGesture && !muted && (
            <span className="text-[10px] font-bold">Nghe</span>
          )}
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {/* Curved tail pointing down-left to mascot head */}
        <svg
          aria-hidden="true"
          viewBox="0 0 28 20"
          className="absolute left-5 -bottom-[17px] w-7 h-5 overflow-visible"
        >
          <path d="M2 0 L24 0 L10 4 Z" fill="#FFFFFF" />
          <path
            d="M4 0 C7 8, 5 14, 0 18 C9 15, 16 8, 22 0"
            fill="#FFFFFF"
            stroke={borderColor}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <rect x="2" y="-3" width="22" height="5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Mascot below bubble (tap to replay sound) */}
      <button
        type="button"
        onClick={handleReplay}
        aria-label="Phát lại âm thanh của Han Han"
        title="Bấm để nghe Han Han"
        className={`${MASCOT_TOP_OFFSET[size]} cursor-pointer focus:outline-none`}
      >
        <PandaMascot action={action} className={MASCOT_SIZE[size]} />
      </button>
    </div>
  );
};
