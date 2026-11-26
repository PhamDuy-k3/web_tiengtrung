"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Mic,
  Shuffle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { mockVocabulary } from "@/data/mock";
import { AudioButton } from "@/features/quiz";
import { VoicePronunciationChecker } from "@/components/voice/VoicePronunciationChecker";
import { repository } from "@/services";
import { useUserStore } from "@/store/useUserStore";
import type { PronunciationEvaluation } from "@/lib/pronunciation";

type LevelFilter = "all" | "basic" | "intermediate" | "advanced";
type PracticeScope = "word" | "sentence" | "custom";

export default function VoicePracticePage() {
  const { loadProfile } = useUserStore();

  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [scope, setScope] = useState<PracticeScope>("word");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);
  const [customText, setCustomText] = useState("你好，很高兴认识你！");
  const [customPinyin, setCustomPinyin] = useState("Nǐ hǎo, hěn gāoxìng rènshi nǐ!");

  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [awardedIds, setAwardedIds] = useState<Set<string>>(new Set());
  const [sessionXp, setSessionXp] = useState(0);

  const filteredItems = useMemo(() => {
    return mockVocabulary.filter((item) => {
      if (levelFilter === "basic") return item.hskLevel <= 2;
      if (levelFilter === "intermediate") return item.hskLevel === 3 || item.hskLevel === 4;
      if (levelFilter === "advanced") return item.hskLevel >= 5;
      return true;
    });
  }, [levelFilter]);

  const safeIndex = filteredItems.length > 0 ? currentIndex % filteredItems.length : 0;
  const currentItem = filteredItems[safeIndex];

  const promptText =
    scope === "custom"
      ? customText
      : scope === "sentence"
      ? currentItem?.exampleZh || ""
      : currentItem?.hanzi || "";

  const promptPinyin =
    scope === "custom"
      ? customPinyin
      : scope === "sentence"
      ? currentItem?.examplePinyin || ""
      : currentItem?.pinyin || "";

  const promptKey =
    scope === "custom"
      ? `custom:${customText.trim()}`
      : `${scope}:${currentItem?.id ?? "none"}`;

  const handleEvaluated = async (result: PronunciationEvaluation) => {
    setBestScores((prev) => ({
      ...prev,
      [promptKey]: Math.max(prev[promptKey] ?? 0, result.score),
    }));

    if (result.score >= 80 && !awardedIds.has(promptKey)) {
      const nextAwarded = new Set(awardedIds);
      nextAwarded.add(promptKey);
      setAwardedIds(nextAwarded);
      const earned = 10;
      setSessionXp((prev) => prev + earned);
      try {
        const profile = await repository.getProfile();
        await repository.saveProfile({ totalXp: profile.totalXp + earned });
        await loadProfile();
      } catch (e) {
        console.error("Không thể cập nhật XP luyện nói:", e);
      }
    }
  };

  const handleSelectLevel = (next: LevelFilter) => {
    setLevelFilter(next);
    setCurrentIndex(0);
  };

  const handleRandomPrompt = () => {
    if (filteredItems.length <= 1) return;
    let next = Math.floor(Math.random() * filteredItems.length);
    if (next === safeIndex) next = (safeIndex + 1) % filteredItems.length;
    setCurrentIndex(next);
  };

  const scoreCount = Object.keys(bestScores).length;
  const avgScore =
    scoreCount > 0
      ? Math.round(Object.values(bestScores).reduce((sum, val) => sum + val, 0) / scoreCount)
      : 0;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-light hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Header */}
      <header className="rounded-3xl bg-white border border-parchment-300 shadow-soft p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-celadon-100 text-celadon-dark border border-celadon-200 text-xs font-bold">
            <Mic size={14} />
            <span>Chấm điểm phát âm tiếng Trung</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            Luyện phát âm chuẩn với Micro
          </h1>
          <p className="text-xs sm:text-sm text-ink-light max-w-2xl leading-relaxed">
            Mở micro đọc theo từ hoặc câu tiếng Trung. Hệ thống tự động chấm tỷ lệ đúng (%), chỉ rõ từng chữ đọc sai hoặc nhầm thanh điệu và hướng dẫn khẩu hình đọc lại cho chuẩn.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <div className="flex-1 md:flex-initial text-center px-4 py-3 rounded-2xl bg-parchment-50 border border-parchment-300">
            <div className="text-[11px] font-bold text-ink-light uppercase">Đã luyện</div>
            <div className="text-xl font-black text-ink">{scoreCount} mục</div>
          </div>
          <div className="flex-1 md:flex-initial text-center px-4 py-3 rounded-2xl bg-celadon-50 border border-celadon-200">
            <div className="text-[11px] font-bold text-celadon-dark uppercase">TB chính xác</div>
            <div className="text-xl font-black text-celadon-dark">{avgScore}%</div>
          </div>
          <div className="flex-1 md:flex-initial text-center px-4 py-3 rounded-2xl bg-gilt-light border border-gilt-soft">
            <div className="text-[11px] font-bold text-gilt-deep uppercase">+XP phiên</div>
            <div className="text-xl font-black text-gilt-deep">+{sessionXp}</div>
          </div>
        </div>
      </header>

      {/* Filters & Mode Selector */}
      <section className="rounded-3xl bg-white border border-parchment-300 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "Tất cả HSK" },
            { id: "basic", label: "Cơ bản (HSK 1-2)" },
            { id: "intermediate", label: "Trung cấp (HSK 3-4)" },
            { id: "advanced", label: "Nâng cao (HSK 5-6)" },
          ].map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => handleSelectLevel(lvl.id as LevelFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                levelFilter === lvl.id
                  ? "bg-celadon text-white border-celadon shadow-sm"
                  : "bg-parchment-50 text-ink-light border-parchment-300 hover:bg-parchment-100"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "word", label: "Từ vựng" },
            { id: "sentence", label: "Câu giao tiếp" },
            { id: "custom", label: "Tự nhập câu" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScope(item.id as PracticeScope)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                scope === item.id
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink-light border-parchment-300 hover:bg-parchment-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Custom prompt inputs */}
      {scope === "custom" && (
        <section className="rounded-3xl bg-white border border-parchment-300 p-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-light">
            Nhập từ hoặc câu tiếng Trung bạn muốn đọc kiểm tra:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Chữ Hán (ví dụ: 明天见)"
              className="rounded-xl border border-parchment-300 bg-parchment-50 px-4 py-2.5 font-chinese text-lg font-bold text-ink"
            />
            <input
              type="text"
              value={customPinyin}
              onChange={(e) => setCustomPinyin(e.target.value)}
              placeholder="Pinyin tùy chọn (ví dụ: Míngtiān jiàn)"
              className="rounded-xl border border-parchment-300 bg-parchment-50 px-4 py-2.5 text-sm font-semibold text-celadon-dark"
            />
          </div>
        </section>
      )}

      {/* Main Prompt + Voice Recorder */}
      {promptText && (
        <section className="rounded-3xl bg-white border border-parchment-300 shadow-soft p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {scope === "custom" ? (
              <span className="badge badge-purple">Câu tự chọn</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="badge badge-green">HSK {currentItem?.hskLevel}</span>
                <span className="text-xs font-bold text-ink-light">
                  Mục {safeIndex + 1} / {filteredItems.length}
                </span>
                {typeof bestScores[promptKey] === "number" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-celadon-100 text-celadon-dark border border-celadon-200">
                    <CheckCircle2 size={12} />
                    Tốt nhất: {bestScores[promptKey]}%
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPinyin((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-xs font-bold text-ink-light transition-colors"
            >
              {showPinyin ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}</span>
            </button>
          </div>

          {/* Target Prompt Card */}
          <div className="text-center space-y-3 py-3 rounded-2xl bg-gradient-to-br from-parchment-50 to-celadon-50/40 border border-parchment-200 px-4">
            <div className="font-chinese text-4xl sm:text-5xl font-black text-ink leading-snug">
              {promptText}
            </div>
            {showPinyin && promptPinyin && (
              <div className="text-base sm:text-lg font-bold text-celadon-dark">
                {promptPinyin}
              </div>
            )}
            {scope !== "custom" && currentItem && (
              <div className="space-y-1 text-sm">
                <div className="font-bold text-ink">
                  {scope === "sentence" ? currentItem.exampleVn : currentItem.vietnamese}
                </div>
                {scope === "word" && (
                  <div className="text-xs text-ink-light">
                    Âm Hán Việt: <strong className="text-ink">{currentItem.hanViet}</strong> · {currentItem.partOfSpeech}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-center pt-1">
              <AudioButton text={promptText} size="lg" />
            </div>
          </div>

          {/* Voice Checker */}
          <VoicePronunciationChecker
            targetText={promptText}
            targetPinyin={showPinyin ? promptPinyin : undefined}
            onEvaluated={handleEvaluated}
          />

          <div className="flex items-center justify-between text-xs text-ink-light">
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={14} className="text-gilt-deep" />
              Đọc đạt từ <strong>80%</strong> trở lên nhận ngay <strong>+10 XP</strong> cho mỗi từ/câu mới!
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-celadon-dark font-semibold">
              <Sparkles size={13} />
              Nhấn biểu tượng loa 0.75x để nghe chậm từng chữ
            </span>
          </div>

          {/* Navigation */}
          {scope !== "custom" && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-parchment-200">
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length)
                }
                className="px-4 py-2.5 rounded-xl border border-parchment-300 bg-white hover:bg-parchment-50 font-bold text-sm text-ink inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Câu trước</span>
              </button>

              <button
                type="button"
                onClick={handleRandomPrompt}
                className="px-4 py-2.5 rounded-xl bg-gilt-light hover:bg-gilt-soft border border-gilt-soft font-bold text-sm text-gilt-deep inline-flex items-center gap-1.5"
              >
                <Shuffle size={15} />
                <span>Ngẫu nhiên</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentIndex((i) => (i + 1) % filteredItems.length)}
                className="px-5 py-2.5 rounded-xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm inline-flex items-center gap-1.5"
              >
                <span>Từ/câu tiếp theo</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
