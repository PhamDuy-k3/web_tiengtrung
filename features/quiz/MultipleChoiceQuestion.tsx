"use client";

import React from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";
import { soundService } from "@/lib/sound";

export const MultipleChoiceQuestion: React.FC<QuestionComponentProps> = ({
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((option, idx) => {
          const isSelected = value === option;
          const letter = String.fromCharCode(65 + idx); // A, B, C, D

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={`p-4 rounded-2xl text-left flex items-start gap-3.5 border-2 transition-all transform duration-150 active:translate-y-1 shadow-duo ${
                isSelected
                  ? "bg-coral/10 border-coral text-coral-deep shadow-duo-coral font-bold"
                  : "bg-white border-amber-100/80 hover:border-coral/40 hover:bg-amber-50/50 text-charcoal"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-colors ${
                  isSelected
                    ? "bg-coral text-white border-coral"
                    : "bg-cream-100 text-charcoal/70 border-cream-300"
                }`}
              >
                {letter}
              </span>
              <span className="text-base sm:text-lg leading-snug pt-0.5">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
