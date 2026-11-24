"use client";

import React, { useState } from "react";
import { Volume2, Snail, Rabbit, VolumeX, Sparkles } from "lucide-react";
import { speechService } from "@/lib/speech";

interface AudioButtonProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  showSlowOption?: boolean;
  className?: string;
  autoPlay?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  size = "md",
  showSlowOption = true,
  className = "",
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  if (!text) return null;

  const handleSpeak = async (rate: number = 0.95) => {
    if (!speechService.isAvailable()) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 4000);
      return;
    }

    setIsPlaying(true);
    setActiveSpeed(rate);

    try {
      await speechService.speak(text, rate);
    } catch {
      // Fallback
    } finally {
      setIsPlaying(false);
      setActiveSpeed(null);
    }
  };

  const btnClasses = {
    sm: "p-2 text-sm",
    md: "p-2.5 sm:p-3 text-base",
    lg: "p-3.5 sm:p-4 text-lg",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26,
  };

  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      {/* Normal Speech (1.0x) */}
      <button
        type="button"
        onClick={() => handleSpeak(0.95)}
        disabled={isPlaying}
        aria-label="Phát âm tiếng Trung chuẩn (1.0x)"
        title="Nghe chuẩn (1.0x)"
        className={`${btnClasses[size]} rounded-2xl ${
          activeSpeed === 0.95
            ? "bg-celadon text-white shadow-soft scale-95"
            : "bg-celadon-100 hover:bg-celadon-200 text-celadon-dark hover:text-celadon-600 border border-celadon-300"
        } font-bold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm`}
      >
        <Volume2
          size={iconSizes[size]}
          className={activeSpeed === 0.95 ? "animate-pulse" : ""}
        />
        {size !== "sm" && <span className="text-xs font-bold font-mono">1.0x</span>}
      </button>

      {/* Slow Speech (Turtle Mode 0.75x) */}
      {showSlowOption && (
        <button
          type="button"
          onClick={() => handleSpeak(0.65)}
          disabled={isPlaying}
          aria-label="Nghe phát âm chậm (0.75x)"
          title="Nghe chậm (0.75x)"
          className={`${btnClasses[size]} rounded-2xl ${
            activeSpeed === 0.65
              ? "bg-gilt text-white shadow-soft scale-95"
              : "bg-gilt-light hover:bg-gilt-soft text-gilt-deep hover:text-gilt-dark border border-gilt-soft"
          } font-bold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm`}
        >
          <Snail
            size={iconSizes[size]}
            className={activeSpeed === 0.65 ? "animate-pulse" : ""}
          />
          {size !== "sm" && <span className="text-xs font-bold font-mono">0.75x</span>}
        </button>
      )}

      {/* Fast Speed (1.25x for advanced practice) */}
      {showSlowOption && size === "lg" && (
        <button
          type="button"
          onClick={() => handleSpeak(1.2)}
          disabled={isPlaying}
          aria-label="Nghe tốc độ nhanh (1.2x)"
          title="Nghe nhanh (1.2x)"
          className={`${btnClasses[size]} rounded-2xl ${
            activeSpeed === 1.2
              ? "bg-vermillion text-white shadow-soft scale-95"
              : "bg-vermillion-light hover:bg-vermillion-soft text-vermillion-deep border border-vermillion-soft"
          } font-bold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm`}
        >
          <Rabbit
            size={iconSizes[size]}
            className={activeSpeed === 1.2 ? "animate-pulse" : ""}
          />
          <span className="text-xs font-bold font-mono">1.2x</span>
        </button>
      )}

      {showWarning && (
        <span className="text-xs text-vermillion-deep bg-vermillion-light border border-vermillion-soft px-2.5 py-1 rounded-xl">
          Trình duyệt đang khởi động bộ đọc tiếng Trung...
        </span>
      )}
    </div>
  );
};
