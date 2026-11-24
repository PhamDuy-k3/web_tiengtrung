"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Grid,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { repository } from "@/services";
import { Exam, QuestionResult } from "@/types";
import { QuizRenderer, QuestionPalette, QuizTimer } from "@/features/quiz";
import { gradeQuestion } from "@/lib/grading";
import { soundService } from "@/lib/sound";
import { useQuizDraftStore } from "@/store/useQuizDraftStore";

export default function ExamPracticePage() {
  const params = useParams();
  const router = useRouter();
  const examId = (params.examId as string) || "";

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Draft store
  const {
    savedAnswers,
    elapsedSeconds,
    initExam,
    setDraftAnswer,
    setIndex,
    setElapsed,
    clearDraft,
  } = useQuizDraftStore();

  useEffect(() => {
    initExam(examId);
    async function load() {
      try {
        const data = await repository.getExam(examId);
        setExam(data);
      } catch (e) {
        console.error("Lỗi tải đề thi:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId, initExam]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-charcoal/60">
        <div className="animate-spin w-10 h-10 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang chuẩn bị đề luyện tập...
      </div>
    );
  }

  if (!exam || exam.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-charcoal">Không tìm thấy đề thi</h2>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-2xl bg-coral text-white font-bold"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;
  const currentAnswer = savedAnswers[currentQuestion.id];

  const answeredCount = Object.keys(savedAnswers).filter(
    (k) =>
      savedAnswers[k] !== undefined &&
      savedAnswers[k] !== "" &&
      savedAnswers[k] !== null &&
      (!Array.isArray(savedAnswers[k]) || savedAnswers[k].length > 0) &&
      (typeof savedAnswers[k] !== "object" || Object.keys(savedAnswers[k]).length > 0)
  ).length;

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleAnswerChange = (val: any) => {
    setDraftAnswer(examId, currentQuestion.id, val);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIndex(nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIndex(prevIdx);
    }
  };

  const handleSubmitAttempt = async () => {
    setIsSubmitting(true);
    try {
      // Grade each question
      const answersResult: Record<string, QuestionResult> = {};
      for (const q of exam.questions) {
        const uAns = savedAnswers[q.id];
        const isCorrect = gradeQuestion(q, uAns);
        answersResult[q.id] = {
          userAnswer: uAns,
          isCorrect,
          question: q,
        };
      }

      const attempt = await repository.submitAttempt({
        examId: exam.id,
        levelId: exam.levelId,
        topicId: exam.topicId,
        examTitle: exam.title,
        answers: answersResult,
        durationSeconds: elapsedSeconds,
      });

      // Clear draft on successful submit
      clearDraft(exam.id);

      // Navigate to result page
      router.push(`/practice/${exam.id}/result/${attempt.id}`);
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = () => {
    const unAnsweredCount = totalQuestions - answeredCount;
    if (unAnsweredCount > 0) {
      setShowSubmitWarning(true);
    } else {
      handleSubmitAttempt();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Back Link */}
        <Link
          href={`/levels/${exam.levelId}`}
          className="w-10 h-10 rounded-2xl bg-white border border-cream-300 hover:bg-cream-200 flex items-center justify-center text-charcoal/70 shadow-sm transition-all"
          title="Rời khỏi bài thi"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Progress Bar & Question Counter */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-charcoal/70">
            <span>
              Câu {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-coral">Đã làm: {answeredCount}/{totalQuestions}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full bg-coral transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Timer */}
        <QuizTimer
          initialSeconds={elapsedSeconds}
          timeLimitSeconds={exam.timeLimitSeconds}
          onTick={(sec) => setElapsed(sec)}
          onTimeUp={() => handleSubmitAttempt()}
        />

        {/* Question Palette Trigger Button */}
        <button
          type="button"
          onClick={() => setIsPaletteOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-cream-300 hover:border-amber-300 text-charcoal shadow-sm flex items-center gap-1.5 text-xs font-bold transition-all"
        >
          <Grid size={18} className="text-amber-600" />
          <span className="hidden sm:inline">Bảng câu</span>
        </button>
      </div>

      {/* Question Title & Prompt Renderer */}
      <QuizRenderer
        question={currentQuestion}
        value={currentAnswer}
        onChange={handleAnswerChange}
      />

      {/* Bottom Action Control Bar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-1.5 transition-all ${
            currentIndex === 0
              ? "opacity-40 cursor-not-allowed bg-cream-200 text-charcoal"
              : "bg-white border-2 border-cream-300 hover:bg-cream-100 text-charcoal shadow-duo active:translate-y-1"
          }`}
        >
          <ArrowLeft size={16} />
          <span>Câu trước</span>
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-sm flex items-center gap-1.5 shadow-duo-coral active:translate-y-1 transition-all"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-mint hover:bg-mint-dark text-white font-bold text-base flex items-center gap-2 shadow-duo-mint active:translate-y-1 transition-all animate-pulse"
          >
            <Send size={18} />
            <span>{isSubmitting ? "Đang chấm..." : "NỘP BÀI"}</span>
          </button>
        )}
      </div>

      {/* Floating Submit button on all questions if user wants to submit early */}
      {currentIndex < totalQuestions - 1 && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={handleConfirmSubmit}
            className="text-xs font-bold text-charcoal/50 hover:text-coral underline tracking-wide transition-colors"
          >
            Nộp bài thi ngay (không cần đợi hết câu)
          </button>
        </div>
      )}

      {/* Question Palette Modal */}
      <QuestionPalette
        questions={exam.questions}
        answers={savedAnswers}
        currentIndex={currentIndex}
        onSelectIndex={(idx) => {
          setCurrentIndex(idx);
          setIndex(idx);
        }}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      {/* Unanswered Warning Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-300 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-charcoal">
              Còn câu hỏi chưa làm!
            </h3>
            <p className="text-sm text-charcoal/70">
              Bạn vẫn còn{" "}
              <strong className="text-coral font-bold">
                {totalQuestions - answeredCount} câu
              </strong>{" "}
              chưa điền câu trả lời. Bạn có chắc chắn muốn nộp bài để chấm điểm ngay bây giờ không?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitWarning(false)}
                className="flex-1 py-3 rounded-2xl bg-cream-200 hover:bg-cream-300 text-charcoal font-bold text-sm transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitWarning(false);
                  handleSubmitAttempt();
                }}
                className="flex-1 py-3 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-sm shadow-duo-coral transition-all"
              >
                Vẫn nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
