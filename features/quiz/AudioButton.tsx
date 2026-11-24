"use client";

import React, { useState } from "react";
import { Volume2, Snail, VolumeX } from "lucide-react";
import { speechService } from "@/lib/speech";

interface AudioButtonProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  showSlowOption?: boolean;
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  size = "md",
  showSlowOption = true,
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowPlaying, setIsSlowPlaying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  if (!text) return null;

  const handleSpeak = async (rate: number = 0.9, isSlow: boolean = false) => {
    if (!speechService.isAvailable()) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 4000);
      return;
    }

    if (isSlow) setIsSlowPlaying(true);
    else setIsPlaying(true);

    try {
      await speechService.speak(text, rate);
    } catch {
      // Fallback
    } finally {
      setIsPlaying(false);
      setIsSlowPlaying(false);
    }
  };

  const btnClasses = {
    sm: "p-2 text-sm",
    md: "p-3 text-base",
    lg: "p-4 text-lg",
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 30,
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Normal Speech */}
      <button
        type="button"
        onClick={() => handleSpeak(0.9, false)}
        disabled={isPlaying || isSlowPlaying}
        aria-label="Nghe phát âm chuẩn"
        title="Nghe phát âm chuẩn"
        className={`${btnClasses[size]} rounded-2xl bg-coral/10 hover:bg-coral/20 text-coral font-bold flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm border border-coral/30`}
      >
        <Volume2
          size={iconSizes[size]}
          className={isPlaying ? "animate-pulse text-coral-dark" : ""}
        />
      </button>

      {/* Slow Speech (Turtle Mode) */}
      {showSlowOption && (
        <button
          type="button"
          onClick={() => handleSpeak(0.6, true)}
          disabled={isPlaying || isSlowPlaying}
          aria-label="Nghe phát âm chậm"
          title="Nghe phát âm chậm"
          className={`${btnClasses[size]} rounded-2xl bg-honey/20 hover:bg-honey/30 text-amber-700 font-bold flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm border border-honey/40`}
        >
          <Snail
            size={iconSizes[size]}
            className={isSlowPlaying ? "animate-pulse text-amber-800" : ""}
          />
        </button>
      )}

      {showWarning && (
        <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
          Trình duyệt chưa tải được giọng đọc zh-CN
        </span>
      )}
    </div>
  );
};
