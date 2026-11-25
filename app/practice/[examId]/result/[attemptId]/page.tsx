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
  Target,
  AlertTriangle,
} from "lucide-react";
import { repository } from "@/services";
import { AnswerValue, ExamAttempt } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";
import { triggerConfetti } from "@/components/ui/Confetti";
import { AudioButton, AnswerDiffViewer } from "@/features/quiz";
import { MascotWithBubble } from "@/components/mascot/MascotWithBubble";

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

        if (data && data.score >= 80) {
          triggerConfetti();
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
  const tagSummary = new Map<string, { total: number; incorrect: number }>();
  for (const item of resultItems) {
    const tags = item.question.tags.length > 0 ? item.question.tags : ["Chưa phân loại"];
    for (const tag of tags) {
      const current = tagSummary.get(tag) ?? { total: 0, incorrect: 0 };
      current.total += 1;
      if (!item.isCorrect) current.incorrect += 1;
      tagSummary.set(tag, current);
    }
  }
  const weakTags = Array.from(tagSummary, ([tag, counts]) => ({
    tag,
    ...counts,
    accuracy: Math.round(((counts.total - counts.incorrect) / counts.total) * 100),
  })).filter((item) => item.incorrect > 0).sort((left, right) => right.incorrect - left.incorrect).slice(0, 5);
  const savedTimes = resultItems
    .map((item) => attempt.questionDurations?.[item.question.id])
    .filter((seconds): seconds is number => typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0);
  const averageQuestionSeconds = savedTimes.length > 0
    ? Math.round(savedTimes.reduce((sum, seconds) => sum + seconds, 0) / savedTimes.length)
    : attempt.totalQuestions > 0 ? Math.round(attempt.durationSeconds / attempt.totalQuestions) : 0;
  const slowThreshold = Math.max(averageQuestionSeconds * 1.75, averageQuestionSeconds + 10);
  const slowQuestionIds = new Set(savedTimes.length > 0
    ? resultItems.filter((item) => (attempt.questionDurations?.[item.question.id] ?? 0) > slowThreshold).map((item) => item.question.id)
    : []);

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

        {/* Mascot (left) + Circular Score Display (dead-center) */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-4 sm:gap-6 relative z-10">
          <div className="sm:justify-self-end order-2 sm:order-1">
            <MascotWithBubble
              action={isPassed ? "celebrate" : "sad"}
              tone={isPassed ? "celadon" : "vermillion"}
              size="md"
              message={
                isExcellent
                  ? "Xuất sắc quá! Han Han ăn mừng cùng bạn nè!"
                  : isPassed
                  ? "Làm tốt lắm! Tiếp tục giữ phong độ này nhé!"
                  : "Đừng buồn nhé! Cùng xem lại các câu sai để tiến bộ hơn!"
              }
            />
          </div>

          <div
            className={`order-1 sm:order-2 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 flex flex-col items-center justify-center shadow-inner shrink-0 ${
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

          <div className="hidden sm:block sm:order-3" aria-hidden="true" />
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto pt-2 relative z-10">
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
          <div className="p-3 bg-parchment-100 rounded-2xl border border-parchment-200">
            <div className="text-xs text-ink-muted">TB mỗi câu</div>
            <div className="font-bold text-sm text-ink mt-0.5">{formatTime(averageQuestionSeconds)}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="text-xs text-amber-800">Câu chậm bất thường</div>
            <div className="font-bold text-sm text-amber-900 mt-0.5">{slowQuestionIds.size} câu</div>
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
              href={`/practice/weak-area-${attempt.id}?mode=practice`}
              className="px-6 py-3 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-sm shadow-soft hover:shadow-md active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Target size={16} />
              <span>Luyện lại phần yếu · 10 câu</span>
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

      {weakTags.length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-2">
            <Target size={21} className="text-amber-700" />
            <h2 className="text-xl font-black text-ink">Điểm yếu theo dạng kiến thức</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakTags.map((item) => (
              <div key={item.tag} className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="font-black text-ink">{item.tag.replace(/_/g, " ")}</div>
                <p className="mt-1 text-xs text-ink-muted">Sai {item.incorrect}/{item.total} câu · Chính xác {item.accuracy}%</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {savedTimes.length === 0 && (
        <p className="-mt-5 text-center text-xs text-ink-muted">Bài làm cũ chưa lưu thời gian từng câu; thời gian trung bình đang ước tính từ tổng thời lượng.</p>
      )}

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

                  <div className="flex flex-col items-end gap-1">
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
                    {typeof attempt.questionDurations?.[q.id] === "number" && (
                      <span className={`text-[11px] font-semibold ${slowQuestionIds.has(q.id) ? "text-amber-800" : "text-ink-muted"}`}>
                        {slowQuestionIds.has(q.id) && <AlertTriangle size={12} className="inline mr-1" />}
                        {formatTime(attempt.questionDurations[q.id])}{slowQuestionIds.has(q.id) ? " · câu làm chậm" : ""}
                      </span>
                    )}
                  </div>
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
                {!isCorrect && q.wrongExplanations && (
                  <WrongAnswerExplanation explanations={q.wrongExplanations} answer={item.userAnswer} />
                )}
                {q.grammarPointId && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-celadon-200 bg-celadon-50 p-3 text-xs">
                    <span className="text-celadon-dark"><strong>Gợi ý ôn ngữ pháp:</strong> {q.grammarPointId}</span>
                    <Link href={`/levels/${attempt.levelId}`} className="font-bold text-celadon-dark underline">Mở chủ đề học liên quan</Link>
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

function WrongAnswerExplanation({
  explanations,
  answer,
}: {
  explanations: Record<string, string>;
  answer: AnswerValue | null | undefined;
}) {
  const keys = answer === null || answer === undefined
    ? []
    : typeof answer === "string"
      ? [answer]
      : Array.isArray(answer)
        ? [answer.join(" "), JSON.stringify(answer)]
        : [Object.values(answer).join(" "), JSON.stringify(answer)];
  const explanation = keys.map((key) => explanations[key]).find((value) => Boolean(value));
  if (!explanation) return null;
  return (
    <div className="mt-3 rounded-2xl border border-vermillion-soft bg-vermillion-light/70 p-3.5 text-xs sm:text-sm text-vermillion-deep">
      <strong className="block mb-1">Vì sao đáp án của bạn sai</strong>
      <p className="leading-relaxed">{explanation}</p>
    </div>
  );
}
