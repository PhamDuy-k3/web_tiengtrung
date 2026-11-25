"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { repository } from "@/services";
import { useUserStore } from "@/store/useUserStore";
import { AudioButton, QuizRenderer } from "@/features/quiz";
import { MascotWithBubble } from "@/components/mascot/MascotWithBubble";
import { triggerConfetti } from "@/components/ui/Confetti";
import { gradeQuestion } from "@/lib/grading";
import { soundService } from "@/lib/sound";
import {
  buildRoadmapLessonPlan,
  getRoadmapProgress,
  loadActiveRoadmapContext,
  markRoadmapLessonCompleted,
  type RoadmapLessonPlan,
} from "@/lib/roadmapStudy";
import type { AnswerValue, ExamAttempt, QuestionResult } from "@/types";

type LessonTab = "vocab" | "grammar" | "practice";

const LESSON_TYPE_LABEL: Record<string, { text: string; cls: string }> = {
  new: { text: "Bài mới", cls: "bg-celadon-100 text-celadon-dark border-celadon-200" },
  review: { text: "Ôn tập", cls: "bg-gilt-light text-gilt-deep border-gilt-soft" },
  test: { text: "Kiểm tra", cls: "bg-vermillion-light text-vermillion-deep border-vermillion-soft" },
  remedial: { text: "Củng cố điểm yếu", cls: "bg-purple-100 text-purple-700 border-purple-200" },
};

export default function RoadmapLessonPage() {
  const params = useParams();
  const lessonId = (params.lessonId as string) || "";
  const { loadProfile } = useUserStore();

  const [plan, setPlan] = useState<RoadmapLessonPlan | null>(null);
  const [roadmapKey, setRoadmapKey] = useState("preview");
  const [prevBestScore, setPrevBestScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<LessonTab>("vocab");
  const [cardIndex, setCardIndex] = useState(0);

  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [checkedMap, setCheckedMap] = useState<Record<string, { correct: boolean; score: number; feedback: string }>>({});
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<ExamAttempt | null>(null);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const ctx = loadActiveRoadmapContext();
        const mistakes = await repository.getMistakes();
        const built = buildRoadmapLessonPlan(ctx.roadmap, lessonId, mistakes);
        const prog = getRoadmapProgress(ctx.roadmapKey);

        if (!active) return;
        setRoadmapKey(ctx.roadmapKey);
        setPlan(built);
        setPrevBestScore(
          prog.completedLessonIds.includes(lessonId)
            ? (prog.scores[lessonId] ?? 100)
            : null
        );
        setTab(built?.lesson.type === "test" ? "practice" : "vocab");
        setCardIndex(0);
        setQuizIndex(0);
        setAnswers({});
        setCheckedMap({});
        setAttemptResult(null);
        setStartedAt(Date.now());
      } catch (e) {
        console.error("Lỗi tải bài học lộ trình:", e);
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => { active = false; };
  }, [lessonId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ink-muted">
        <div className="animate-spin w-10 h-10 border-4 border-celadon border-t-transparent rounded-full mx-auto mb-3" />
        Đang chuẩn bị nội dung bài học theo lộ trình...
      </div>
    );
  }

  if (!plan) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <XCircle size={40} className="mx-auto text-vermillion" />
        <h1 className="text-2xl font-black text-ink">Không tìm thấy bài học trong lộ trình</h1>
        <p className="text-sm text-ink-light">
          Bài học này có thể thuộc một lộ trình cũ. Hãy quay lại trang Lộ trình để mở bài học hiện tại.
        </p>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-celadon text-white font-bold text-sm"
        >
          <ArrowLeft size={16} />
          <span>Quay lại lộ trình</span>
        </Link>
      </main>
    );
  }

  const { week, lesson, prevLesson, nextLesson, studyCards, grammarGuides, practiceQuestions } = plan;
  const typeMeta = LESSON_TYPE_LABEL[lesson.type] ?? LESSON_TYPE_LABEL.new;
  const currentCard = studyCards[cardIndex];
  const currentQuestion = practiceQuestions[quizIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentChecked = currentQuestion ? checkedMap[currentQuestion.id] : undefined;

  const isAnswerFilled = (val: AnswerValue | undefined) =>
    val !== undefined &&
    val !== "" &&
    val !== null &&
    (!Array.isArray(val) || val.length > 0) &&
    (typeof val !== "object" || Object.keys(val).length > 0);

  const handleCheckCurrent = () => {
    if (!currentQuestion || !isAnswerFilled(currentAnswer)) return;
    const grade = gradeQuestion(currentQuestion, currentAnswer);
    if (grade.correct) soundService.playSuccess();
    else soundService.playError();

    setCheckedMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        correct: grade.correct,
        score: grade.score,
        feedback: grade.feedback,
      },
    }));
  };

  const handleFinishLessonPractice = async () => {
    if (isSubmitting || practiceQuestions.length === 0) return;
    setIsSubmitting(true);
    try {
      const results: Record<string, QuestionResult> = {};
      for (const q of practiceQuestions) {
        const uAns = answers[q.id];
        const grade = gradeQuestion(q, uAns);
        results[q.id] = {
          userAnswer: uAns,
          isCorrect: grade.correct,
          score: grade.score,
          matchedAnswer: grade.matchedAnswer,
          feedback: grade.feedback,
          question: q,
        };
      }

      const durationSeconds = Math.max(5, Math.round((Date.now() - startedAt) / 1000));
      const attempt = await repository.submitAttempt({
        examId: `roadmap-lesson-${lesson.id}`,
        levelId: plan.levelId,
        examTitle: `Lộ trình Tuần ${week.week}: ${lesson.topic}`,
        answers: results,
        durationSeconds,
      });

      for (const card of studyCards) {
        if (card.vocabularyId) {
          await repository.addVocabularyToSrs(card.vocabularyId);
        }
      }

      markRoadmapLessonCompleted(roadmapKey, lesson.id, attempt.score);
      setPrevBestScore((prev) => (prev === null ? attempt.score : Math.max(prev, attempt.score)));
      await loadProfile();
      setAttemptResult(attempt);

      if (attempt.score >= 60) {
        triggerConfetti();
      }
    } catch (e) {
      console.error("Lỗi hoàn thành bài học lộ trình:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryPractice = () => {
    setAnswers({});
    setCheckedMap({});
    setQuizIndex(0);
    setAttemptResult(null);
    setStartedAt(Date.now());
    setTab("practice");
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top back bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-light hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quay lại lộ trình</span>
        </Link>

        {prevBestScore !== null && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-celadon-100 text-celadon-dark border border-celadon-200 text-xs font-bold">
            <CheckCircle2 size={14} />
            Đã hoàn thành · Điểm cao nhất {prevBestScore}%
          </span>
        )}
      </div>

      {/* Header card */}
      <header className="rounded-3xl bg-white border border-parchment-300 shadow-soft p-5 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-ink text-white">
              TUẦN {week.week}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeMeta.cls}`}>
              {typeMeta.text}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-parchment-100 text-ink border border-parchment-300">
              HSK {plan.hskLevel}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-light">
            <Clock size={14} />
            {lesson.estimated_minutes} phút
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-ink leading-snug">
          {lesson.topic}
        </h1>

        <p className="text-xs sm:text-sm text-ink-light">
          Mục tiêu tuần: {week.goal}
        </p>

        {/* 3-Step Switcher */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={() => { setAttemptResult(null); setTab("vocab"); }}
            className={`px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all ${
              tab === "vocab" && !attemptResult
                ? "bg-celadon text-white border-celadon shadow-soft"
                : "bg-parchment-50 text-ink-light border-parchment-300 hover:bg-parchment-100"
            }`}
          >
            <Layers size={15} className="shrink-0" />
            <span className="truncate">1. Từ vựng ({studyCards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setAttemptResult(null); setTab("grammar"); }}
            className={`px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all ${
              tab === "grammar" && !attemptResult
                ? "bg-celadon text-white border-celadon shadow-soft"
                : "bg-parchment-50 text-ink-light border-parchment-300 hover:bg-parchment-100"
            }`}
          >
            <BookOpen size={15} className="shrink-0" />
            <span className="truncate">2. Ngữ pháp ({grammarGuides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("practice")}
            className={`px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all ${
              tab === "practice" || attemptResult
                ? "bg-celadon text-white border-celadon shadow-soft"
                : "bg-parchment-50 text-ink-light border-parchment-300 hover:bg-parchment-100"
            }`}
          >
            <GraduationCap size={15} className="shrink-0" />
            <span className="truncate">3. Thực hành ({practiceQuestions.length})</span>
          </button>
        </div>
      </header>

      {/* Completion screen */}
      {attemptResult ? (
        <section className="rounded-3xl bg-white border-2 border-celadon-200 p-6 sm:p-10 shadow-card text-center space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-celadon-100 text-celadon-dark border border-celadon-200">
              <Sparkles size={14} />
              Hoàn thành bài học lộ trình
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-ink">
              {attemptResult.score >= 80
                ? "Xuất sắc! Bạn đã nắm chắc bài học"
                : attemptResult.score >= 60
                ? "Tốt lắm! Đã hoàn thành mục tiêu bài học"
                : "Đã lưu lượt ôn! Bạn có thể luyện lại để đạt điểm cao hơn"}
            </h2>
            <p className="text-sm text-ink-light">
              Từ vựng trọng tâm của bài đã được thêm vào lịch ôn SRS hằng ngày của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center justify-items-center gap-4 sm:gap-6">
            <div className="sm:justify-self-end order-2 sm:order-1">
              <MascotWithBubble
                action={attemptResult.score >= 60 ? "celebrate" : "sad"}
                tone={attemptResult.score >= 60 ? "celadon" : "vermillion"}
                size="md"
                message={
                  attemptResult.score >= 60
                    ? "Tiếp tục giữ nhịp lộ trình nhé!"
                    : "Thử ôn lại thẻ từ và làm lại thêm một lượt nào!"
                }
              />
            </div>
            <div className="order-1 sm:order-2 inline-flex items-center gap-6 px-7 py-4 rounded-2xl bg-parchment-50 border border-parchment-300">
              <div>
                <div className="text-xs text-ink-light">Điểm số</div>
                <div className="text-3xl font-black text-celadon-dark">{attemptResult.score}%</div>
              </div>
              <div className="w-[1px] h-8 bg-parchment-300" />
              <div>
                <div className="text-xs text-ink-light">Đúng/Tổng</div>
                <div className="text-xl font-black text-ink">
                  {attemptResult.correctCount}/{attemptResult.totalQuestions}
                </div>
              </div>
            </div>
            <div className="hidden sm:block sm:order-3" aria-hidden="true" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {nextLesson && (
              <Link
                href={`/roadmap/lesson/${nextLesson.id}`}
                className="px-6 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm inline-flex items-center gap-2 shadow-soft transition-all"
              >
                <span>Bài tiếp theo</span>
                <ArrowRight size={16} />
              </Link>
            )}
            <button
              type="button"
              onClick={handleRetryPractice}
              className="px-5 py-3 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink font-bold text-sm inline-flex items-center gap-2 transition-all"
            >
              <RotateCcw size={16} />
              <span>Làm lại bài tập</span>
            </button>
            <Link
              href="/roadmap"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-parchment-50 border border-parchment-300 text-ink font-bold text-sm"
            >
              Quay lại lộ trình
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* STEP 1: FLASHCARDS */}
          {tab === "vocab" && currentCard && (
            <section className="rounded-3xl border border-parchment-300 bg-white p-5 sm:p-8 shadow-soft space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-ink-light">
                <span>Thẻ {cardIndex + 1} / {studyCards.length}</span>
                <span>{currentCard.partOfSpeech}</span>
              </div>

              <div className="h-2 rounded-full bg-parchment-200 overflow-hidden">
                <div
                  className="h-full bg-celadon transition-all duration-300"
                  style={{ width: `${Math.round(((cardIndex + 1) / studyCards.length) * 100)}%` }}
                />
              </div>

              <article className="text-center space-y-3 py-2">
                <div className="font-chinese text-5xl sm:text-6xl font-black text-ink">
                  {currentCard.hanzi}
                </div>
                <div className="text-lg font-bold text-celadon-dark">{currentCard.pinyin}</div>
                <div className="flex justify-center">
                  <AudioButton text={currentCard.hanzi} />
                </div>
                <div className="text-lg font-bold text-ink">{currentCard.vietnamese}</div>
                {currentCard.hanViet && (
                  <div className="text-sm text-ink-light">
                    Âm Hán Việt: <strong className="text-ink">{currentCard.hanViet}</strong>
                  </div>
                )}
                {currentCard.tip && (
                  <p className="max-w-lg mx-auto text-xs text-gilt-deep bg-gilt-light border border-gilt-soft rounded-xl px-4 py-2.5">
                    💡 {currentCard.tip}
                  </p>
                )}
              </article>

              <div className="rounded-2xl bg-parchment-50 border border-parchment-200 p-4 space-y-1.5">
                <div className="font-chinese text-xl font-bold text-ink">{currentCard.exampleZh}</div>
                <div className="text-sm text-celadon-dark font-semibold">{currentCard.examplePinyin}</div>
                <div className="text-sm text-ink-light">{currentCard.exampleVn}</div>
                <div className="pt-1">
                  <AudioButton text={currentCard.exampleZh} size="sm" />
                </div>
              </div>

              {/* Quick card selector pills */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {studyCards.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCardIndex(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all font-chinese ${
                      idx === cardIndex
                        ? "bg-celadon-100 text-celadon-dark border-celadon"
                        : "bg-parchment-50 text-ink-light border-parchment-200 hover:border-parchment-400"
                    }`}
                  >
                    {c.hanzi}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={cardIndex === 0}
                  onClick={() => setCardIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2.5 rounded-xl border border-parchment-300 font-bold text-sm text-ink disabled:opacity-40"
                >
                  Thẻ trước
                </button>
                {cardIndex < studyCards.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCardIndex((i) => i + 1)}
                    className="px-5 py-2.5 rounded-xl bg-celadon text-white font-bold text-sm inline-flex items-center gap-2"
                  >
                    <span>Thẻ tiếp theo</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab("grammar")}
                    className="px-5 py-2.5 rounded-xl bg-celadon text-white font-bold text-sm inline-flex items-center gap-2"
                  >
                    <span>Sang phần Ngữ pháp</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </section>
          )}

          {/* STEP 2: GRAMMAR */}
          {tab === "grammar" && (
            <section className="space-y-4">
              {grammarGuides.map((guide) => (
                <article
                  key={guide.id}
                  className="rounded-3xl border border-parchment-300 bg-white p-5 sm:p-7 shadow-soft space-y-4"
                >
                  <div className="flex items-center gap-2 text-celadon-dark text-xs font-bold uppercase tracking-wider">
                    <BookOpen size={15} />
                    <span>Điểm ngữ pháp trọng tâm</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-ink">{guide.title}</h2>
                  {guide.structure && (
                    <div className="rounded-xl bg-parchment-100 border border-parchment-200 px-4 py-3 font-mono text-sm sm:text-base font-bold text-ink">
                      {guide.structure}
                    </div>
                  )}
                  <p className="text-sm text-ink-light leading-relaxed">{guide.explanation}</p>

                  {guide.examples.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-ink-light">
                        Ví dụ minh họa
                      </div>
                      {guide.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="rounded-2xl bg-parchment-50 border border-parchment-200 p-4 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="font-chinese text-lg font-bold text-ink">{ex.chinese}</div>
                            {ex.pinyin && (
                              <div className="text-xs font-semibold text-celadon-dark">{ex.pinyin}</div>
                            )}
                            <div className="text-xs sm:text-sm text-ink-light">{ex.vietnamese}</div>
                          </div>
                          <AudioButton text={ex.chinese} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}

                  {guide.commonMistakes && guide.commonMistakes.length > 0 && (
                    <div className="rounded-2xl bg-vermillion-light border border-vermillion-soft p-4 space-y-1.5">
                      <div className="text-xs font-black text-vermillion-deep">
                        Lưu ý lỗi người Việt hay gặp:
                      </div>
                      <ul className="list-disc pl-5 text-xs sm:text-sm text-vermillion-deep space-y-1">
                        {guide.commonMistakes.map((mistake) => (
                          <li key={mistake}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setTab("vocab")}
                  className="px-4 py-2.5 rounded-xl border border-parchment-300 bg-white font-bold text-sm text-ink"
                >
                  ← Xem lại từ vựng
                </button>
                <button
                  type="button"
                  onClick={() => setTab("practice")}
                  className="px-6 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm inline-flex items-center gap-2 shadow-soft"
                >
                  <span>Bắt đầu thực hành ({practiceQuestions.length} câu)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          )}

          {/* STEP 3: PRACTICE */}
          {tab === "practice" && currentQuestion && (
            <section className="space-y-5">
              <div className="rounded-2xl bg-white border border-parchment-300 p-4 flex items-center justify-between gap-4">
                <div className="text-xs sm:text-sm font-bold text-ink">
                  Câu {quizIndex + 1} / {practiceQuestions.length}
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-parchment-200 overflow-hidden">
                  <div
                    className="h-full bg-celadon transition-all duration-300"
                    style={{ width: `${Math.round(((quizIndex + 1) / practiceQuestions.length) * 100)}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-celadon-dark">
                  Đã kiểm tra: {Object.keys(checkedMap).length}/{practiceQuestions.length}
                </div>
              </div>

              <QuizRenderer
                question={currentQuestion}
                value={currentAnswer}
                disabled={Boolean(currentChecked)}
                onChange={(val) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: val,
                  }))
                }
              />

              {currentChecked && (
                <div
                  className={`rounded-2xl p-4 border text-sm space-y-1.5 ${
                    currentChecked.correct
                      ? "bg-celadon-50 border-celadon-200 text-celadon-dark"
                      : "bg-vermillion-light border-vermillion-soft text-vermillion-deep"
                  }`}
                >
                  <div className="font-black">
                    {currentChecked.correct
                      ? "✓ Chính xác!"
                      : `✗ Chưa chính xác (${currentChecked.score}%)`}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {currentQuestion.explanation || currentChecked.feedback}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={quizIndex === 0}
                  onClick={() => setQuizIndex((i) => Math.max(0, i - 1))}
                  className="px-4 py-2.5 rounded-xl border border-parchment-300 bg-white font-bold text-sm text-ink disabled:opacity-40"
                >
                  Câu trước
                </button>

                <div className="flex items-center gap-2.5">
                  {!currentChecked ? (
                    <button
                      type="button"
                      disabled={!isAnswerFilled(currentAnswer)}
                      onClick={handleCheckCurrent}
                      className="px-6 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm disabled:opacity-40 shadow-soft"
                    >
                      Kiểm tra đáp án
                    </button>
                  ) : quizIndex < practiceQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setQuizIndex((i) => i + 1)}
                      className="px-6 py-3 rounded-2xl bg-vermillion hover:bg-vermillion-deep text-white font-bold text-sm inline-flex items-center gap-1.5 shadow-soft"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFinishLessonPractice}
                      className="px-7 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm shadow-soft disabled:opacity-50"
                    >
                      {isSubmitting ? "Đang lưu kết quả..." : "Hoàn thành bài học"}
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Footer prev/next lesson navigation */}
      {(prevLesson || nextLesson) && (
        <nav className="pt-4 border-t border-parchment-300 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {prevLesson ? (
            <Link
              href={`/roadmap/lesson/${prevLesson.id}`}
              className="inline-flex items-center gap-1.5 font-bold text-ink-light hover:text-ink"
            >
              <ArrowLeft size={15} />
              <span className="line-clamp-1 max-w-[240px]">Bài trước: {prevLesson.topic}</span>
            </Link>
          ) : (
            <span />
          )}

          {nextLesson && (
            <Link
              href={`/roadmap/lesson/${nextLesson.id}`}
              className="inline-flex items-center gap-1.5 font-bold text-celadon-dark hover:underline"
            >
              <span className="line-clamp-1 max-w-[240px]">Bài tiếp: {nextLesson.topic}</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
