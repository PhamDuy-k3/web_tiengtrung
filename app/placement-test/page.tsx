"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  RotateCcw,
  BookOpen,
  Calendar,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { repository } from "@/services";
import { AnswerValue, LevelId, QuestionResult, Question } from "@/types";
import { QuizRenderer, QuestionPalette, QuizTimer } from "@/features/quiz";
import { triggerConfetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/store/useUserStore";
import { MascotWithBubble } from "@/components/mascot/MascotWithBubble";
import {
  generateAssessmentTest,
  evaluateAssessmentTest,
  AssessmentQuestion,
  EvaluateTestResponse,
} from "@/lib/assessmentEngine";

// Map AssessmentQuestion sang định dạng Question của ứng dụng
function mapAssessmentToQuizQuestion(aq: AssessmentQuestion): Question {
  return {
    id: `assess-${aq.id}`,
    version: 1,
    type: "multiple_choice",
    hskLevel: Math.min(6, Math.max(1, aq.level)) as Question["hskLevel"],
    difficulty: Math.min(5, Math.max(1, aq.level)) as Question["difficulty"],
    topicId: `hsk-${aq.level}-${aq.skill}`,
    tags: [aq.skill, aq.topicTag || `HSK_${aq.level}`],
    prompt: aq.question,
    pinyin: aq.pinyin,
    options: Object.values(aq.options),
    correctAnswer: aq.options[aq.answer],
    explanation: aq.explanation,
  };
}

export default function PlacementTestPage() {
  const router = useRouter();
  const { profile, loadProfile } = useUserStore();

  const [rawQuestions, setRawQuestions] = useState<AssessmentQuestion[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assessment Evaluation Result
  const [evalResult, setEvalResult] = useState<EvaluateTestResponse | null>(null);

  const initTest = () => {
    setLoading(true);
    setAnswers({});
    setCurrentIndex(0);
    setEvalResult(null);

    // Tạo bài test 12 câu (HSK 1 đến HSK 4, mỗi cấp 3 câu đủ từ vựng, ngữ pháp, đọc hiểu)
    const testData = generateAssessmentTest({
      questions_per_level: 3,
      max_level: 4,
      script: "giản thể",
      hsk_system: "HSK 2.0",
    });

    setRawQuestions(testData.questions);
    setQuizQuestions(testData.questions.map(mapAssessmentToQuizQuestion));
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
    initTest();
  }, [loadProfile]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Map user answers sang A/B/C/D
      const mappedUserAnswers: Record<number, string> = {};
      const answersResultForRepo: Record<string, QuestionResult> = {};

      quizQuestions.forEach((q, idx) => {
        const rawQ = rawQuestions[idx];
        const userChoice = answers[q.id];

        // Tìm key A, B, C, D
        let choiceKey = "";
        for (const [k, v] of Object.entries(rawQ.options)) {
          if (v === userChoice) {
            choiceKey = k;
            break;
          }
        }
        if (choiceKey) {
          mappedUserAnswers[rawQ.id] = choiceKey;
        }

        const isCorrect = choiceKey === rawQ.answer;
        answersResultForRepo[q.id] = {
          userAnswer: userChoice,
          isCorrect,
          score: isCorrect ? 100 : 0,
          matchedAnswer: q.correctAnswer,
          feedback: isCorrect ? "Chính xác!" : q.explanation,
          question: q,
        };
      });

      // Đánh giá theo quy chuẩn HSK (đạt khi đúng >= 2/3 số câu)
      const evaluation = evaluateAssessmentTest(rawQuestions, mappedUserAnswers);
      setEvalResult(evaluation);

      // Lưu kết quả đánh giá kèm thời điểm hoàn thành để trang Lộ trình nhận biết vừa test lại
      try {
        localStorage.setItem(
          "hanyu:assessment_result",
          JSON.stringify({
            ...evaluation,
            completedAt: new Date().toISOString(),
          })
        );
      } catch {}

      // Tự động mở khóa cấp độ đạt được trong profile (giữ nguyên các cấp đã mở trước đó)
      try {
        const existingUnlocked = profile?.unlockedLevels ?? ["basic"];
        const unlockedSet = new Set<LevelId>(["basic", ...existingUnlocked]);
        if (evaluation.verified_level >= 3) unlockedSet.add("intermediate");
        if (evaluation.verified_level >= 5) unlockedSet.add("advanced");

        await repository.saveProfile({
          unlockedLevels: Array.from(unlockedSet),
        });
        await loadProfile();

        // Ghi nhận câu sai vào Sổ lỗi sai
        await repository.updateMistakes(answersResultForRepo, {
          examId: "placement-test-standard",
          examTitle: "Bài kiểm tra xếp lớp chuẩn HSK",
          levelId: evaluation.verified_level <= 2 ? "basic" : evaluation.verified_level <= 4 ? "intermediate" : "advanced",
        });
      } catch (e) {
        console.error(e);
      }

      if (evaluation.verified_level >= 2) {
        triggerConfetti();
      }
    } catch (e) {
      console.error("Lỗi chấm bài:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ink-muted">
        <div className="animate-spin w-10 h-10 border-4 border-celadon border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang khởi tạo bài kiểm tra xếp lớp đa cấp độ (HSK 1 - 4)...
      </div>
    );
  }

  // ==================== KẾT QUẢ ĐÁNH GIÁ TRÌNH ĐỘ (MODE 2) ====================
  if (evalResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-parchment-300 shadow-card text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <MascotWithBubble
              action={evalResult.verified_level >= 1 ? "celebrate" : "sad"}
              tone={evalResult.verified_level >= 1 ? "celadon" : "gilt"}
              size="md"
              message={
                evalResult.verified_level >= 1
                  ? `Tuyệt vời! Trình độ của bạn là HSK ${evalResult.verified_level}!`
                  : "Đừng lo nhé! Bắt đầu từ HSK 0 cùng Han Han nào!"
              }
            />
            <div className="space-y-2 sm:text-left">
              <span className="inline-block px-3.5 py-1 rounded-full bg-celadon-100 text-celadon-dark text-xs font-black uppercase tracking-wider border border-celadon-200">
                Kết quả đánh giá trình độ
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-ink">
                Trình độ xác nhận:{" "}
                <span className="text-celadon-dark">
                  {evalResult.verified_level === 0
                    ? "Mới bắt đầu (HSK 0)"
                    : `HSK ${evalResult.verified_level}`}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-ink-muted max-w-lg leading-relaxed">
                {evalResult.message}
              </p>
            </div>
          </div>

          {/* Điểm số theo từng cấp độ (Quy tắc 2/3) */}
          <div className="max-w-xl mx-auto bg-parchment-50 p-5 rounded-2xl border border-parchment-200 text-left space-y-3">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Kết quả chi tiết từng cấp độ (Yêu cầu đúng ≥ 2/3 số câu):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(evalResult.score_by_level).map(([lvl, score]) => {
                const [c, t] = score.split("/").map(Number);
                const passed = c / t >= 2 / 3;
                return (
                  <div
                    key={lvl}
                    className={`p-3 rounded-xl border text-center ${
                      passed
                        ? "bg-celadon-50 border-celadon-300 text-celadon-dark font-bold"
                        : "bg-white border-parchment-300 text-ink-muted"
                    }`}
                  >
                    <div className="text-xs">HSK {lvl}</div>
                    <div className="text-lg font-black">{score}</div>
                    <div className="text-[10px] mt-0.5 font-bold">
                      {passed ? "✓ Đạt" : "✗ Chưa đạt"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phân tích Điểm mạnh & Điểm yếu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto text-xs sm:text-sm">
            {/* Strengths */}
            <div className="p-4 bg-celadon-50/60 rounded-2xl border border-celadon-200 space-y-2">
              <div className="font-bold text-celadon-dark flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Điểm mạnh đã xác nhận:</span>
              </div>
              <ul className="space-y-1 text-ink-light">
                {evalResult.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-celadon-dark font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak points */}
            <div className="p-4 bg-vermillion-light/40 rounded-2xl border border-vermillion-soft space-y-2">
              <div className="font-bold text-vermillion-deep flex items-center gap-1.5">
                <AlertTriangle size={16} />
                <span>Lỗ hổng kiến thức cần bồi đắp:</span>
              </div>
              <ul className="space-y-1 text-ink-light">
                {evalResult.weak_points.length > 0 ? (
                  evalResult.weak_points.map((wp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-vermillion-deep font-bold">•</span>
                      <span>{wp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-ink-muted">Chưa ghi nhận điểm yếu lớn nào.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/roadmap"
              className="px-8 py-3.5 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-base shadow-soft hover:shadow-md active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Calendar size={18} />
              <span>Xem Lộ trình học cá nhân hóa ngay</span>
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={initTest}
              className="px-6 py-3.5 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink font-bold text-sm transition-all flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Làm bài kiểm tra lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== BÀI THI XẾP LỚP ĐANG LÀM ====================
  const currentQuestion = quizQuestions[currentIndex];
  const totalQuestions = quizQuestions.length;
  const currentAnswer = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== "" && answers[k] !== null
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Quiz Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Header */}
          <div className="flex items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-3xl border border-parchment-300 shadow-soft">
            <Link
              href="/"
              className="w-10 h-10 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 flex items-center justify-center text-ink-muted hover:text-ink transition-all"
              title="Về trang chủ"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-ink flex items-center gap-1.5 truncate">
                  <Compass size={15} className="text-celadon-dark" />
                  Xếp lớp chuẩn HSK · Câu {currentIndex + 1}/{totalQuestions}
                </span>
                <span className="text-ink-muted shrink-0 ml-2">
                  Đã làm: <strong className="text-celadon-dark">{answeredCount}</strong>/{totalQuestions}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-parchment-200 overflow-hidden">
                <div
                  className="h-full bg-celadon rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((currentIndex + 1) / totalQuestions) * 100)}%` }}
                ></div>
              </div>
            </div>

            <QuizTimer
              initialSeconds={elapsedSeconds}
              timeLimitSeconds={30 * 60}
              onTick={(sec) => setElapsedSeconds(sec)}
              onTimeUp={() => handleSubmit()}
            />

            {/* Mobile palette trigger */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink shadow-sm flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <Compass size={16} className="text-celadon-dark" />
              <span className="hidden sm:inline">Bảng câu</span>
            </button>
          </div>

          {/* Question Renderer */}
          <QuizRenderer
            question={currentQuestion}
            value={currentAnswer}
            onChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
          />

          {/* Action buttons */}
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
                className="px-6 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-soft hover:shadow-md transition-all"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-base shadow-soft hover:shadow-md animate-pulse"
              >
                {isSubmitting ? "Đang chấm điểm..." : "NỘP BÀI XẾP LỚP"}
              </button>
            )}
          </div>
        </div>

        {/* Right Sticky Palette Sidebar */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <QuestionPalette
            questions={quizQuestions}
            answers={answers}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            mode="sidebar"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {/* Mobile Palette Modal */}
      <QuestionPalette
        questions={quizQuestions}
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
