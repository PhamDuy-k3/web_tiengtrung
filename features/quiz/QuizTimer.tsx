"use client";

import React, { useEffect, useState } from "react";
import { Timer, Eye, EyeOff } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface QuizTimerProps {
  initialSeconds?: number;
  timeLimitSeconds?: number;
  onTimeUp?: () => void;
  onTick?: (seconds: number) => void;
  isRunning?: boolean;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  initialSeconds = 0,
  timeLimitSeconds,
  onTimeUp,
  onTick,
  isRunning = true,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (onTick) onTick(next);

        if (timeLimitSeconds && next >= timeLimitSeconds) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLimitSeconds, onTimeUp, onTick]);

  // If countdown mode
  const displaySeconds = timeLimitSeconds ? Math.max(0, timeLimitSeconds - seconds) : seconds;
  const isUrgent = timeLimitSeconds && displaySeconds <= 180; // under 3 mins

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-mono text-sm font-bold shadow-sm transition-colors ${
          isUrgent
            ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
            : "bg-white text-charcoal border-cream-300"
        }`}
      >
        <Timer size={16} className={isUrgent ? "text-red-500" : "text-amber-600"} />
        <span>{isVisible ? formatTime(displaySeconds) : "••:••"}</span>
      </div>

      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        title={isVisible ? "Ẩn đồng hồ" : "Hiện đồng hồ"}
        className="p-1.5 rounded-xl text-charcoal/50 hover:text-charcoal hover:bg-cream-200 transition-colors"
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};
