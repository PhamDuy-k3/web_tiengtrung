"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Filter,
  BookOpen,
  XCircle,
  HelpCircle,
  Sparkles,
  Bookmark,
  Star,
} from "lucide-react";
import { repository } from "@/services";
import { MistakeEntry, LevelId, Question } from "@/types";
import { AudioButton, AnswerDiffViewer } from "@/features/quiz";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface BookmarkedItem {
  question: Question;
  examTitle?: string;
  examId?: string;
}

export default function MistakesPage() {
  const [mainTab, setMainTab] = useState<"mistakes" | "bookmarks">("mistakes");
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<BookmarkedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "mastered">("active");
  const [levelFilter, setLevelFilter] = useState<"all" | LevelId>("all");
  const [selectedExamId, setSelectedExamId] = useState<string>("all");

  const loadData = async () => {
    try {
      const [mistakesData, examsData] = await Promise.all([
        repository.getMistakes(),
        repository.getAllExams(),
      ]);
      setMistakes(mistakesData);

      // Load bookmarks
      let savedBookmarks: string[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("hanyu:bookmarks");
          if (raw) savedBookmarks = JSON.parse(raw);
        } catch (e) {
          console.error(e);
        }
      }

      if (Array.isArray(savedBookmarks) && savedBookmarks.length > 0) {
        const bmSet = new Set(savedBookmarks);
        const bms: BookmarkedItem[] = [];
        for (const exam of examsData) {
          for (const q of exam.questions) {
            if (bmSet.has(q.id)) {
              bms.push({
                question: q,
                examTitle: exam.title,
                examId: exam.id,
              });
            }
          }
        }
        setBookmarkedItems(bms);
      } else {
        setBookmarkedItems([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async (questionId: string) => {
    await repository.resetMistake(questionId);
    await loadData();
  };

  const handleRemoveBookmark = (questionId: string) => {
    try {
      const raw = localStorage.getItem("hanyu:bookmarks");
      let list: string[] = raw ? JSON.parse(raw) : [];
      list = list.filter((id) => id !== questionId);
      localStorage.setItem("hanyu:bookmarks", JSON.stringify(list));
      setBookmarkedItems((prev) => prev.filter((item) => item.question.id !== questionId));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to extract level from mistake entry
  const getEntryLevel = (m: MistakeEntry): LevelId => {
    if (m.levelId) return m.levelId;
    if (m.question.hskLevel <= 2) return "basic";
    if (m.question.hskLevel <= 4) return "intermediate";
    return "advanced";
  };

  // Unique exams present in mistakes
  const uniqueExams = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mistakes) {
      if (m.examId && m.examTitle) {
        map.set(m.examId, m.examTitle);
      }
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [mistakes]);

  // Statistics
  const activeCount = mistakes.filter((m) => !m.isMastered).length;
  const masteredCount = mistakes.filter((m) => m.isMastered).length;

  const basicCount = mistakes.filter((m) => getEntryLevel(m) === "basic" && !m.isMastered).length;
  const intermediateCount = mistakes.filter((m) => getEntryLevel(m) === "intermediate" && !m.isMastered).length;
  const advancedCount = mistakes.filter((m) => getEntryLevel(m) === "advanced" && !m.isMastered).length;

  // Filtered mistakes list
  const filtered = useMemo(() => {
    return mistakes.filter((m) => {
      // 1. Status filter
      if (statusFilter === "active" && m.isMastered) return false;
      if (statusFilter === "mastered" && !m.isMastered) return false;

      // 2. Level filter
      const mLevel = getEntryLevel(m);
      if (levelFilter !== "all" && mLevel !== levelFilter) return false;

      // 3. Exam filter
      if (selectedExamId !== "all" && m.examId !== selectedExamId) return false;

      return true;
    });
  }, [mistakes, statusFilter, levelFilter, selectedExamId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-ink-muted">
        <div className="animate-spin w-10 h-10 border-4 border-celadon border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tải sổ lỗi sai...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* ================= Mode Selector: Sổ lỗi sai vs Câu đã ghim ================= */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-parchment-300 shadow-soft w-fit">
        <button
          type="button"
          onClick={() => setMainTab("mistakes")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
            mainTab === "mistakes"
              ? "bg-vermillion text-white shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-parchment-100"
          }`}
        >
          <ShieldAlert size={18} />
          <span>Sổ câu sai ({mistakes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab("bookmarks")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
            mainTab === "bookmarks"
              ? "bg-gilt text-white shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-parchment-100"
          }`}
        >
          <Bookmark size={18} className="fill-current" />
          <span>Câu đã ghim ({bookmarkedItems.length})</span>
        </button>
      </div>

      {mainTab === "mistakes" ? (
        <div className="space-y-8">
          {/* ================= Header Banner ================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-vermillion-light text-vermillion-deep border border-vermillion-soft">
              <ShieldAlert size={28} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink">
                Sổ tay câu hay sai
              </h1>
              <p className="text-xs text-ink-muted">
                Tự động lưu mọi câu làm sai theo đề &amp; cấp độ. Đúng 3 lần liên tiếp sẽ đánh dấu đã thuộc!
              </p>
            </div>
          </div>

          {/* Level counter chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-celadon-50 text-celadon-dark border border-celadon-200">
              🌱 Cơ bản: <strong>{basicCount} câu</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gilt-light text-gilt-deep border border-gilt-soft">
              🌿 Trung cấp: <strong>{intermediateCount} câu</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-vermillion-light text-vermillion-deep border border-vermillion-soft">
              🔥 Nâng cao: <strong>{advancedCount} câu</strong>
            </span>
          </div>
        </div>

        {activeCount > 0 && (
          <Link
            href={
              levelFilter === "basic"
                ? "/practice/mistake-review-exam-basic"
                : levelFilter === "intermediate"
                ? "/practice/mistake-review-exam-intermediate"
                : levelFilter === "advanced"
                ? "/practice/mistake-review-exam-advanced"
                : "/practice/mistake-review-exam"
            }
            className="px-6 py-3.5 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-sm shadow-soft hover:shadow-md active:translate-y-0.5 transition-all flex items-center gap-2 shrink-0"
          >
            <RotateCcw size={18} />
            <span>
              {levelFilter === "basic"
                ? `Luyện ${basicCount} câu Cơ bản`
                : levelFilter === "intermediate"
                ? `Luyện ${intermediateCount} câu Trung cấp`
                : levelFilter === "advanced"
                ? `Luyện ${advancedCount} câu Nâng cao`
                : `Luyện ${activeCount} câu này ngay`}
            </span>
          </Link>
        )}
      </div>

      {/* ================= Filter Controls Section ================= */}
      <div className="bg-white rounded-3xl p-5 border border-parchment-300 shadow-soft space-y-4">
        {/* Row 1: Level Tabs */}
        <div>
          <label className="block text-xs font-bold text-ink-muted mb-2 uppercase tracking-wider">
            Phân loại theo cấp độ:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLevelFilter("all")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                levelFilter === "all"
                  ? "bg-ink text-white border-ink shadow-sm"
                  : "bg-parchment-50 text-ink-light border-parchment-300 hover:bg-parchment-100"
              }`}
            >
              Tất cả cấp độ ({mistakes.length})
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter("basic")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                levelFilter === "basic"
                  ? "bg-celadon text-white border-celadon shadow-sm"
                  : "bg-celadon-50 text-celadon-dark border-celadon-200 hover:bg-celadon-100"
              }`}
            >
              🌱 Cơ bản (HSK 1-2)
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter("intermediate")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                levelFilter === "intermediate"
                  ? "bg-gilt text-white border-gilt shadow-sm"
                  : "bg-gilt-light text-gilt-deep border-gilt-soft hover:bg-gilt-soft"
              }`}
            >
              🌿 Trung cấp (HSK 3-4)
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter("advanced")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                levelFilter === "advanced"
                  ? "bg-vermillion text-white border-vermillion shadow-sm"
                  : "bg-vermillion-light text-vermillion-deep border-vermillion-soft hover:bg-vermillion-soft"
              }`}
            >
              🔥 Nâng cao (HSK 5-6)
            </button>
          </div>
        </div>

        {/* Row 2: Status & Exam Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-parchment-200">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-parchment-100 p-1 rounded-2xl border border-parchment-200">
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "active"
                  ? "bg-white text-vermillion-deep shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Cần ôn ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("mastered")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "mastered"
                  ? "bg-white text-celadon-dark shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Đã thuộc ({masteredCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Exam Filter Dropdown */}
          {uniqueExams.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-ink-muted font-bold shrink-0 flex items-center gap-1">
                <BookOpen size={14} />
                Đề thi:
              </span>
              <CustomSelect
                ariaLabel="Lọc theo đề thi"
                size="sm"
                value={selectedExamId}
                onChange={(val) => setSelectedExamId(val)}
                className="min-w-[210px] max-w-xs"
                options={[
                  { value: "all", label: `Tất cả các đề thi (${uniqueExams.length})` },
                  ...uniqueExams.map((ex) => ({ value: ex.id, label: ex.title })),
                ]}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= Mistakes Cards List ================= */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-parchment-300 shadow-soft space-y-3">
          <div className="text-5xl">🎉</div>
          <h3 className="text-lg font-bold text-ink">
            {statusFilter === "active"
              ? "Tuyệt vời! Không có câu sai nào trong mục đã chọn."
              : "Chưa có câu nào trong danh sách."}
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
            Hệ thống sẽ tự động lưu lại các câu bạn chọn sai khi làm bài tập hoặc bài kiểm tra.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-2xl bg-celadon text-white font-bold text-xs shadow-soft hover:shadow-md transition-all"
            >
              Vào làm đề mới ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const q = item.question;
            const entryLevel = getEntryLevel(item);

            const levelBadge =
              entryLevel === "basic" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-celadon-100 text-celadon-dark text-[11px] font-bold border border-celadon-200">
                  🌱 Cơ bản (HSK {q.hskLevel})
                </span>
              ) : entryLevel === "intermediate" ? (
                <span className="px-2.5 py-0.5 rounded-full bg-gilt-light text-gilt-deep text-[11px] font-bold border border-gilt-soft">
                  🌿 Trung cấp (HSK {q.hskLevel})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-vermillion-light text-vermillion-deep text-[11px] font-bold border border-vermillion-soft">
                  🔥 Nâng cao (HSK {q.hskLevel})
                </span>
              );

            return (
              <div
                key={item.questionId}
                className="bg-white rounded-3xl p-6 border border-parchment-300 hover:border-celadon/50 shadow-soft transition-all space-y-4"
              >
                {/* Card Top: Exam title + Level badge + Wrong count + Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment-200 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Level */}
                    {levelBadge}

                    {/* Exam origin badge */}
                    {item.examTitle && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-parchment-100 text-ink-light text-[11px] font-semibold border border-parchment-200">
                        <BookOpen size={11} className="text-celadon-dark" />
                        {item.examTitle}
                      </span>
                    )}

                    {/* Wrong count */}
                    <span className="px-2.5 py-0.5 rounded-full bg-vermillion-light text-vermillion-deep text-[11px] font-bold">
                      Sai {item.timesWrong} lần
                    </span>

                    {/* Consecutive correct */}
                    <span className="px-2.5 py-0.5 rounded-full bg-parchment-200 text-ink text-[11px] font-semibold">
                      Đúng liên tiếp: {item.consecutiveCorrect}/3
                    </span>

                    {item.isMastered && (
                      <span className="px-2.5 py-0.5 rounded-full bg-celadon-100 text-celadon-dark text-[11px] font-bold border border-celadon-300">
                        ✓ Đã thuộc
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReset(item.questionId)}
                    title="Xóa câu này khỏi sổ sai"
                    className="p-1.5 rounded-xl text-ink-muted hover:text-vermillion hover:bg-vermillion-light transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Question Prompt */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-ink-muted uppercase">
                    HSK {q.hskLevel} • {q.tags?.[0]?.replace(/_/g, " ") || "Ngữ pháp"}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-ink leading-relaxed">
                    {q.prompt}
                  </h3>

                  {/* Chinese Hanzi & Pinyin */}
                  {q.chineseText && (
                    <div className="p-4 bg-parchment-50 rounded-2xl border border-parchment-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-chinese text-2xl font-bold text-ink">
                          {q.chineseText}
                        </div>
                        {q.pinyin && (
                          <div className="text-xs font-semibold text-celadon-dark mt-0.5">
                            {q.pinyin}
                          </div>
                        )}
                      </div>
                      <AudioButton text={q.chineseText} size="sm" />
                    </div>
                  )}
                </div>

                {/* Answers comparison: User answer vs Correct answer */}
                <AnswerDiffViewer
                  question={q}
                  userAnswer={item.lastUserAnswer}
                  isCorrect={false}
                />

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 bg-parchment-100 rounded-2xl border border-parchment-200 text-xs text-ink-light space-y-1">
                    <p className="leading-relaxed">
                      💡 <strong>Giải thích chi tiết:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </div>
      ) : (
        /* ================= Bookmarks View ================= */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gilt-light text-gilt-deep border border-gilt-soft">
                  <Bookmark size={28} className="fill-current" />
                </span>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-ink">
                    Câu hỏi đã ghim
                  </h1>
                  <p className="text-xs text-ink-muted">
                    Các câu hỏi bạn đã đánh dấu để tiện xem lại và nghiên cứu sâu hơn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {bookmarkedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-parchment-300 shadow-soft space-y-3">
              <div className="text-5xl">🔖</div>
              <h3 className="text-lg font-bold text-ink">
                Bạn chưa ghim câu hỏi nào
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
                Khi làm bài tập hoặc thi thử, bấm vào nút &quot;Ghim câu hỏi&quot; ở góc trên bài tập để lưu lại đây nhé!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarkedItems.map((item) => {
                const q = item.question;
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-6 border border-parchment-300 hover:border-gilt/50 shadow-soft transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-parchment-200 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-gilt-light text-gilt-deep text-[11px] font-bold border border-gilt-soft">
                          HSK {q.hskLevel}
                        </span>
                        {item.examTitle && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-parchment-100 text-ink-light text-[11px] font-semibold border border-parchment-200">
                            <BookOpen size={11} className="text-celadon-dark" />
                            {item.examTitle}
                          </span>
                        )}
                        <span className="text-xs text-ink-muted font-medium">
                          Loại: {q.type}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveBookmark(q.id)}
                        title="Bỏ ghim câu hỏi này"
                        className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-gilt-deep bg-gilt-light hover:bg-gilt hover:text-white transition-all"
                      >
                        <Star size={14} className="fill-current" />
                        <span>Bỏ ghim</span>
                      </button>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-base sm:text-lg text-ink leading-relaxed">
                        {q.prompt}
                      </h3>

                      {q.chineseText && (
                        <div className="p-4 bg-parchment-50 rounded-2xl border border-parchment-200 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-chinese text-2xl font-bold text-ink">
                              {q.chineseText}
                            </div>
                            {q.pinyin && (
                              <div className="text-xs font-semibold text-celadon-dark mt-0.5">
                                {q.pinyin}
                              </div>
                            )}
                          </div>
                          <AudioButton text={q.chineseText} size="sm" />
                        </div>
                      )}
                    </div>

                    {/* Correct answer display */}
                    <AnswerDiffViewer
                      question={q}
                      userAnswer={null}
                      isCorrect={false}
                    />

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 bg-parchment-100 rounded-2xl border border-parchment-200 text-xs text-ink-light space-y-1">
                        <p className="leading-relaxed">
                          💡 <strong>Giải thích chi tiết:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
