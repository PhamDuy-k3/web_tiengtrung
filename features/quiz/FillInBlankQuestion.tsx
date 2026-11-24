"use client";

import React, { useState, useMemo } from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";
import { soundService } from "@/lib/sound";
import {
  getLevelDifficultyConfig,
  LOOKALIKE_CHARACTERS_MAP,
  HOMOPHONE_TRAPS_MAP,
  SYNTAX_TRAP_MAP,
} from "@/lib/difficulty";
import { Keyboard, Grid, Sparkles, AlertCircle } from "lucide-react";

export const FillInBlankQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const diffConfig = getLevelDifficultyConfig(question.hskLevel);

  const [mode, setMode] = useState<"options" | "typing">(
    diffConfig.defaultToTypingMode ? "typing" : "options"
  );
  const [typedInput, setTypedInput] = useState<string>(
    typeof value === "string" ? value : ""
  );

  const baseOptions = question.options || [];

  // Inject deceptive lookalike distractors, homophones, and syntax traps into options
  const correctStr = String(question.correctAnswer || "").trim();
  const options = useMemo(() => {
    const list = [...baseOptions];
    const addDistractor = (cand: string) => {
      if (cand && !list.includes(cand) && list.length < 6) {
        list.push(cand);
      }
    };

    // 1. Kiểm tra toàn bộ chuỗi đáp án đúng
    if (SYNTAX_TRAP_MAP[correctStr]) {
      SYNTAX_TRAP_MAP[correctStr].forEach(addDistractor);
    }
    if (HOMOPHONE_TRAPS_MAP[correctStr]) {
      HOMOPHONE_TRAPS_MAP[correctStr].forEach(addDistractor);
    }

    // 2. Kiểm tra từng ký tự trong chuỗi đáp án đúng
    for (const char of correctStr) {
      if (LOOKALIKE_CHARACTERS_MAP[char]) {
        LOOKALIKE_CHARACTERS_MAP[char].forEach(addDistractor);
      }
      if (HOMOPHONE_TRAPS_MAP[char]) {
        HOMOPHONE_TRAPS_MAP[char].forEach(addDistractor);
      }
      if (SYNTAX_TRAP_MAP[char]) {
        SYNTAX_TRAP_MAP[char].forEach(addDistractor);
      }
    }
    return list;
  }, [baseOptions, correctStr]);

  const handleSelect = (option: string) => {
    if (disabled) return;
    soundService.playTileClick();
    setTypedInput(option);
    onChange(option);
  };

  const handleTypedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedInput(val);
    onChange(val);
  };

  const switchMode = (newMode: "options" | "typing") => {
    setMode(newMode);
    if (newMode === "typing") {
      onChange(typedInput);
    } else {
      if (options.includes(typedInput)) {
        onChange(typedInput);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher for Intermediate and Advanced */}
      {diffConfig.allowTypingMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-cream-100 rounded-2xl border border-cream-300">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => switchMode("options")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === "options"
                  ? "bg-white text-coral shadow-sm border border-cream-300"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Grid size={14} />
              <span>Chọn từ danh sách</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode("typing")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === "typing"
                  ? "bg-white text-coral-deep shadow-sm border border-coral/30"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Keyboard size={14} />
              <span>Tự gõ chữ vào chỗ trống (Không lộ từ)</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-charcoal/50 pr-2 hidden sm:block">
            {question.hskLevel >= 5 ? "🔴 Khuyên dùng: Tự gõ tay" : "🟡 Thử thách chủ động"}
          </span>
        </div>
      )}

      {/* Target blank preview */}
      <div className="p-5 bg-white border border-amber-200/80 rounded-3xl shadow-sm text-center">
        <div className="text-sm text-charcoal/60 mb-2">Từ bạn đã điền vào chỗ trống:</div>
        <div className="inline-block min-w-[120px] px-6 py-2.5 rounded-2xl bg-amber-50 border-2 border-amber-300 font-chinese text-2xl font-bold text-coral">
          {value ? value : "___"}
        </div>
      </div>

      {/* TYPING MODE */}
      {mode === "typing" && (
        <div className="space-y-3 p-5 bg-gradient-to-b from-amber-50/50 to-white rounded-3xl border-2 border-amber-200/90 shadow-sm">
          <div className="flex items-start gap-2 text-xs text-amber-900 font-medium">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Chế độ Thử thách: Tự gõ từ vào chỗ trống</strong>
              Không có gợi ý đáp án. Hãy tự nhớ chữ Hán hoặc Pinyin và gõ vào ô bên dưới.
            </div>
          </div>

          <input
            type="text"
            disabled={disabled}
            value={typedInput}
            onChange={handleTypedChange}
            placeholder="Gõ chữ Hán hoặc Pinyin của từ cần điền..."
            className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-coral focus:ring-4 focus:ring-coral/15 bg-white text-charcoal font-chinese text-2xl text-center outline-none shadow-inner transition-all"
          />

          <div className="flex items-center justify-between text-xs text-charcoal/50">
            <span>Chấp nhận chữ Hán hoặc Pinyin không dấu/có dấu</span>
            <button
              type="button"
              onClick={() => switchMode("options")}
              className="text-coral hover:underline font-bold"
            >
              Chọn từ danh sách nếu cần gợi ý
            </button>
          </div>
        </div>
      )}

      {/* OPTIONS MODE */}
      {mode === "options" && (
        <div className="space-y-3">
          {options.length > baseOptions.length && (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>Chú ý: Có các chữ viết giống nhau 1 nét hoặc phát âm gần giống nhau!</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {options.map((option, idx) => {
              const isSelected = value === option;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(option)}
                  className={`p-4 rounded-2xl text-center font-chinese text-xl sm:text-2xl font-bold border-2 transition-all active:translate-y-1 shadow-duo ${
                    isSelected
                      ? "bg-coral text-white border-coral shadow-duo-coral scale-[1.02]"
                      : "bg-white border-amber-100 hover:border-amber-300 hover:bg-amber-50 text-charcoal"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
