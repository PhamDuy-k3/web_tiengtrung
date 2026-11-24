"use client";

import React, { useState, useEffect } from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";
import { soundService } from "@/lib/sound";
import { shuffleArray } from "@/lib/shuffle";
import {
  getLevelDifficultyConfig,
  getSmartMatchingDistractors,
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

    // 2. Themed smart distractor right answers (cùng trường từ vựng / chủ đề với câu hỏi)
    const existingRights = new Set(pairs.map((p) => p.right.trim()));
    const finalDistractors = getSmartMatchingDistractors(
      question,
      existingRights,
      diffConfig.matchingDistractorsCount
    );

    const distractorItems = finalDistractors.map((d, idx) => ({
      id: `distractor-${idx}`,
      text: d,
    }));

    // Combine correct items + smart distractors -> đúng chuẩn chủ đề
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
    "border-celadon bg-celadon-100/70 text-celadon-dark",
    "border-gilt bg-gilt-light/80 text-gilt-deep",
    "border-vermillion-soft bg-vermillion-light/70 text-vermillion-deep",
    "border-parchment-400 bg-parchment-200 text-ink",
    "border-celadon-400 bg-celadon-50 text-celadon-600",
    "border-gilt-dark bg-gilt-soft text-gilt-deep",
  ];

  const matchedPairsCount = Object.keys(currentMatches).length;
  const distractorCount = Math.max(0, shuffledRights.length - pairs.length);

  return (
    <div className="space-y-6">
      {/* Challenge Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 bg-parchment-100 rounded-2xl border border-parchment-300 text-xs text-ink shadow-soft">
        <div className="flex items-center gap-1.5 font-bold">
          <AlertCircle size={16} className="text-celadon-dark shrink-0" />
          <span>
            Cột phải có {shuffledRights.length} lựa chọn (gồm{" "}
            <strong className="text-vermillion underline">{distractorCount} đáp án nhiễu</strong> để tránh đoán mò)!
          </span>
        </div>
        <div className="font-semibold text-ink-muted">
          Đã ghép: <span className="font-bold text-celadon-dark text-sm">{matchedPairsCount}</span>/{pairs.length} cặp
        </div>
      </div>

      <div className="text-xs text-ink-muted flex items-center gap-2 flex-wrap">
        <span><strong className="text-celadon-dark">Bước 1:</strong> Bấm vào từ ở cột trái.</span>
        <span>•</span>
        <span><strong className="text-gilt-deep">Bước 2:</strong> Bấm chọn định nghĩa tương ứng ở cột phải để nối. Bấm lại để hủy nối.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column (Chinese Items: 4-5 items) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted uppercase tracking-wider pb-1">
            <span>Cột thuật ngữ / từ Hán ({pairs.length} từ):</span>
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
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all active:translate-y-0.5 shadow-soft ${
                  isMatched
                    ? `${colorClass} font-bold ring-1 ring-current`
                    : isSelected
                    ? "border-celadon bg-celadon-50 ring-2 ring-celadon text-celadon-dark scale-[1.01]"
                    : "bg-white border-parchment-300 hover:border-celadon-300 text-ink"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-chinese text-xl font-bold">{p.left}</div>
                  {isMatched && (
                    <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-current font-semibold truncate max-w-[180px]">
                      ➔ {currentMatches[p.id]}
                    </span>
                  )}
                  {!isMatched && isSelected && (
                    <span className="text-[11px] bg-celadon text-white px-2.5 py-0.5 rounded-full animate-pulse font-bold">
                      Chọn bên phải...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (Right options with distractors) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted uppercase tracking-wider pb-1">
            <span>Cột giải nghĩa / kết hợp ({shuffledRights.length} lựa chọn):</span>
            <span className="text-[11px] text-vermillion font-semibold lowercase">
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
                  className={`p-3.5 rounded-2xl border-2 transition-all active:translate-y-0.5 shadow-soft ${
                    isMatched
                      ? `${colorClass} font-bold cursor-pointer hover:opacity-90`
                      : selectedLeft
                      ? "bg-white border-celadon-300 hover:border-celadon cursor-pointer hover:bg-celadon-50 hover:scale-[1.01]"
                      : "bg-white border-parchment-300 text-ink cursor-pointer hover:border-parchment-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-medium">{r.text}</span>
                    {isMatched && (
                      <span className="text-[10px] uppercase font-bold text-ink-muted bg-white/80 px-2 py-0.5 rounded-full shrink-0">
                        Hủy nối
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
