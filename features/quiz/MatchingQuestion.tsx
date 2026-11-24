"use client";

import React, { useState, useEffect } from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";
import { soundService } from "@/lib/sound";
import { shuffleArray } from "@/lib/shuffle";
import {
  getLevelDifficultyConfig,
  LEVEL_DISTRACTOR_POOLS,
} from "@/lib/difficulty";
import { AlertCircle } from "lucide-react";

export const MatchingQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const diffConfig = getLevelDifficultyConfig(question.hskLevel);
  const pairs = question.pairs || [];
  // value is Record<pairId, selectedRightText>
  const currentMatches: Record<string, string> =
    value && typeof value === "object" ? value : {};

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    // 1. Correct right answers
    const correctRights = pairs.map((p) => ({ id: `correct-${p.id}`, text: p.right }));

    // 2. Distractor right answers (from question.distractors or level distractor pool)
    const existingRights = new Set(pairs.map((p) => p.right.trim()));
    const explicitDistractors = (question.distractors || []).filter(
      (d) => !existingRights.has(d.trim())
    );

    const levelPool =
      LEVEL_DISTRACTOR_POOLS[question.hskLevel]?.matching ||
      LEVEL_DISTRACTOR_POOLS[1].matching;

    const finalDistractors: string[] = [...explicitDistractors];
    for (const fb of levelPool) {
      if (!existingRights.has(fb.trim()) && !finalDistractors.includes(fb)) {
        finalDistractors.push(fb);
      }
      if (finalDistractors.length >= diffConfig.matchingDistractorsCount) break;
    }

    const distractorItems = finalDistractors.map((d, idx) => ({
      id: `distractor-${idx}`,
      text: d,
    }));

    // Combine correct items + 3-8 distractors -> ratio 5 vs 8-13
    const combined = [...correctRights, ...distractorItems];
    setShuffledRights(shuffleArray(combined));
  }, [
    question.id,
    question.distractors,
    pairs,
    question.hskLevel,
    diffConfig.matchingDistractorsCount,
  ]);

  const handleLeftClick = (pairId: string) => {
    if (disabled) return;
    soundService.playTileClick();
    if (selectedLeft === pairId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(pairId);
    }
  };

  const handleRightClick = (rightText: string) => {
    if (disabled) return;

    // Check if this rightText is already matched to some left item
    const alreadyMatchedLeftId = Object.keys(currentMatches).find(
      (k) => currentMatches[k] === rightText
    );

    // If clicked on an already-matched right item, unmatch it
    if (alreadyMatchedLeftId) {
      soundService.playTileClick();
      const copy = { ...currentMatches };
      delete copy[alreadyMatchedLeftId];
      onChange(copy);
      return;
    }

    // If no left item is currently selected, do nothing
    if (!selectedLeft) return;

    soundService.playTileClick();
    const updated = {
      ...currentMatches,
      [selectedLeft]: rightText,
    };
    onChange(updated);
    setSelectedLeft(null);
  };

  const handleUnmatch = (pairId: string) => {
    if (disabled) return;
    soundService.playTileClick();
    const copy = { ...currentMatches };
    delete copy[pairId];
    onChange(copy);
  };

  const colors = [
    "border-coral bg-coral/10 text-coral-dark",
    "border-honey-dark bg-honey/20 text-amber-900",
    "border-mint bg-mint-light text-mint-dark",
    "border-blue-400 bg-blue-50 text-blue-900",
    "border-purple-400 bg-purple-50 text-purple-900",
    "border-pink-400 bg-pink-50 text-pink-900",
  ];

  const matchedPairsCount = Object.keys(currentMatches).length;
  const distractorCount = Math.max(0, shuffledRights.length - pairs.length);

  return (
    <div className="space-y-6">
      {/* Challenge Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-300 text-xs text-amber-950 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold">
          <AlertCircle size={16} className="text-amber-700 shrink-0" />
          <span>
            Cột phải có {shuffledRights.length} lựa chọn (gồm{" "}
            <strong className="text-coral underline">{distractorCount} đáp án nhiễu</strong> để tránh đoán mò)!
          </span>
        </div>
        <div className="font-semibold text-charcoal/70">
          Đã ghép: <span className="font-bold text-coral text-sm">{matchedPairsCount}</span>/{pairs.length} cặp
        </div>
      </div>

      <div className="text-xs text-charcoal/70">
        <span className="font-bold text-coral">Bước 1:</span> Bấm vào từ tiếng Trung ở cột trái.
        <span className="mx-2">•</span>
        <span className="font-bold text-amber-700">Bước 2:</span> Chọn nghĩa đúng ở cột phải để nối. Bấm lại vào từ đã ghép để hủy nối.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column (Chinese Items: 4-5 items) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal/50 uppercase tracking-wider pb-1">
            <span>Cột chữ Hán ({pairs.length} từ):</span>
          </div>
          {pairs.map((p, idx) => {
            const isSelected = selectedLeft === p.id;
            const isMatched = !!currentMatches[p.id];
            const colorClass = isMatched ? colors[idx % colors.length] : "";

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isMatched) handleUnmatch(p.id);
                  else handleLeftClick(p.id);
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all active:translate-y-1 shadow-duo ${
                  isMatched
                    ? `${colorClass} font-bold ring-1 ring-current`
                    : isSelected
                    ? "border-coral bg-coral/15 ring-2 ring-coral text-coral-dark scale-[1.02]"
                    : "bg-white border-amber-100 hover:border-amber-300 text-charcoal"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-chinese text-xl font-bold">{p.left}</div>
                  {isMatched && (
                    <span className="text-[11px] bg-white/90 px-2.5 py-0.5 rounded-full border border-current font-medium">
                      Đã nối ➔ {currentMatches[p.id]}
                    </span>
                  )}
                  {!isMatched && isSelected && (
                    <span className="text-[11px] bg-coral text-white px-2 py-0.5 rounded-full animate-pulse">
                      Chọn nghĩa bên phải...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (Vietnamese Items: with heavy distractors) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal/50 uppercase tracking-wider pb-1">
            <span>Cột nghĩa tiếng Việt ({shuffledRights.length} lựa chọn):</span>
            <span className="text-[11px] text-amber-700 font-semibold lowercase">
              ({distractorCount} đáp án nhiễu)
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {shuffledRights.map((r) => {
              const matchedLeftId = Object.keys(currentMatches).find(
                (k) => currentMatches[k] === r.text
              );
              const isMatched = !!matchedLeftId;
              const leftIndex = pairs.findIndex((p) => p.id === matchedLeftId);
              const colorClass = isMatched ? colors[leftIndex % colors.length] : "";

              return (
                <div
                  key={r.id}
                  onClick={() => handleRightClick(r.text)}
                  className={`p-3.5 rounded-2xl border-2 transition-all active:translate-y-1 shadow-duo ${
                    isMatched
                      ? `${colorClass} font-bold cursor-pointer hover:opacity-90`
                      : selectedLeft
                      ? "bg-white border-amber-300 hover:border-coral cursor-pointer hover:bg-coral/5 hover:scale-[1.01]"
                      : "bg-white border-amber-100/70 text-charcoal/80 cursor-pointer hover:border-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-medium">{r.text}</span>
                    {isMatched && (
                      <span className="text-[10px] uppercase font-bold text-charcoal/50 bg-white/70 px-2 py-0.5 rounded-full">
                        Bấm để hủy nối
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
