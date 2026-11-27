"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, RotateCcw, Eye, CheckCircle2 } from "lucide-react";
import { repository } from "@/services";
import { ExamAttempt, LevelId } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

type FilterLevel = "all" | LevelId;

const LEVEL_LABELS: Record<LevelId, string> = {
  basic: "Cơ bản · HSK 1–2",
  intermediate: "Trung cấp · HSK 3–4",
  advanced: "Nâng cao · HSK 5–6",
};

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await repository.getAttempts();
        setAttempts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredAttempts = useMemo(() => {
    if (filterLevel === "all") return attempts;
    return attempts.filter((att) => att.levelId === filterLevel);
  }, [attempts, filterLevel]);

  const summary = useMemo(() => {
    if (attempts.length === 0) return { avg: 0, best: 0 };
    const total = attempts.reduce((acc, item) => acc + item.score, 0);
    const best = Math.max(...attempts.map((item) => item.score));
    return { avg: Math.round(total / attempts.length), best };
  }, [attempts]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ink-light">
        <div className="animate-spin w-8 h-8 border-4 border-celadon border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tải danh sách bài đã làm...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-parchment-300 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink flex items-center gap-2.5">
            <Clock className="text-celadon" size={28} />
            <span>Xem lại bài đã làm</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-light mt-1">
            Mở lại từng lượt làm bài để xem đáp án bạn đã chọn, lý do sai và lời giải thích chi tiết.
          </p>
        </div>
        <span className="text-xs font-bold text-ink-light bg-parchment-200 border border-parchment-300 px-3.5 py-1.5 rounded-full">
          {attempts.length} lượt làm
        </span>
      </div>

      {attempts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-parchment-300 shadow-soft">
            <div className="text-xs text-ink-muted font-semibold">Tổng lượt làm</div>
            <div className="text-2xl font-black text-ink mt-0.5">{attempts.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-parchment-300 shadow-soft">
            <div className="text-xs text-ink-muted font-semibold">Điểm trung bình</div>
            <div className="text-2xl font-black text-celadon-dark mt-0.5">{summary.avg}%</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-parchment-300 shadow-soft">
            <div className="text-xs text-ink-muted font-semibold">Điểm cao nhất</div>
            <div className="text-2xl font-black text-gilt-deep mt-0.5">{summary.best}%</div>
          </div>
        </div>
      )}

      {attempts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "basic", label: "Cơ bản" },
              { id: "intermediate", label: "Trung cấp" },
              { id: "advanced", label: "Nâng cao" },
            ] as const
          ).map((tab) => {
            const active = filterLevel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterLevel(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  active
                    ? "bg-celadon text-white border-celadon shadow-soft"
                    : "bg-white text-ink-light border-parchment-300 hover:border-celadon-200 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {filteredAttempts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-parchment-300 shadow-soft space-y-3">
          <div className="text-4xl">📝</div>
          <h3 className="text-lg font-bold text-ink">
            {attempts.length === 0
              ? "Bạn chưa làm đề thi nào"
              : "Chưa có lượt làm nào ở cấp độ này"}
          </h3>
          <p className="text-xs sm:text-sm text-ink-light">
            Hãy bắt đầu một đề luyện tập để hệ thống lưu lại kết quả và giải thích chi tiết!
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-celadon text-white font-bold text-xs shadow-soft"
            >
              Chọn đề luyện ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAttempts.map((att) => {
            const isExcellent = att.score >= 80;
            const isPassed = att.score >= 60;

            return (
              <div
                key={att.id}
                className="bg-white rounded-3xl p-5 border border-parchment-300 hover:border-celadon-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        isExcellent
                          ? "bg-celadon-50 text-celadon-dark border-celadon-200"
                          : isPassed
                          ? "bg-gilt-light text-gilt-deep border-gilt-soft"
                          : "bg-vermillion-light text-vermillion-deep border-vermillion-soft"
                      }`}
                    >
                      {att.score}%
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-parchment-100 border border-parchment-300 text-[10px] font-bold text-ink-light">
                          {LEVEL_LABELS[att.levelId] ?? att.levelId}
                        </span>
                        {att.examId.startsWith("level-test-") && (
                          <span className="px-2 py-0.5 rounded-full bg-gilt-light border border-gilt-soft text-[10px] font-bold text-gilt-deep">
                            Thi lên cấp
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-ink line-clamp-1 mt-1">
                        {att.examTitle}
                      </h3>
                      <div className="text-xs text-ink-muted flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{formatDate(att.createdAt)}</span>
                        <span>•</span>
                        <span>Thời gian: {formatTime(att.durationSeconds)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-celadon-dark font-semibold">
                          <CheckCircle2 size={12} />
                          Đúng {att.correctCount}/{att.totalQuestions} câu
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 shrink-0">
                  <Link
                    href={`/practice/${att.examId}/result/${att.id}`}
                    className="px-4 py-2.5 rounded-xl bg-celadon hover:bg-celadon-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-soft"
                  >
                    <Eye size={14} />
                    <span>Xem lại chi tiết</span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href={`/practice/${att.examId}`}
                    title="Làm lại đề này"
                    aria-label="Làm lại đề này"
                    className="p-2.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-ink-light hover:text-ink transition-colors border border-parchment-300"
                  >
                    <RotateCcw size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
