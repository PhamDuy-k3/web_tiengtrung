"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Grid,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { repository } from "@/services";
import { AnswerValue, Exam, PracticeMode, QuestionResult } from "@/types";
import { QuizRenderer, QuestionPalette, QuizTimer } from "@/features/quiz";
import { gradeQuestion } from "@/lib/grading";
import { soundService } from "@/lib/sound";
import { speechService } from "@/lib/speech";
import { useQuizDraftStore } from "@/store/useQuizDraftStore";

function getQuestionDurationSnapshot(
  currentQuestionId: string | undefined,
  currentStartedAt: number,
  previousDurations: Record<string, number>
): Record<string, number> {
  const durations = { ...previousDurations };
  if (currentQuestionId && currentStartedAt > 0) {
    const seconds = Math.max(0, Math.round((Date.now() - currentStartedAt) / 1000));
    durations[currentQuestionId] = (durations[currentQuestionId] ?? 0) + seconds;
  }
  return durations;
}

export default function ExamPracticePage() {
  const params = useParams();
  const router = useRouter();
  const examId = (params.examId as string) || "";

  const [exam, setExam] = useState<Exam | null>(null);
  const [mode, setMode] = useState<PracticeMode>("practice");
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const questionStartedAt = useRef(0);
  const sessionStartedAt = useRef(Date.now());
  const sessionStartElapsed = useRef(0);

  // Instant check feedback state for current question
  const [checkedFeedback, setCheckedFeedback] = useState<{
    [qId: string]: { isCorrect: boolean; checked: boolean; score: number; feedback: string };
  }>({});

  // Draft store
  const {
    savedAnswers,
    elapsedSeconds,
    addQuestionDuration,
    initExam,
    setDraftAnswer,
    setIndex,
    setElapsed,
    clearDraft,
  } = useQuizDraftStore();

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hanyu:bookmarks");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setBookmarkedIds(new Set(parsed));
        }
      }
    } catch {}
  }, []);

  const handleToggleBookmark = (qid: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) {
        next.delete(qid);
      } else {
        next.add(qid);
        soundService.playSuccess();
      }
      try {
        localStorage.setItem("hanyu:bookmarks", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    initExam(examId);
    setCurrentIndex(useQuizDraftStore.getState().currentQuestionIndex);
    sessionStartedAt.current = Date.now();
    sessionStartElapsed.current = useQuizDraftStore.getState().elapsedSeconds;
    async function load() {
      try {
        const requestedMode = new URLSearchParams(window.location.search).get("mode");
        const pageMode: PracticeMode = requestedMode === "exam" || requestedMode === "quick" || requestedMode === "type"
          ? requestedMode
          : "practice";
        setMode(pageMode);
        sessionStartedAt.current = Date.now();
        sessionStartElapsed.current = useQuizDraftStore.getState().elapsedSeconds;
        const loaded = await repository.getExam(examId);
        if (loaded && pageMode === "quick") {
          const quickQuestions = loaded.questions.slice(0, 8);
          setExam({ ...loaded, title: `Luyện nhanh · ${loaded.title}`, questions: quickQuestions, timeLimitSeconds: undefined });
          setCurrentIndex((prev) => (quickQuestions.length > 0 && prev >= quickQuestions.length ? 0 : prev));
        } else {
          setExam(loaded);
          if (loaded && loaded.questions.length > 0) {
            setCurrentIndex((prev) => (prev >= loaded.questions.length ? 0 : prev));
          }
        }
      } catch (e) {
        console.error("Lỗi tải đề thi:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId, initExam]);

  useEffect(() => {
    if (mode === "exam") return;
    const interval = window.setInterval(() => {
      setElapsed(sessionStartElapsed.current + Math.max(0, Math.floor((Date.now() - sessionStartedAt.current) / 1000)));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [mode, setElapsed]);

  const totalQuestions = exam?.questions?.length || 0;
  const currentQuestion = exam?.questions?.[currentIndex];
  const activeQuestionId = currentQuestion?.id;
  const currentAnswer = currentQuestion ? savedAnswers[currentQuestion.id] : undefined;

  useEffect(() => {
    if (!activeQuestionId) return;
    const questionId = activeQuestionId;
    questionStartedAt.current = Date.now();
    return () => {
      const seconds = Math.max(0, Math.round((Date.now() - questionStartedAt.current) / 1000));
      addQuestionDuration(questionId, seconds);
    };
  }, [activeQuestionId, addQuestionDuration]);

  const answeredCount = Object.keys(savedAnswers).filter(
    (k) =>
      savedAnswers[k] !== undefined &&
      savedAnswers[k] !== "" &&
      savedAnswers[k] !== null &&
      (!Array.isArray(savedAnswers[k]) || savedAnswers[k].length > 0) &&
      (typeof savedAnswers[k] !== "object" || Object.keys(savedAnswers[k]).length > 0)
  ).length;

  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const handleAnswerChange = (val: AnswerValue) => {
    if (!currentQuestion) return;
    setDraftAnswer(examId, currentQuestion.id, val);
    // Reset check state for this question when answer changes
    if (checkedFeedback[currentQuestion.id]) {
      setCheckedFeedback((prev) => ({
        ...prev,
        [currentQuestion.id]: { isCorrect: false, checked: false, score: 0, feedback: "" },
      }));
    }
  };

  const isMockExam = mode === "exam";

  // Check current question instantly in practice modes.
  const handleCheckCurrentQuestion = async () => {
    if (isMockExam || !currentQuestion || !exam) return;
    if (currentAnswer === undefined || currentAnswer === null || currentAnswer === "") {
      return;
    }
    const grade = gradeQuestion(currentQuestion, currentAnswer);
    setCheckedFeedback((prev) => ({
      ...prev,
      [currentQuestion.id]: { isCorrect: grade.correct, checked: true, score: grade.score, feedback: grade.feedback },
    }));

    if (grade.correct) {
      soundService.playSuccess();
    } else {
      soundService.playError();
      // Immediately record mistake to repository
      if (repository.recordSingleMistake) {
        await repository.recordSingleMistake(currentQuestion, currentAnswer, {
          examId: exam.id,
          examTitle: exam.title,
          levelId: exam.levelId,
        });
      }
    }
  };

  // When moving to another question, if an answer was provided and is wrong, auto save to mistakes
  const saveCurrentAnswerIfWrong = async (targetIndex: number) => {
    if (!currentQuestion || !exam) return;
    if (
      currentAnswer !== undefined &&
      currentAnswer !== null &&
      currentAnswer !== "" &&
      (!Array.isArray(currentAnswer) || currentAnswer.length > 0) &&
      (typeof currentAnswer !== "object" || Object.keys(currentAnswer).length > 0)
    ) {
      if (!isMockExam) {
        const grade = gradeQuestion(currentQuestion, currentAnswer);
        if (!grade.correct && repository.recordSingleMistake) {
          await repository.recordSingleMistake(currentQuestion, currentAnswer, {
            examId: exam.id,
            examTitle: exam.title,
            levelId: exam.levelId,
          });
        }
      }
    }
    setCurrentIndex(targetIndex);
    setIndex(targetIndex);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      saveCurrentAnswerIfWrong(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      saveCurrentAnswerIfWrong(currentIndex - 1);
    }
  };

  const handleSubmitAttempt = async () => {
    if (!exam) return;
    setIsSubmitting(true);
    try {
      // Grade each question
      const answersResult: Record<string, QuestionResult> = {};
      for (const q of exam.questions) {
        const uAns = savedAnswers[q.id];
        const grade = gradeQuestion(q, uAns);
        answersResult[q.id] = {
          userAnswer: uAns,
          isCorrect: grade.correct,
          score: grade.score,
          matchedAnswer: grade.matchedAnswer,
          feedback: grade.feedback,
          question: q,
        };
      }

      const attempt = await repository.submitAttempt({
        examId: exam.id,
        levelId: exam.levelId,
        topicId: exam.topicId,
        examTitle: exam.title,
        answers: answersResult,
        durationSeconds: Math.max(
          elapsedSeconds,
          sessionStartElapsed.current + Math.max(0, Math.round((Date.now() - sessionStartedAt.current) / 1000))
        ),
        questionDurations: getQuestionDurationSnapshot(
          currentQuestion?.id,
          questionStartedAt.current,
          useQuizDraftStore.getState().questionDurations
        ),
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

  const currentQCheck = currentQuestion ? checkedFeedback[currentQuestion.id] : undefined;
  const hasSelectedAnswer =
    currentAnswer !== undefined &&
    currentAnswer !== "" &&
    currentAnswer !== null &&
    (!Array.isArray(currentAnswer) || currentAnswer.length > 0) &&
    (typeof currentAnswer !== "object" || Object.keys(currentAnswer).length > 0);

  const keyboardActionsRef = useRef({
    handleCheckCurrentQuestion,
    handleConfirmSubmit,
    handleNext,
    handlePrev,
  });
  keyboardActionsRef.current = {
    handleCheckCurrentQuestion,
    handleConfirmSubmit,
    handleNext,
    handlePrev,
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    if (!exam || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (!isMockExam && hasSelectedAnswer && !currentQCheck?.checked) {
          keyboardActionsRef.current.handleCheckCurrentQuestion();
        } else {
          if (currentIndex < totalQuestions - 1) {
            keyboardActionsRef.current.handleNext();
          } else {
            keyboardActionsRef.current.handleConfirmSubmit();
          }
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        keyboardActionsRef.current.handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        keyboardActionsRef.current.handleNext();
      } else if (e.code === "Space") {
        if (currentQuestion.chineseText) {
          e.preventDefault();
          speechService.speak(currentQuestion.chineseText, 0.95).catch(() => {});
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exam, currentQuestion, hasSelectedAnswer, currentQCheck, currentIndex, totalQuestions, isMockExam]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ink-muted">
        <div className="animate-spin w-10 h-10 border-4 border-celadon border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang chuẩn bị đề luyện tập...
      </div>
    );
  }

  if (!exam || !currentQuestion || exam.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-ink">Không tìm thấy đề thi</h2>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-2xl bg-celadon text-white font-bold"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* 2-column layout: Left is main quiz, Right is sticky Question Palette sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: MAIN QUIZ ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-3xl border border-parchment-300 shadow-soft">
            {/* Back Link */}
            <Link
              href={`/levels/${exam.levelId}`}
              className="w-10 h-10 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 flex items-center justify-center text-ink-muted hover:text-ink transition-all"
              title="Rời khỏi bài thi"
            >
              <ArrowLeft size={18} />
            </Link>

            {/* Exam info + Progress Bar */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="truncate text-ink">
                  {isMockExam && <span className="mr-1 rounded-full bg-vermillion-light px-2 py-0.5 text-vermillion-deep">Thi thử</span>}
                  {exam.title} · <span className="text-celadon-dark font-black">Câu {currentIndex + 1}/{totalQuestions}</span>
                </span>
                <span className="text-ink-muted shrink-0 ml-2">
                  Đã làm: <strong className="text-celadon-dark">{answeredCount}</strong>/{totalQuestions}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-parchment-200 overflow-hidden">
                <div
                  className="h-full bg-celadon transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Timer */}
            {isMockExam && <QuizTimer
              initialSeconds={elapsedSeconds}
              timeLimitSeconds={exam.timeLimitSeconds ?? totalQuestions * 60}
              onTick={(sec) => setElapsed(sec)}
              onTimeUp={() => handleSubmitAttempt()}
            />}

            {/* Mobile-only Question Palette Trigger Button */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink shadow-sm flex items-center gap-1.5 text-xs font-bold transition-all"
              title="Mở bảng câu hỏi"
            >
              <Grid size={18} className="text-celadon-dark" />
              <span className="hidden sm:inline">Bảng câu</span>
            </button>
          </div>

          {/* Question Title & Prompt Renderer */}
          <QuizRenderer
            question={currentQuestion}
            value={currentAnswer}
            onChange={handleAnswerChange}
            isBookmarked={bookmarkedIds.has(currentQuestion.id)}
            onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
            onReport={(report) => repository.reportQuestion({
              questionId: currentQuestion.id,
              examId: exam.id,
              prompt: currentQuestion.prompt,
              ...report,
            }).then(() => undefined)}
          />

          {/* Instant feedback card if checked */}
          {!isMockExam && currentQCheck?.checked && (
            <div
              className={`p-4 sm:p-5 rounded-3xl border transition-all animate-fadeIn ${
                currentQCheck.isCorrect
                  ? "bg-celadon-50 border-celadon-300 text-celadon-dark"
                  : "bg-vermillion-light border-vermillion-soft text-vermillion-deep"
              }`}
            >
              <div className="flex items-start gap-3">
                {currentQCheck.isCorrect ? (
                  <CheckCircle2 size={24} className="text-celadon shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={24} className="text-vermillion shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="font-black text-sm sm:text-base flex items-center justify-between">
                    <span>
                      {currentQCheck.isCorrect
                        ? "Chính xác! Làm rất tốt! 🎉"
                        : "Chưa chính xác — Câu này đã được lưu vào Sổ lỗi sai! 📌"}
                    </span>
                  </div>
                  {currentQCheck.feedback && (
                    <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                      <strong>{currentQCheck.score > 0 && currentQCheck.score < 100 ? `Điểm một phần: ${currentQCheck.score}%. ` : "Giải thích: "}</strong>
                      {currentQCheck.feedback}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                currentIndex === 0
                  ? "opacity-40 cursor-not-allowed bg-parchment-200 text-ink-muted"
                  : "bg-white border-2 border-parchment-300 hover:bg-parchment-100 text-ink shadow-soft active:translate-y-0.5"
              }`}
            >
              <ArrowLeft size={16} />
              <span>Câu trước</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Check Answer Button (Duolingo style) */}
              {!isMockExam && hasSelectedAnswer && !currentQCheck?.checked && (
                <button
                  type="button"
                  onClick={handleCheckCurrentQuestion}
                  className="px-4 py-3 rounded-2xl bg-parchment-200 hover:bg-parchment-300 text-ink-dark font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
                  title="Kiểm tra ngay câu này"
                >
                  <Sparkles size={15} className="text-gilt-deep" />
                  <span>Kiểm tra</span>
                </button>
              )}

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-soft hover:shadow-md active:translate-y-0.5 transition-all"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-soft hover:shadow-md active:translate-y-0.5 transition-all animate-pulse"
                >
                  <Send size={18} />
                  <span>{isSubmitting ? "Đang chấm..." : "NỘP BÀI"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ALWAYS-VISIBLE QUESTION PALETTE SIDEBAR ================= */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <QuestionPalette
            questions={exam.questions}
            answers={savedAnswers}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => {
              saveCurrentAnswerIfWrong(idx);
            }}
            mode="sidebar"
            onSubmit={handleConfirmSubmit}
            isSubmitting={isSubmitting}
            bookmarkedIds={bookmarkedIds}
          />
        </div>
      </div>

      {/* Mobile-only Question Palette Modal */}
      <QuestionPalette
        questions={exam.questions}
        answers={savedAnswers}
        currentIndex={currentIndex}
        onSelectIndex={(idx) => {
          saveCurrentAnswerIfWrong(idx);
          setIsPaletteOpen(false);
        }}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        mode="dialog"
        onSubmit={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        bookmarkedIds={bookmarkedIds}
      />

      {/* Floating Keyboard Shortcuts Legend Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 bg-parchment-100/90 rounded-2xl border border-parchment-300 text-xs text-ink-muted flex items-center justify-center gap-3 flex-wrap shadow-soft">
        <span className="font-bold text-ink flex items-center gap-1">
          ⌨️ Phím tắt nhanh:
        </span>
        <span className="bg-white px-2 py-0.5 rounded-md border border-parchment-300 font-mono text-[11px] font-bold text-ink">[1-4 / A-D]</span>
        <span>Chọn đáp án</span>
        <span className="text-parchment-400">•</span>
        <span className="bg-white px-2 py-0.5 rounded-md border border-parchment-300 font-mono text-[11px] font-bold text-ink">[↵ Enter]</span>
        <span>Kiểm tra / Tiếp theo</span>
        <span className="text-parchment-400">•</span>
        <span className="bg-white px-2 py-0.5 rounded-md border border-parchment-300 font-mono text-[11px] font-bold text-ink">[Space]</span>
        <span>Nghe phát âm</span>
        <span className="text-parchment-400">•</span>
        <span className="bg-white px-2 py-0.5 rounded-md border border-parchment-300 font-mono text-[11px] font-bold text-ink">[← →]</span>
        <span>Chuyển câu</span>
      </div>

      {/* Unanswered Warning Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-parchment-300 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gilt-light text-gilt-deep flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-ink">
              Còn câu hỏi chưa làm!
            </h3>
            <p className="text-sm text-ink-muted">
              Bạn vẫn còn{" "}
              <strong className="text-vermillion font-bold">
                {totalQuestions - answeredCount} câu
              </strong>{" "}
              chưa điền câu trả lời. Bạn có chắc chắn muốn nộp bài để chấm điểm ngay bây giờ không?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitWarning(false)}
                className="flex-1 py-3 rounded-2xl bg-parchment-200 hover:bg-parchment-300 text-ink font-bold text-sm transition-all"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitWarning(false);
                  handleSubmitAttempt();
                }}
                className="flex-1 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm shadow-soft transition-all"
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
