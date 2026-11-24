"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Award,
  Sparkles,
} from "lucide-react";
import { repository } from "@/services";
import { Exam, LevelId, QuestionResult } from "@/types";
import { QuizRenderer, QuestionPalette, QuizTimer } from "@/features/quiz";
import { gradeQuestion } from "@/lib/grading";
import { triggerConfetti } from "@/components/ui/Confetti";
import { soundService } from "@/lib/sound";
import { useUserStore } from "@/store/useUserStore";

export default function PlacementTestPage() {
  const router = useRouter();
  const { profile, loadProfile } = useUserStore();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correctCount: number;
    recommendedLevel: LevelId;
    levelName: string;
  } | null>(null);

  useEffect(() => {
    loadProfile();
    async function load() {
      try {
        const test = await repository.generatePlacementTest();
        setExam(test);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-charcoal/60">
        <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang khởi tạo đề kiểm tra xếp lớp 30 câu...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        Không tải được bài kiểm tra.
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let correct = 0;
    for (const q of exam.questions) {
      if (gradeQuestion(q, answers[q.id])) {
        correct++;
      }
    }
    const score = Math.round((correct / exam.questions.length) * 100);

    // Determine recommended level:
    // Score < 50% -> Cơ bản (HSK 1-2)
    // Score 50% - 79% -> Trung cấp (HSK 3-4)
    // Score >= 80% -> Nâng cao (HSK 5-6)
    let recommended: LevelId = "basic";
    let name = "Cơ bản (HSK 1-2)";
    if (score >= 80) {
      recommended = "advanced";
      name = "Nâng cao (HSK 5-6)";
    } else if (score >= 50) {
      recommended = "intermediate";
      name = "Trung cấp (HSK 3-4)";
    }

    // Auto-unlock recommended level in user profile and save mistakes
    try {
      const answersResult: Record<string, QuestionResult> = {};
      for (const q of exam.questions) {
        const uAns = answers[q.id];
        const isCorrect = gradeQuestion(q, uAns);
        answersResult[q.id] = {
          userAnswer: uAns,
          isCorrect,
          question: q,
        };
      }
      await repository.updateMistakes(answersResult, {
        examId: "placement-test",
        examTitle: "Bài kiểm tra xếp lớp đầu vào",
        levelId: recommended,
      });

      const unlocked = ["basic" as LevelId];
      if (recommended === "intermediate") unlocked.push("intermediate");
      if (recommended === "advanced") {
        unlocked.push("intermediate");
        unlocked.push("advanced");
      }
      await repository.saveProfile({
        unlockedLevels: unlocked,
      });
      await loadProfile();
    } catch {}

    triggerConfetti();
    soundService.playFanfare();

    setResult({
      score,
      correctCount: correct,
      recommendedLevel: recommended,
      levelName: name,
    });
    setIsSubmitting(false);
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-300 shadow-card space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center text-4xl shadow-md border border-amber-200">
            🎯
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              Kết quả xếp lớp của bạn
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-charcoal">
              Trình độ đề xuất: {result.levelName}
            </h1>
            <p className="text-sm sm:text-base text-charcoal/70 max-w-md mx-auto">
              Bạn đạt được <strong>{result.score}%</strong> ({result.correctCount}/30 câu đúng). Hệ thống đã tự động mở khóa lộ trình phù hợp nhất cho bạn!
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/levels/${result.recommendedLevel}`}
              className="px-8 py-3.5 rounded-2xl bg-coral hover:bg-coral-dark text-white font-bold text-base shadow-duo-coral active:translate-y-1 transition-all flex items-center gap-2"
            >
              <span>Vào học cấp {result.levelName} ngay</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/"
              className="px-6 py-3.5 rounded-2xl bg-cream-200 hover:bg-cream-300 text-charcoal font-bold text-sm"
            >
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;
  const currentAnswer = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== "" && answers[k] !== null
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-2xl bg-white border border-cream-300 flex items-center justify-center text-charcoal/70"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-800 flex items-center gap-1">
              <Compass size={15} />
              Xếp lớp đầu vào: Câu {currentIndex + 1}/{totalQuestions}
            </span>
            <span className="text-charcoal/60">Đã làm: {answeredCount}/{totalQuestions}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(((currentIndex + 1) / totalQuestions) * 100)}%` }}
            ></div>
          </div>
        </div>

        <QuizTimer
          initialSeconds={elapsedSeconds}
          timeLimitSeconds={exam.timeLimitSeconds}
          onTick={(sec) => setElapsedSeconds(sec)}
          onTimeUp={() => handleSubmit()}
        />

        <button
          type="button"
          onClick={() => setIsPaletteOpen(true)}
          className="p-2.5 rounded-2xl bg-white border border-cream-300 font-bold text-xs"
        >
          Bảng câu ({answeredCount}/{totalQuestions})
        </button>
      </div>

      <QuizRenderer
        question={currentQuestion}
        value={currentAnswer}
        onChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
      />

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-1.5 ${
            currentIndex === 0 ? "opacity-40 cursor-not-allowed bg-cream-200" : "bg-white border-2 border-cream-300"
          }`}
        >
          <ArrowLeft size={16} />
          <span>Câu trước</span>
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-duo-honey"
          >
            <span>Câu tiếp</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl bg-mint hover:bg-mint-dark text-white font-bold text-base shadow-duo-mint"
          >
            {isSubmitting ? "Đang xếp lớp..." : "HOÀN THÀNH XẾP LỚP"}
          </button>
        )}
      </div>

      <QuestionPalette
        questions={exam.questions}
        answers={answers}
        currentIndex={currentIndex}
        onSelectIndex={(idx) => setCurrentIndex(idx)}
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </div>
  );
}
