"use client";

import React from "react";
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3.5">
        {options.map((option, idx) => {
          const isSelected = value === option;
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={`p-4 rounded-2xl flex items-center gap-3.5 border-2 transition-all active:translate-y-1 shadow-duo ${
                isSelected
                  ? "bg-coral text-white border-coral shadow-duo-coral font-bold"
                  : "bg-white border-amber-100 hover:border-amber-300 hover:bg-amber-50/50 text-charcoal"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-colors ${
                  isSelected
                    ? "bg-white text-coral border-white"
                    : "bg-cream-100 text-charcoal/70 border-cream-300"
                }`}
              >
                {letter}
              </span>
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
