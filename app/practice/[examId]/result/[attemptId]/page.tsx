"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Volume2,
  Sparkles,
  Award,
} from "lucide-react";
import { repository } from "@/services";
import { ExamAttempt } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";
import { triggerConfetti } from "@/components/ui/Confetti";
import { soundService } from "@/lib/sound";
import { AudioButton } from "@/features/quiz";

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = (params.examId as string) || "";
  const attemptId = (params.attemptId as string) || "";

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await repository.getAttempt(attemptId);
        setAttempt(data);

        if (data) {
          if (data.score >= 80) {
            triggerConfetti();
            soundService.playFanfare();
          } else if (data.score >= 60) {
            soundService.playSuccess();
          } else {
            soundService.playError();
          }
        }
      } catch (e) {
        console.error("Lỗi tải kết quả:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-charcoal/60">
        <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tải kết quả bài làm...
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Không tìm thấy kết quả làm bài</h2>
        <Link href="/" className="px-6 py-2.5 rounded-2xl bg-coral text-white font-bold inline-block">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const isPassed = attempt.score >= 60;
  const isExcellent = attempt.score >= 80;

  const resultItems = Object.values(attempt.answers);
  const wrongCount = attempt.incorrectCount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Result Hero Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-cream-300 shadow-card text-center space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none ${
            isExcellent ? "bg-emerald-400" : isPassed ? "bg-amber-400" : "bg-coral"
          }`}
        ></div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2">
            {isExcellent ? (
              <span className="px-3.5 py-1 rounded-full bg-mint-light text-mint-dark font-black text-xs uppercase tracking-wider border border-mint">
                🌟 Xuất sắc
              </span>
            ) : isPassed ? (
              <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs uppercase tracking-wider border border-amber-300">
                ✓ Đạt yêu cầu
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full bg-red-100 text-red-700 font-black text-xs uppercase tracking-wider border border-red-300">
                Cần ôn tập thêm
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-charcoal">
            {attempt.examTitle}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/50">
            Nộp bài lúc {formatDate(attempt.createdAt)}
          </p>
        </div>

        {/* Circular / Large Score Display */}
        <div className="flex items-center justify-center gap-2 relative z-10">
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 flex flex-col items-center justify-center shadow-inner ${
              isExcellent
                ? "border-mint bg-mint-light/40 text-mint-dark"
                : isPassed
                ? "border-amber-400 bg-amber-50 text-amber-800"
                : "border-red-400 bg-red-50 text-red-700"
            }`}
          >
            <span className="text-4xl sm:text-5xl font-black leading-none">
              {attempt.score}%
            </span>
            <span className="text-xs font-bold uppercase tracking-wider mt-1 opacity-70">
              {attempt.correctCount}/{attempt.totalQuestions} câu đúng
            </span>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2 relative z-10">
          <div className="p-3 bg-cream-100 rounded-2xl border border-cream-200">
            <div className="text-xs text-charcoal/60">Thời gian</div>
            <div className="font-bold text-sm text-charcoal mt-0.5">
              {formatTime(attempt.durationSeconds)}
            </div>
          </div>
          <div className="p-3 bg-mint-light/60 rounded-2xl border border-mint/30">
            <div className="text-xs text-mint-dark">Số câu đúng</div>
            <div className="font-bold text-sm text-mint-dark mt-0.5">
              {attempt.correctCount} câu
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
            <div className="text-xs text-red-600">Số câu sai</div>
            <div className="font-bold text-sm text-red-600 mt-0.5">
              {attempt.incorrectCount} câu
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 relative z-10">
          <Link
            href={`/practice/${examId}`}
            className="px-6 py-3 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-sm shadow-duo-coral active:translate-y-1 transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} />
            <span>Làm lại cả đề</span>
          </Link>

          {wrongCount > 0 && (
            <Link
              href="/mistakes"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-duo-honey active:translate-y-1 transition-all flex items-center gap-2"
            >
              <span>Vào sổ lỗi sai ôn {wrongCount} câu</span>
              <ArrowRight size={16} />
            </Link>
          )}

          <Link
            href={`/levels/${attempt.levelId}`}
            className="px-6 py-3 rounded-2xl bg-white border-2 border-cream-300 hover:bg-cream-100 text-charcoal font-bold text-sm shadow-duo active:translate-y-1 transition-all"
          >
            Danh sách đề khác
          </Link>
        </div>
      </div>

      {/* QUESTION BY QUESTION DETAILED BREAKDOWN */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-charcoal">
          Chi tiết từng câu hỏi & Lời giải thích
        </h2>
        <p className="text-xs sm:text-sm text-charcoal/60">
          Xem lại đáp án của bạn, đáp án đúng chuẩn và giải thích ngữ pháp chi tiết
        </p>

        <div className="space-y-4">
          {resultItems.map((item, idx) => {
            const q = item.question;
            const isCorrect = item.isCorrect;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-3xl border-2 transition-all bg-white shadow-card ${
                  isCorrect
                    ? "border-mint/50 hover:border-mint"
                    : "border-red-300 hover:border-red-400"
                }`}
              >
                {/* Header question status */}
                <div className="flex items-start justify-between gap-3 border-b border-cream-200 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        isCorrect ? "bg-mint" : "bg-red-500"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-charcoal/50 uppercase">
                      HSK {q.hskLevel} • {q.tags?.[0]?.replace(/_/g, " ") || "Từ vựng"}
                    </span>
                  </div>

                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-mint-dark bg-mint-light px-2.5 py-1 rounded-full border border-mint">
                      <CheckCircle2 size={14} />
                      Chính xác
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                      <XCircle size={14} />
                      Chưa chính xác
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div className="space-y-2">
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

                {/* User Answer vs Correct Answer Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                  {/* User Answer */}
                  <div
                    className={`p-3 rounded-2xl border ${
                      isCorrect
                        ? "bg-mint-light/30 border-mint/40 text-mint-dark"
                        : "bg-red-50/60 border-red-200 text-red-700"
                    }`}
                  >
                    <span className="text-xs font-bold opacity-75 block mb-1">
                      Đáp án của bạn:
                    </span>
                    <div className="font-semibold break-words">
                      {Array.isArray(item.userAnswer)
                        ? item.userAnswer.join(" ")
                        : typeof item.userAnswer === "object" && item.userAnswer !== null
                        ? Object.keys(item.userAnswer)
                            .map((k) => `${k} ➔ ${item.userAnswer[k]}`)
                            .join(", ")
                        : item.userAnswer || (
                            <span className="italic text-charcoal/40 font-normal">
                              (Chưa trả lời)
                            </span>
                          )}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="p-3 rounded-2xl bg-cream-100 border border-cream-300 text-charcoal">
                    <span className="text-xs font-bold opacity-75 block mb-1">
                      Đáp án đúng chuẩn:
                    </span>
                    <div className="font-bold text-coral-deep break-words">
                      {Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.join(" ")
                        : typeof q.correctAnswer === "object" && q.correctAnswer !== null
                        ? Object.values(q.correctAnswer).join(", ")
                        : String(q.correctAnswer)}
                    </div>
                  </div>
                </div>

                {/* Detailed Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70 text-xs sm:text-sm text-charcoal/80 space-y-1">
                    <span className="font-bold text-amber-900 block">
                      💡 Giải thích & Hướng dẫn:
                    </span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
