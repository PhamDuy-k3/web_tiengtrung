"use client";

import React, { useEffect, useState } from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";
import { AudioButton } from "./AudioButton";
import { soundService } from "@/lib/sound";
import { shuffleArray } from "@/lib/shuffle";
import { RotateCcw, Keyboard, Grid, Sparkles, AlertCircle } from "lucide-react";
import {
  getLevelDifficultyConfig,
  getLookalikeDistractors,
  LEVEL_DISTRACTOR_POOLS,
} from "@/lib/difficulty";

export const ListenWordOrderQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const diffConfig = getLevelDifficultyConfig(question.hskLevel);

  // Mode: "tiles" (click tiles) vs "typing" (self-typing from audio)
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

    // 2. Lookalike distractors (形近字 / 近音字)
    const lookalikes = getLookalikeDistractors(correctTiles);

    // 3. Explicit or level pool distractors
    const existingSet = new Set(correctTiles);
    const explicitDistractors = (
      question.distractorTiles ||
      question.distractors ||
      []
    ).filter((d) => !existingSet.has(d));

    const levelPool =
      LEVEL_DISTRACTOR_POOLS[question.hskLevel]?.tiles ||
      LEVEL_DISTRACTOR_POOLS[1].tiles;

    // Build final distractors prioritizing lookalikes first
    const finalDistractors: string[] = [];
    for (const lk of lookalikes) {
      if (!existingSet.has(lk) && !finalDistractors.includes(lk)) {
        finalDistractors.push(lk);
      }
    }
    for (const exp of explicitDistractors) {
      if (!existingSet.has(exp) && !finalDistractors.includes(exp)) {
        finalDistractors.push(exp);
      }
    }
    for (const poolItem of levelPool) {
      if (!existingSet.has(poolItem) && !finalDistractors.includes(poolItem)) {
        finalDistractors.push(poolItem);
      }
      if (finalDistractors.length >= diffConfig.distractorTilesCount) break;
    }

    const allTileTexts = [...correctTiles, ...finalDistractors];
    const mapped = allTileTexts.map((t, idx) => ({
      id: `ltile-${idx}-${t}`,
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
    <div className="space-y-6">
      {/* Audio Prompt Card */}
      <div className="p-6 bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-amber-200/90 shadow-sm flex flex-col items-center justify-center gap-3 text-center">
        <span className="text-sm font-semibold text-charcoal/70">
          Nghe phát âm chuẩn và sắp xếp lại câu tiếng Trung bạn nghe được:
        </span>
        <AudioButton
          text={question.chineseText}
          size="lg"
          showSlowOption={true}
        />
        <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-100/70 px-3 py-1 rounded-full">
          <span>⚠️ Chú ý: Lắng nghe kỹ âm điệu và phân biệt các chữ viết gần giống nhau!</span>
        </div>
      </div>

      {/* Mode Switcher for Intermediate and Advanced */}
      {diffConfig.allowTypingMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-cream-100 rounded-2xl border border-cream-300">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => switchMode("tiles")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === "tiles"
                  ? "bg-white text-coral shadow-sm border border-cream-300"
                  : "text-charcoal/60 hover:text-charcoal"
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
                  ? "bg-white text-coral-deep shadow-sm border border-coral/30"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Keyboard size={14} />
              <span>Tự gõ tay (Nghe - Chép chính tả thuần túy)</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-charcoal/50 pr-2 hidden sm:block">
            {question.hskLevel >= 5 ? "🔴 Khuyên dùng: Tự gõ tay" : "🟡 Thử thách chủ động"}
          </span>
        </div>
      )}

      {/* TYPING MODE (Dictation / active recall) */}
      {mode === "typing" && (
        <div className="space-y-3 p-5 bg-gradient-to-b from-amber-50/50 to-white rounded-3xl border-2 border-amber-200/90 shadow-sm">
          <div className="flex items-start gap-2 text-xs text-amber-900 font-medium">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Chế độ Nghe - Chép chính tả (Dictation)</strong>
              Nghe audio và tự gõ lại câu hoàn chỉnh mà không có bất kỳ từ gợi ý nào (chấp nhận cả chữ Hán hoặc Pinyin).
            </div>
          </div>

          <textarea
            rows={3}
            disabled={disabled}
            value={typedText}
            onChange={handleTypingChange}
            placeholder="Gõ lại câu bạn nghe được vào đây (ví dụ: 他正在听音乐)..."
            className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-coral focus:ring-4 focus:ring-coral/15 bg-white text-charcoal font-chinese text-xl outline-none shadow-inner resize-none transition-all"
          />

          <div className="flex items-center justify-between text-xs text-charcoal/50">
            <span>Độ dài câu gợi ý: khoảng {expectedLength} từ</span>
            <button
              type="button"
              onClick={() => switchMode("tiles")}
              className="text-coral hover:underline font-bold"
            >
              Chuyển sang chọn viên gạch nếu cần gợi ý
            </button>
          </div>
        </div>
      )}

      {/* TILES MODE */}
      {mode === "tiles" && (
        <div className="space-y-5">
          {/* Challenge Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={15} className="text-amber-700 shrink-0" />
              <span>
                Khay có {bankTiles.length + placedTiles.length} từ (gồm{" "}
                {bankTiles.length + placedTiles.length - expectedLength} từ gây nhiễu, chữ gần giống)!
              </span>
            </div>
            <div className="font-semibold text-charcoal/60">
              Câu chuẩn cần: <strong className="text-coral">{expectedLength}</strong> từ
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-charcoal/70">
            <span>Bấm vào từ để xếp vào câu theo đúng âm thanh vừa nghe:</span>
            {placedTiles.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs font-bold text-coral hover:text-coral-dark"
              >
                <RotateCcw size={13} />
                <span>Xếp lại từ đầu</span>
              </button>
            )}
          </div>

          {/* Target Placed Slot */}
          <div className="min-h-[85px] p-4 bg-white border-2 border-dashed border-amber-300 rounded-3xl flex flex-wrap items-center gap-2.5 shadow-inner">
            {placedTiles.length === 0 ? (
              <span className="text-charcoal/40 text-sm select-none italic px-2">
                Bấm vào các từ bên dưới theo đúng thứ tự câu bạn nghe được...
              </span>
            ) : (
              placedTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTileClickToRemove(tile)}
                  className="px-4 py-2.5 rounded-2xl bg-coral text-white font-chinese text-xl font-bold shadow-duo-coral hover:bg-coral-dark active:translate-y-1 active:shadow-duo-pressed transition-all transform hover:scale-105"
                >
                  {tile.text}
                </button>
              ))
            )}
          </div>

          {/* Word Bank */}
          <div className="p-5 bg-cream-200/70 rounded-3xl border border-cream-300 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal/60 uppercase tracking-wider">
              <span>Khay từ vựng ({bankTiles.length} từ còn lại):</span>
              <span className="text-[11px] text-amber-700 font-semibold lowercase">
                (chứa bẫy chữ viết khác nhau 1 chút)
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {bankTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleTileClickToPlace(tile)}
                  className="px-4 py-2.5 rounded-2xl bg-white text-charcoal font-chinese text-xl font-bold shadow-duo border border-amber-100 hover:border-amber-300 hover:bg-amber-50 active:translate-y-1 transition-all transform hover:scale-105"
                >
                  {tile.text}
                </button>
              ))}
              {bankTiles.length === 0 && (
                <span className="text-xs text-charcoal/40 italic">
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
