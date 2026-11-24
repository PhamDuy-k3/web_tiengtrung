"use client";

import React, { useEffect } from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";
import { soundService } from "@/lib/sound";

export const PinyinChoiceQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const options = question.options || [];

  const handleSelect = (option: string) => {
    if (disabled) return;
    soundService.playTileClick();
    onChange(option);
  };

  // Keyboard shortcut listener: 1, 2, 3, 4, or A, B, C, D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const key = e.key.toUpperCase();
      let selectedIdx = -1;
      if (key === "1" || key === "A") selectedIdx = 0;
      else if (key === "2" || key === "B") selectedIdx = 1;
      else if (key === "3" || key === "C") selectedIdx = 2;
      else if (key === "4" || key === "D") selectedIdx = 3;

      if (selectedIdx >= 0 && selectedIdx < options.length) {
        handleSelect(options[selectedIdx]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, disabled]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((option, idx) => {
          const isSelected = value === option;
          const letter = String.fromCharCode(65 + idx);
          const numKey = idx + 1;

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={`p-4 rounded-2xl flex items-center gap-3.5 border-2 transition-all active:translate-y-0.5 ${
                isSelected
                  ? "bg-celadon-50 border-celadon text-ink shadow-soft font-bold scale-[1.01]"
                  : "bg-white border-parchment-300 hover:border-celadon-300 hover:bg-parchment-100/50 text-ink"
              }`}
            >
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border transition-colors ${
                    isSelected
                      ? "bg-celadon text-white border-celadon shadow-sm"
                      : "bg-parchment-200 text-ink-muted border-parchment-300"
                  }`}
                >
                  {letter}
                </span>
                <span className="text-[10px] font-mono text-ink-muted/60 font-semibold hidden sm:inline">
                  [{numKey}]
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-sans">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
