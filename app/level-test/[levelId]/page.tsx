"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { repository } from "@/services";
import { AnswerValue, Exam, LevelId, QuestionResult, ExamAttempt, LevelProgressInfo } from "@/types";
import { QuizRenderer, QuestionPalette, QuizTimer } from "@/features/quiz";
import { gradeQuestion } from "@/lib/grading";
import { triggerConfetti } from "@/components/ui/Confetti";
import { soundService } from "@/lib/sound";

export default function LevelTestPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = (params.levelId as LevelId) || "basic";

  const [exam, setExam] = useState<Exam | null>(null);
  const [levelProg, setLevelProg] = useState<LevelProgressInfo | null>(null);
  const [isLevelUnlocked, setIsLevelUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<ExamAttempt | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [profile, prog] = await Promise.all([
          repository.getProfile(),
          repository.getLevelProgress(levelId),
        ]);
        const unlocked = profile.unlockedLevels.includes(levelId);
        setIsLevelUnlocked(unlocked);
        setLevelProg(prog);

        if (unlocked && (prog.canTakeLevelTest || prog.hasPassedLevelTest)) {
          const testExam = await repository.generateLevelTest(levelId);
          setExam(testExam);
        }
      } catch (e) {
        console.error("Lỗi tạo bài thi lên cấp:", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [levelId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-charcoal/60">
        <div className="animate-spin w-10 h-10 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang khởi tạo đề thi lên cấp 40 câu...
      </div>
    );
  }

  if (!isLevelUnlocked || (!levelProg?.canTakeLevelTest && !levelProg?.hasPassedLevelTest)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-parchment-200 border border-parchment-300 text-ink-light flex items-center justify-center mx-auto">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-black text-ink">Bài kiểm tra lên cấp đang bị khóa</h1>
        <p className="text-sm text-ink-light leading-relaxed">
          {!isLevelUnlocked
            ? "Bạn cần mở khóa cấp độ này trước khi làm bài kiểm tra lên cấp."
            : `Bạn cần hoàn thành thêm ${levelProg?.examsNeededForTest ?? 0} đề đạt từ 60% trở lên để mở khóa bài kiểm tra lên cấp.`}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/" className="px-5 py-2.5 rounded-2xl bg-parchment-200 text-ink font-bold text-sm">
            Quay về trang chủ
          </Link>
          {isLevelUnlocked && (
            <Link href={`/levels/${levelId}`} className="px-5 py-2.5 rounded-2xl bg-celadon text-white font-bold text-sm">
              Quay lại luyện đề
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!exam || exam.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Không thể tải đề thi lên cấp</h2>
        <Link href="/" className="px-6 py-2.5 rounded-2xl bg-coral text-white font-bold inline-block">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Handle submit level test
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersResult: Record<string, QuestionResult> = {};
      for (const q of exam.questions) {
        const uAns = answers[q.id];
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
        durationSeconds: elapsedSeconds,
      });

      setTestResult(attempt);

      if (attempt.score >= 80) {
        triggerConfetti();
        soundService.playFanfare();
      } else {
        soundService.playError();
      }
    } catch (e) {
      console.error("Lỗi nộp bài thi lên cấp:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // RETAKE TEST: reshuffle new test
  const handleRetake = async () => {
    setLoading(true);
    setTestResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    try {
      const newExam = await repository.generateLevelTest(levelId, Date.now());
      setExam(newExam);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // IF TEST ALREADY SUBMITTED, SHOW LEVEL-UP CELEBRATION OR REMEDIATION SCREEN
  if (testResult) {
    const passed = testResult.score >= 80;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-cream-300 shadow-card text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-lg border">
            {passed ? "🏆" : "📚"}
          </div>

          <div className="space-y-2">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                passed
                  ? "bg-mint-light text-mint-dark border border-mint"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {passed ? "CHÚC MỪNG BẠN ĐÃ LÊN CẤP!" : "CHƯA ĐẠT ĐIỂM YÊU CẦU"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-charcoal">
              {passed ? "Chứng nhận hoàn thành cấp độ!" : "Cố lên! Bạn sắp chạm tới mục tiêu"}
            </h1>
            <p className="text-sm sm:text-base text-charcoal/70 max-w-lg mx-auto">
              {passed
                ? `Bạn đã đạt ${testResult.score}% (yêu cầu ≥ 80%), xuất sắc vượt qua bài kiểm tra và mở khóa cấp độ tiếp theo!`
                : `Bạn đạt ${testResult.score}% (cần đạt từ 80% trở lên để mở khóa cấp tiếp theo). Hãy xem lại các chủ đề yếu bên dưới rồi thi lại nhé!`}
            </p>
          </div>

          {/* Score card */}
          <div className="inline-flex items-center gap-6 p-4 px-8 bg-cream-50 rounded-2xl border border-cream-200">
            <div>
              <div className="text-xs text-charcoal/50">Điểm số</div>
              <div className="text-3xl font-black text-coral">{testResult.score}%</div>
            </div>
            <div className="w-[1px] h-8 bg-cream-300"></div>
            <div>
              <div className="text-xs text-charcoal/50">Đúng/Tổng</div>
              <div className="text-xl font-black text-charcoal">
                {testResult.correctCount}/{testResult.totalQuestions}
              </div>
            </div>
          </div>

          {/* Weak topic suggestions if failed */}
          {!passed && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs sm:text-sm space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle size={16} />
                <span>Gợi ý chủ đề cần ôn tập lại:</span>
              </div>
              <p className="text-charcoal/70">
                Hãy quay lại danh sách đề của cấp độ này, hoàn thành thêm các đề về ngữ pháp câu chữ 把/被, trật tự từ và luyện nghe trước khi thử lại! Đề thi lần tới sẽ được xáo trộn câu mới hoàn toàn.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleRetake}
              className="px-6 py-3.5 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-sm shadow-duo-coral flex items-center gap-2"
            >
              <RotateCcw size={18} />
              <span>Thi lại (Đề trộn ngẫu nhiên mới)</span>
            </button>

            <Link
              href={`/practice/${exam.id}/result/${testResult.id}`}
              className="px-6 py-3.5 rounded-2xl bg-cream-200 hover:bg-cream-300 text-charcoal font-bold text-sm"
            >
              Xem chi tiết 40 câu hỏi & lời giải
            </Link>

            <Link
              href="/"
              className="px-6 py-3.5 rounded-2xl bg-white border border-cream-300 hover:bg-cream-50 text-charcoal font-bold text-sm"
            >
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE LEVEL TEST PLAYING VIEW
  const currentQuestion = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const answeredCount = Object.keys(answers).filter((k) => {
    const val = answers[k];
    return (
      val !== undefined &&
      val !== "" &&
      val !== null &&
      (!Array.isArray(val) || val.length > 0) &&
      (typeof val !== "object" || Object.keys(val).length > 0)
    );
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Quiz */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Header */}
          <div className="flex items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-3xl border border-parchment-300 shadow-soft">
            <Link
              href={`/levels/${levelId}`}
              className="w-10 h-10 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 flex items-center justify-center text-ink-muted hover:text-ink transition-all"
              title="Rời bài thi"
            >
              <ArrowLeft size={18} />
            </Link>

            {/* Progress & Title */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-vermillion-deep flex items-center gap-1 truncate">
                  <Award size={15} />
                  Thi lên cấp: Câu {currentIndex + 1}/{totalQuestions}
                </span>
                <span className="text-ink-muted shrink-0 ml-2">
                  Đã làm: <strong className="text-celadon-dark">{answeredCount}</strong>/{totalQuestions}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-parchment-200 overflow-hidden">
                <div
                  className="h-full bg-vermillion rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentIndex + 1) / totalQuestions) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Countdown Timer */}
            <QuizTimer
              initialSeconds={elapsedSeconds}
              timeLimitSeconds={exam.timeLimitSeconds}
              onTick={(sec) => setElapsedSeconds(sec)}
              onTimeUp={() => handleSubmit()}
            />

            {/* Mobile Question Palette Trigger */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink shadow-sm flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <Award size={16} className="text-vermillion" />
              <span className="hidden sm:inline">Bảng câu</span>
            </button>
          </div>

          {/* Question Renderer */}
          <QuizRenderer
            question={currentQuestion}
            value={currentAnswer}
            onChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                currentIndex === 0
                  ? "opacity-40 cursor-not-allowed bg-parchment-200 text-ink-muted"
                  : "bg-white border-2 border-parchment-300 hover:bg-parchment-100 text-ink shadow-soft"
              }`}
            >
              <ArrowLeft size={16} />
              <span>Câu trước</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-6 py-3 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-sm flex items-center gap-1.5 shadow-soft hover:shadow-md transition-all"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-base shadow-soft hover:shadow-md animate-pulse"
              >
                {isSubmitting ? "Đang chấm điểm..." : "NỘP BÀI THI LÊN CẤP"}
              </button>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar Question Palette */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <QuestionPalette
            questions={exam.questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            mode="sidebar"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {/* Mobile Dialog Palette */}
      <QuestionPalette
        questions={exam.questions}
        answers={answers}
        currentIndex={currentIndex}
        onSelectIndex={(idx) => {
          setCurrentIndex(idx);
          setIsPaletteOpen(false);
        }}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        mode="dialog"
      />
    </div>
  );
}
