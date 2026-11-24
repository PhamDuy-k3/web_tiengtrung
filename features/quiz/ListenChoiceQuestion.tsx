"use client";

import React from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";
import { AudioButton } from "./AudioButton";
import { soundService } from "@/lib/sound";

export const ListenChoiceQuestion: React.FC<QuestionComponentProps> = ({
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
      {/* Central Audio Control Card */}
      <div className="p-8 bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-amber-200/80 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
        <span className="text-sm font-semibold text-charcoal/70">
          Bấm để nghe phát âm tiếng Trung:
        </span>
        <AudioButton
          text={question.chineseText}
          size="lg"
          showSlowOption={true}
        />
        <span className="text-xs text-charcoal/50">
          (Nút loa đỏ: tốc độ bình thường | Nút ốc sên vàng: tốc độ chậm)
        </span>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((option, idx) => {
          const isSelected = value === option;
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={`p-4 rounded-2xl text-left flex items-start gap-3.5 border-2 transition-all active:translate-y-1 shadow-duo ${
                isSelected
                  ? "bg-coral/10 border-coral text-coral-deep shadow-duo-coral font-bold"
                  : "bg-white border-amber-100 hover:border-amber-300 hover:bg-amber-50/50 text-charcoal"
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
