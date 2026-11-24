"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Filter,
  Volume2,
} from "lucide-react";
import { repository } from "@/services";
import { MistakeEntry } from "@/types";
import { formatDate } from "@/lib/utils";
import { AudioButton } from "@/features/quiz";

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "mastered">("active");

  const loadData = async () => {
    try {
      const data = await repository.getMistakes();
      setMistakes(data);
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

  const filtered = mistakes.filter((m) => {
    if (filter === "active") return !m.isMastered;
    if (filter === "mastered") return m.isMastered;
    return true;
  });

  const activeCount = mistakes.filter((m) => !m.isMastered).length;
  const masteredCount = mistakes.filter((m) => m.isMastered).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-charcoal/60">
        <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tải sổ lỗi sai...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-coral/10 text-coral">
              <ShieldAlert size={24} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal">
              Sổ tay câu hay sai
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-xl">
            Tự động lưu lại mọi câu bạn từng làm sai. Trả lời đúng liên tiếp 3 lần sẽ được đánh dấu <strong>Đã thuộc</strong>!
          </p>
        </div>

        {activeCount > 0 && (
          <Link
            href="/practice/mistake-review-exam"
            className="px-6 py-3.5 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-sm shadow-duo-coral active:translate-y-1 transition-all flex items-center gap-2 shrink-0"
          >
            <RotateCcw size={18} />
            <span>Luyện {activeCount} câu này ngay</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-cream-100 p-1.5 rounded-2xl border border-cream-200 max-w-md">
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filter === "active"
              ? "bg-white text-coral shadow-sm"
              : "text-charcoal/60 hover:text-charcoal"
          }`}
        >
          Cần ôn ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("mastered")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filter === "mastered"
              ? "bg-white text-mint-dark shadow-sm"
              : "text-charcoal/60 hover:text-charcoal"
          }`}
        >
          Đã thuộc ({masteredCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filter === "all"
              ? "bg-white text-charcoal shadow-sm"
              : "text-charcoal/60 hover:text-charcoal"
          }`}
        >
          Tất cả ({mistakes.length})
        </button>
      </div>

      {/* Mistakes list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-300 shadow-sm space-y-3">
          <div className="text-4xl">🎉</div>
          <h3 className="text-lg font-bold text-charcoal">
            {filter === "active"
              ? "Tuyệt vời! Không còn câu sai nào cần ôn."
              : "Chưa có câu nào trong mục này."}
          </h3>
          <p className="text-xs sm:text-sm text-charcoal/60">
            Hãy tiếp tục luyện các đề mới để hệ thống theo dõi tiến độ của bạn.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-coral text-white font-bold text-xs"
            >
              Vào làm đề mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const q = item.question;

            return (
              <div
                key={item.questionId}
                className="bg-white rounded-3xl p-6 border-2 border-cream-300 hover:border-amber-200 shadow-card space-y-4"
              >
                <div className="flex items-start justify-between gap-3 border-b border-cream-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                      Sai {item.timesWrong} lần
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
                      Đúng liên tiếp: {item.consecutiveCorrect}/3
                    </span>
                    {item.isMastered && (
                      <span className="px-2.5 py-0.5 rounded-full bg-mint-light text-mint-dark text-xs font-bold border border-mint">
                        ✓ Đã thuộc
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReset(item.questionId)}
                    title="Xóa khỏi sổ sai"
                    className="p-1.5 rounded-lg text-charcoal/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Question Prompt */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-charcoal/50 uppercase">
                    HSK {q.hskLevel} • {q.tags?.[0]?.replace(/_/g, " ") || "Ngữ pháp"}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-charcoal">
                    {q.prompt}
                  </h3>

                  {q.chineseText && (
                    <div className="p-3 bg-cream-50 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <div className="font-chinese text-xl font-bold text-charcoal">
                          {q.chineseText}
                        </div>
                        {q.pinyin && (
                          <div className="text-xs font-semibold text-coral-dark">
                            {q.pinyin}
                          </div>
                        )}
                      </div>
                      <AudioButton text={q.chineseText} size="sm" />
                    </div>
                  )}
                </div>

                {/* Correct answer & explanation */}
                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70 text-xs sm:text-sm space-y-1">
                  <div className="text-charcoal">
                    <strong className="text-charcoal/60">Đáp án chuẩn: </strong>
                    <span className="font-bold text-coral-deep">
                      {Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.join(" ")
                        : typeof q.correctAnswer === "object"
                        ? Object.values(q.correctAnswer).join(", ")
                        : String(q.correctAnswer)}
                    </span>
                  </div>
                  {q.explanation && (
                    <p className="text-charcoal/80 pt-1 leading-relaxed">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
