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
  Sparkles,
  Award,
} from "lucide-react";
import { repository } from "@/services";
import { ExamAttempt } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";
import { triggerConfetti } from "@/components/ui/Confetti";
import { soundService } from "@/lib/sound";
import { AudioButton, AnswerDiffViewer } from "@/features/quiz";

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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ink-muted">
        <div className="animate-spin w-10 h-10 border-4 border-celadon border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tải kết quả bài làm...
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-ink">Không tìm thấy kết quả làm bài</h2>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-2xl bg-celadon text-white font-bold inline-block shadow-soft hover:shadow-md"
        >
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
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-parchment-300 shadow-card text-center space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isExcellent
              ? "bg-celadon"
              : isPassed
              ? "bg-gilt"
              : "bg-vermillion"
          }`}
        ></div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2">
            {isExcellent ? (
              <span className="px-3.5 py-1 rounded-full bg-celadon-100 text-celadon-dark font-black text-xs uppercase tracking-wider border border-celadon-200">
                🌟 Xuất sắc
              </span>
            ) : isPassed ? (
              <span className="px-3.5 py-1 rounded-full bg-gilt-light text-gilt-deep font-black text-xs uppercase tracking-wider border border-gilt-soft">
                ✓ Đạt yêu cầu
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full bg-vermillion-light text-vermillion-deep font-black text-xs uppercase tracking-wider border border-vermillion-soft">
                Cần ôn tập thêm
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            {attempt.examTitle}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Nộp bài lúc {formatDate(attempt.createdAt)}
          </p>
        </div>

        {/* Circular / Large Score Display */}
        <div className="flex items-center justify-center gap-2 relative z-10">
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 flex flex-col items-center justify-center shadow-inner ${
              isExcellent
                ? "border-celadon-300 bg-celadon-50 text-celadon-dark"
                : isPassed
                ? "border-gilt-soft bg-gilt-light text-gilt-deep"
                : "border-vermillion-soft bg-vermillion-light text-vermillion-deep"
            }`}
          >
            <span className="text-4xl sm:text-5xl font-black leading-none">
              {attempt.score}%
            </span>
            <span className="text-xs font-bold uppercase tracking-wider mt-1 opacity-80">
              {attempt.correctCount}/{attempt.totalQuestions} câu đúng
            </span>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2 relative z-10">
          <div className="p-3 bg-parchment-100 rounded-2xl border border-parchment-200">
            <div className="text-xs text-ink-muted">Thời gian</div>
            <div className="font-bold text-sm text-ink mt-0.5">
              {formatTime(attempt.durationSeconds)}
            </div>
          </div>
          <div className="p-3 bg-celadon-50 rounded-2xl border border-celadon-200">
            <div className="text-xs text-celadon-dark">Số câu đúng</div>
            <div className="font-bold text-sm text-celadon-dark mt-0.5">
              {attempt.correctCount} câu
            </div>
          </div>
          <div className="p-3 bg-vermillion-light/50 rounded-2xl border border-vermillion-soft">
            <div className="text-xs text-vermillion-deep">Số câu sai</div>
            <div className="font-bold text-sm text-vermillion-deep mt-0.5">
              {attempt.incorrectCount} câu
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 relative z-10">
          <Link
            href={`/practice/${examId}`}
            className="px-6 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm shadow-soft hover:shadow-md active:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} />
            <span>Làm lại cả đề</span>
          </Link>

          {wrongCount > 0 && (
            <Link
              href="/mistakes"
              className="px-6 py-3 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-sm shadow-soft hover:shadow-md active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span>Vào sổ lỗi sai ôn {wrongCount} câu</span>
              <ArrowRight size={16} />
            </Link>
          )}

          <Link
            href={`/levels/${attempt.levelId}`}
            className="px-6 py-3 rounded-2xl bg-white border border-parchment-300 hover:bg-parchment-100 text-ink font-bold text-sm shadow-soft transition-all"
          >
            Danh sách đề khác
          </Link>
        </div>
      </div>

      {/* QUESTION BY QUESTION DETAILED BREAKDOWN */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-ink">
          Chi tiết từng câu hỏi &amp; Lời giải thích
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted">
          Xem lại đáp án của bạn (chữ đen, bôi đỏ chỗ sai), đáp án đúng chuẩn (màu xanh) và giải thích ngữ pháp chi tiết
        </p>

        <div className="space-y-4">
          {resultItems.map((item, idx) => {
            const q = item.question;
            const isCorrect = item.isCorrect;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-3xl border-2 transition-all bg-white shadow-soft ${
                  isCorrect
                    ? "border-celadon-300 hover:border-celadon"
                    : "border-vermillion-soft hover:border-vermillion"
                }`}
              >
                {/* Header question status */}
                <div className="flex items-start justify-between gap-3 border-b border-parchment-200 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        isCorrect ? "bg-celadon" : "bg-vermillion"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-ink-muted uppercase">
                      HSK {q.hskLevel} • {q.tags?.[0]?.replace(/_/g, " ") || "Từ vựng"}
                    </span>
                  </div>

                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-celadon-dark bg-celadon-100 px-3 py-1 rounded-full border border-celadon-200">
                      <CheckCircle2 size={14} />
                      Chính xác
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-vermillion-deep bg-vermillion-light px-3 py-1 rounded-full border border-vermillion-soft">
                      <XCircle size={14} />
                      {item.score > 0 ? `Đúng một phần · ${item.score}%` : "Chưa chính xác"}
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <h3 className="font-bold text-base sm:text-lg text-ink leading-relaxed">
                    {q.prompt}
                  </h3>

                  {q.chineseText && (
                    <div className="p-4 bg-parchment-50 rounded-2xl border border-parchment-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-chinese text-2xl font-bold text-ink">
                          {q.chineseText}
                        </div>
                        {/* Pinyin: When question is correct, pinyin is dark celadon or neutral ink; NEVER RED! */}
                        {q.pinyin && (
                          <div
                            className={`text-xs font-semibold mt-1 ${
                              isCorrect ? "text-celadon-dark" : "text-ink-secondary"
                            }`}
                          >
                            {q.pinyin}
                          </div>
                        )}
                      </div>
                      <AudioButton text={q.chineseText} size="sm" />
                    </div>
                  )}
                </div>

                {/* User Answer vs Correct Answer Box (Using AnswerDiffViewer) */}
                <AnswerDiffViewer
                  question={q}
                  userAnswer={item.userAnswer}
                  isCorrect={isCorrect}
                />

                {/* Detailed Explanation */}
                {q.explanation && (
                  <div className="mt-3 p-3.5 bg-parchment-100 rounded-2xl border border-parchment-200 text-xs sm:text-sm text-ink-light space-y-1">
                    <span className="font-bold text-ink block">
                      💡 Giải thích &amp; Hướng dẫn:
                    </span>
                    <p className="leading-relaxed opacity-90">{q.explanation}</p>
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
