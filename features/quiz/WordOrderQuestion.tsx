"use client";

import React, { useEffect, useState } from "react";
import { Question } from "@/types";
import { soundService } from "@/lib/sound";
import { shuffleArray } from "@/lib/shuffle";
import { RotateCcw, Keyboard, Grid, Sparkles, AlertCircle } from "lucide-react";
import {
  getLevelDifficultyConfig,
  getSmartTileDistractors,
} from "@/lib/difficulty";

export interface QuestionComponentProps {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export const WordOrderQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const diffConfig = getLevelDifficultyConfig(question.hskLevel);

  // Mode: "tiles" (click tiles) vs "typing" (self-typing from memory)
  const [mode, setMode] = useState<"tiles" | "typing">(
    diffConfig.defaultToTypingMode && (typeof value === "string" || !value)
      ? "typing"
      : typeof value === "string" && value.length > 0
      ? "typing"
      : "tiles"
  );

  const [bankTiles, setBankTiles] = useState<{ id: string; text: string }[]>([]);
  const [placedTiles, setPlacedTiles] = useState<{ id: string; text: string }[]>([]);
  const [typedText, setTypedText] = useState<string>(
    typeof value === "string" ? value : ""
  );

  useEffect(() => {
    // 1. Correct tiles
    const correctTiles = Array.isArray(question.correctAnswer)
      ? question.correctAnswer
      : question.tiles || [];

    // 2. Smart distractors: bẫy từ đồng âm, hình gần, cú pháp ngữ pháp chuẩn tiếng Trung
    const finalDistractors = getSmartTileDistractors(
      question,
      correctTiles,
      diffConfig.distractorTilesCount
    );

    const allTileTexts = [...correctTiles, ...finalDistractors];
    const mapped = allTileTexts.map((t, idx) => ({
      id: `tile-${idx}-${t}`,
      text: t,
    }));
    const shuffled = shuffleArray(mapped);

    if (Array.isArray(value) && value.length > 0) {
      const placed: { id: string; text: string }[] = [];
      const remaining = [...mapped];
      for (const valText of value) {
        const foundIdx = remaining.findIndex((r) => r.text === valText);
        if (foundIdx !== -1) {
          placed.push(remaining[foundIdx]);
          remaining.splice(foundIdx, 1);
        }
      }
      setPlacedTiles(placed);
      setBankTiles(remaining);
    } else {
      setBankTiles(shuffled);
      setPlacedTiles([]);
    }
  }, [
    question.id,
    question.tiles,
    question.distractors,
    question.distractorTiles,
    question.correctAnswer,
    question.hskLevel,
    diffConfig.distractorTilesCount,
  ]);

  const handleTileClickToPlace = (tile: { id: string; text: string }) => {
    if (disabled) return;
    soundService.playTileClick();
    const newPlaced = [...placedTiles, tile];
    const newBank = bankTiles.filter((t) => t.id !== tile.id);
    setPlacedTiles(newPlaced);
    setBankTiles(newBank);
    onChange(newPlaced.map((t) => t.text));
  };

  const handleTileClickToRemove = (tile: { id: string; text: string }) => {
    if (disabled) return;
    soundService.playTileClick();
    const newPlaced = placedTiles.filter((t) => t.id !== tile.id);
    const newBank = [...bankTiles, tile];
    setPlacedTiles(newPlaced);
    setBankTiles(newBank);
    onChange(newPlaced.map((t) => t.text));
  };

  const handleClearAll = () => {
    if (disabled) return;
    soundService.playTileClick();
    const newBank = [...bankTiles, ...placedTiles];
    setBankTiles(newBank);
    setPlacedTiles([]);
    onChange([]);
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTypedText(val);
    onChange(val);
  };

  const switchMode = (newMode: "tiles" | "typing") => {
    setMode(newMode);
    if (newMode === "typing") {
      onChange(typedText);
    } else {
      onChange(placedTiles.map((t) => t.text));
    }
  };

  const expectedLength = Array.isArray(question.correctAnswer)
    ? question.correctAnswer.length
    : question.tiles?.length || 5;

  return (
    <div className="space-y-5">
      {/* Mode Switcher for Intermediate and Advanced */}
      {diffConfig.allowTypingMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-parchment-100 rounded-2xl border border-parchment-300">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => switchMode("tiles")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === "tiles"
                  ? "bg-white text-celadon-dark shadow-sm border border-parchment-300"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Grid size={14} />
              <span>Dùng viên gạch (Nhiều từ bẫy)</span>
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
              <span>Tự gõ tay (Khó hơn - không lộ từ)</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-ink-muted pr-2 hidden sm:block">
            {question.hskLevel >= 5 ? "🔴 Khuyên dùng: Tự gõ tay" : "🟡 Thử thách chủ động"}
          </span>
        </div>
      )}

      {/* TYPING MODE (Self-writing for high challenge) */}
      {mode === "typing" && (
        <div className="space-y-3 p-5 bg-gradient-to-b from-parchment-100 to-white rounded-3xl border-2 border-parchment-300 shadow-soft">
          <div className="flex items-start gap-2 text-xs text-ink-muted font-medium">
            <Sparkles size={16} className="text-gilt shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-ink">Chế độ Thử thách: Tự gõ cả câu hoàn chỉnh</strong>
              Không có từ gợi ý sẵn. Bạn hãy tự nhớ và gõ câu tiếng Trung (chấp nhận cả chữ Hán hoặc Pinyin).
            </div>
          </div>

          <textarea
            rows={3}
            disabled={disabled}
            value={typedText}
            onChange={handleTypingChange}
            placeholder="Gõ câu trả lời của bạn vào đây (ví dụ: 我把作业做完了)..."
            className="w-full p-4 rounded-2xl border-2 border-parchment-300 focus:border-celadon focus:ring-4 focus:ring-celadon/15 bg-white text-ink font-chinese text-xl outline-none shadow-inner-soft resize-none transition-all"
          />

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Độ dài câu gợi ý: khoảng {expectedLength} từ</span>
            <button
              type="button"
              onClick={() => switchMode("tiles")}
              className="text-celadon-dark hover:underline font-bold"
            >
              Xem viên gạch gợi ý nếu thấy khó
            </button>
          </div>
        </div>
      )}

      {/* TILES MODE (Clicking bricks with high distractors and lookalikes) */}
      {mode === "tiles" && (
        <div className="space-y-5">
          {/* Challenge Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-parchment-100 rounded-2xl border border-parchment-300 text-xs text-ink">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={15} className="text-celadon-dark shrink-0" />
              <span>
                Khay có {bankTiles.length + placedTiles.length} từ (gồm{" "}
                {bankTiles.length + placedTiles.length - expectedLength} từ gây nhiễu, chữ gần giống)!
              </span>
            </div>
            <div className="font-semibold text-ink-muted">
              Câu chuẩn cần: <strong className="text-celadon-dark">{expectedLength}</strong> từ
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Bấm vào từ để xếp vào câu, bấm lại từ đã xếp để trả về:</span>
            {placedTiles.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs font-bold text-vermillion hover:text-vermillion-deep"
              >
                <RotateCcw size={13} />
                <span>Xếp lại từ đầu</span>
              </button>
            )}
          </div>

          {/* Target Placement Area (Slot) */}
          <div className="min-h-[90px] p-4 bg-white border-2 border-dashed border-celadon-300 rounded-3xl flex flex-wrap items-center gap-2.5 shadow-inner-soft transition-colors">
            {placedTiles.length === 0 ? (
              <span className="text-ink-muted/50 text-sm select-none italic px-2">
                Chọn các từ đúng bên dưới để đưa vào đây (bỏ qua các từ nhiễu)...
              </span>
            ) : (
              placedTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTileClickToRemove(tile)}
                  className="px-4 py-2.5 rounded-2xl bg-celadon text-white font-chinese text-xl font-bold shadow-soft hover:bg-celadon-600 active:translate-y-0.5 transition-all transform hover:scale-105"
                >
                  {tile.text}
                </button>
              ))
            )}
          </div>

          {/* Word Bank Area */}
          <div className="p-5 bg-parchment-100 rounded-3xl border border-parchment-300 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-ink-muted uppercase tracking-wider">
              <span>Khay từ vựng ({bankTiles.length} từ còn lại):</span>
              <span className="text-[11px] text-vermillion font-semibold lowercase">
                (chứa bẫy chữ viết gần giống)
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {bankTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTileClickToPlace(tile)}
                  className="px-4 py-2.5 rounded-2xl bg-white text-ink font-chinese text-xl font-bold shadow-soft border border-parchment-300 hover:border-celadon-300 hover:bg-parchment-50 active:translate-y-0.5 transition-all transform hover:scale-105"
                >
                  {tile.text}
                </button>
              ))}
              {bankTiles.length === 0 && (
                <span className="text-xs text-ink-muted/50 italic">
                  Đã đưa tất cả các từ vào câu!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
