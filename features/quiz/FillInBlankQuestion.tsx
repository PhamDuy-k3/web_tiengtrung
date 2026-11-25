"use client";

import React, { useState, useMemo, useEffect } from "react";
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

    if (SYNTAX_TRAP_MAP[correctStr]) {
      SYNTAX_TRAP_MAP[correctStr].forEach(addDistractor);
    }
    if (HOMOPHONE_TRAPS_MAP[correctStr]) {
      HOMOPHONE_TRAPS_MAP[correctStr].forEach(addDistractor);
    }

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

  // Keyboard shortcut listener in options mode: 1, 2, 3, 4, 5, 6
  useEffect(() => {
    if (mode !== "options" || disabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const key = e.key;
      const num = parseInt(key, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        handleSelect(options[num - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, options, disabled]);

  return (
    <div className="space-y-6">
      {/* Mode Switcher for Intermediate and Advanced */}
      {diffConfig.allowTypingMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-parchment-100 rounded-2xl border border-parchment-300">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => switchMode("options")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === "options"
                  ? "bg-white text-celadon-dark shadow-sm border border-parchment-300"
                  : "text-ink-muted hover:text-ink"
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
                  ? "bg-white text-vermillion-deep shadow-sm border border-vermillion-soft"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Keyboard size={14} />
              <span>Tự gõ chữ vào chỗ trống (Thử thách)</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-ink-muted pr-2 hidden sm:block">
            {question.hskLevel >= 5 ? "🔴 Khuyên dùng: Tự gõ tay" : "🟡 Thử thách chủ động"}
          </span>
        </div>
      )}

      {/* Target blank preview */}
      <div className="p-5 bg-white border border-parchment-300 rounded-3xl shadow-soft text-center">
        <div className="text-sm font-semibold text-ink-muted mb-2">Từ bạn đã điền vào chỗ trống:</div>
        <div className="inline-block min-w-[120px] px-6 py-2.5 rounded-2xl bg-parchment-50 border-2 border-celadon-300 font-chinese text-2xl font-bold text-celadon-dark shadow-inner-soft">
          {typeof value === "string" ? value : Array.isArray(value) ? value.join(" ") : "___"}
        </div>
      </div>

      {/* TYPING MODE */}
      {mode === "typing" && (
        <div className="space-y-3 p-5 bg-gradient-to-b from-parchment-100 to-white rounded-3xl border-2 border-parchment-300 shadow-soft">
          <div className="flex items-start gap-2 text-xs text-ink-muted font-medium">
            <Sparkles size={16} className="text-gilt shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-ink">Chế độ Thử thách: Tự gõ từ vào chỗ trống</strong>
              Không có gợi ý đáp án. Hãy tự nhớ chữ Hán hoặc Pinyin và gõ vào ô bên dưới.
            </div>
          </div>

          <input
            type="text"
            disabled={disabled}
            value={typedInput}
            onChange={handleTypedChange}
            placeholder="Gõ chữ Hán hoặc Pinyin của từ cần điền..."
            className="w-full p-4 rounded-2xl border-2 border-parchment-300 focus:border-celadon focus:ring-4 focus:ring-celadon/15 bg-white text-ink font-chinese text-2xl text-center outline-none shadow-inner-soft transition-all"
          />

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Chấp nhận chữ Hán hoặc Pinyin không dấu/có dấu</span>
            <button
              type="button"
              onClick={() => switchMode("options")}
              className="text-celadon-dark hover:underline font-bold"
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
            <div className="flex items-center gap-1.5 text-xs text-gilt-deep font-semibold bg-gilt-light/50 px-3 py-1.5 rounded-xl border border-gilt-soft">
              <AlertCircle size={14} className="text-gilt shrink-0" />
              <span>Chú ý: Có các chữ viết giống nhau 1 nét hoặc phát âm gần giống nhau!</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {options.map((option, idx) => {
              const isSelected = value === option;
              const numKey = idx + 1;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelect(option)}
                  className={`p-4 rounded-2xl text-center font-chinese text-xl sm:text-2xl font-bold border-2 transition-all active:translate-y-0.5 relative ${
                    isSelected
                      ? "bg-celadon text-white border-celadon shadow-soft scale-[1.02]"
                      : "bg-white border-parchment-300 hover:border-celadon-300 hover:bg-parchment-100/50 text-ink"
                  }`}
                >
                  <span className="absolute top-1.5 left-2 text-[10px] font-mono opacity-50 font-sans">
                    [{numKey}]
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
