"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { repository } from "@/services";
import { AudioButton } from "@/features/quiz";
import { shuffleArray } from "@/lib/shuffle";
import type { Topic } from "@/types";
import type { VocabularyItem } from "@/data/mock/vocabulary";

interface MiniQuestion {
  target: VocabularyItem;
  choices: VocabularyItem[];
}

type LearningStep = "cards" | "quiz" | "complete" | "retry";

export default function LearnTopicPage() {
  const params = useParams();
  const topicId = (params.topicId as string) || "";
  const [topic, setTopic] = useState<Topic | null>(null);
  const [cards, setCards] = useState<VocabularyItem[]>([]);
  const [practiceHref, setPracticeHref] = useState("/");
  const [step, setStep] = useState<LearningStep>("cards");
  const [cardIndex, setCardIndex] = useState(0);
  const [quiz, setQuiz] = useState<MiniQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [loadedTopic, words, exams, completed] = await Promise.all([
          repository.getTopic(topicId),
          repository.getVocabularyForTopic(topicId),
          repository.getExams(topicId),
          repository.getCompletedLessons(),
        ]);
        if (!active) return;
        setTopic(loadedTopic);
        setCards(words);
        setPracticeHref(exams[0] ? `/practice/${exams[0].id}` : "/");
        if (completed.includes(topicId)) setStep("complete");
        if (!loadedTopic) setError("Không tìm thấy chủ đề này.");
        else if (words.length < 5) setError("Chủ đề chưa đủ từ vựng để tạo bài học và mini-quiz.");
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Không tải được bài học từ vựng.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [topicId]);

  const currentCard = cards[cardIndex];
  const currentQuestion = quiz[quizIndex];

  const beginQuiz = () => {
    const questions = shuffleArray(cards).slice(0, 5).map((target) => {
      const distractors = shuffleArray(cards.filter((word) => word.id !== target.id)).slice(0, 3);
      return { target, choices: shuffleArray([target, ...distractors]) };
    });
    setQuiz(questions);
    setQuizIndex(0);
    setScore(0);
    setSelectedId(null);
    setChecked(false);
    setStep("quiz");
  };

  const handleCheck = () => {
    if (!currentQuestion || !selectedId) return;
    setChecked(true);
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion || !checked || saving) return;
    const isCorrect = selectedId === currentQuestion.target.id;
    const nextScore = score + (isCorrect ? 1 : 0);
    setScore(nextScore);

    if (quizIndex < quiz.length - 1) {
      setQuizIndex((index) => index + 1);
      setSelectedId(null);
      setChecked(false);
      return;
    }

    if (nextScore < 4) {
      setStep("retry");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await repository.completeTopicLesson(topicId, cards.map((card) => card.id));
      setStep("complete");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được tiến độ bài học.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-ink-muted">Đang tải bài học từ vựng...</div>;
  }

  if (!topic || cards.length < 5) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <XCircle size={36} className="mx-auto text-vermillion" />
        <h1 className="text-2xl font-black text-ink">Chưa thể mở bài học</h1>
        <p role="alert" className="text-sm text-vermillion-deep">{error || "Dữ liệu bài học chưa sẵn sàng."}</p>
        <Link href="/" className="inline-flex px-5 py-2.5 rounded-xl bg-celadon text-white font-bold">Về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <Link href={`/levels/${topic.levelId}`} className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted hover:text-ink">
        <ArrowLeft size={17} /> Về danh sách chủ đề
      </Link>

      <header className="rounded-3xl bg-gradient-to-br from-celadon-50 to-white border border-celadon-200 p-6 sm:p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-celadon-100 border border-celadon-200 text-celadon-dark flex items-center justify-center text-2xl">{topic.icon}</span>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-celadon-dark">Học từ vựng · HSK {cards[0].hskLevel}–{cards[cards.length - 1].hskLevel}</div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink">{topic.name}</h1>
          </div>
        </div>
        <div className="mt-5 h-2 rounded-full bg-celadon-100 overflow-hidden"><div className="h-full bg-celadon transition-all" style={{ width: `${step === "cards" ? ((cardIndex + 1) / cards.length) * 100 : step === "quiz" ? ((quizIndex + 1) / 5) * 100 : 100}%` }} /></div>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-vermillion-soft bg-vermillion-light p-4 text-sm text-vermillion-deep">{error}</div>}

      {step === "cards" && currentCard && (
        <section className="rounded-3xl border border-parchment-300 bg-white p-5 sm:p-8 shadow-soft space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <span>Thẻ {cardIndex + 1} / {cards.length}</span>
            <span>HSK {currentCard.hskLevel} · {currentCard.partOfSpeech}</span>
          </div>
          <article className="text-center space-y-3 py-2">
            <div className="font-chinese text-5xl sm:text-6xl font-black text-ink">{currentCard.hanzi}</div>
            <div className="text-lg font-bold text-celadon-dark">{currentCard.pinyin}</div>
            <div className="flex justify-center"><AudioButton text={currentCard.hanzi} /></div>
            <div className="text-lg font-bold text-ink">{currentCard.vietnamese}</div>
            <div className="text-sm text-ink-muted">Âm Hán Việt: <strong className="text-ink">{currentCard.hanViet}</strong></div>
            {(currentCard.measureWord || currentCard.radical) && (
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {currentCard.measureWord && <span className="px-3 py-1 rounded-full bg-parchment-100 border border-parchment-200">Lượng từ: {currentCard.measureWord}</span>}
                {currentCard.radical && <span className="px-3 py-1 rounded-full bg-parchment-100 border border-parchment-200">Bộ thủ: {currentCard.radical}</span>}
              </div>
            )}
            {currentCard.needsReview && <p className="text-[11px] text-amber-700">Nội dung đang chờ người bản ngữ duyệt.</p>}
          </article>
          <div className="rounded-2xl bg-parchment-50 border border-parchment-200 p-4 space-y-2">
            <div className="font-chinese text-xl font-bold text-ink">{currentCard.exampleZh}</div>
            <div className="text-sm text-celadon-dark">{currentCard.examplePinyin}</div>
            <div className="text-sm text-ink-muted">{currentCard.exampleVn}</div>
            <AudioButton text={currentCard.exampleZh} size="sm" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button type="button" disabled={cardIndex === 0} onClick={() => setCardIndex((index) => index - 1)} className="px-4 py-2.5 rounded-xl border border-parchment-300 font-bold text-sm text-ink disabled:opacity-40">Thẻ trước</button>
            {cardIndex < cards.length - 1 ? (
              <button type="button" onClick={() => setCardIndex((index) => index + 1)} className="px-5 py-2.5 rounded-xl bg-celadon text-white font-bold text-sm inline-flex items-center gap-2">Thẻ tiếp theo <ArrowRight size={16} /></button>
            ) : (
              <button type="button" onClick={beginQuiz} className="px-5 py-2.5 rounded-xl bg-celadon text-white font-bold text-sm inline-flex items-center gap-2"><BookOpen size={16} /> Làm mini-quiz 5 câu</button>
            )}
          </div>
        </section>
      )}

      {step === "quiz" && currentQuestion && (
        <section className="rounded-3xl border border-parchment-300 bg-white p-5 sm:p-8 shadow-soft space-y-5">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-muted">Nhận mặt chữ · Câu {quizIndex + 1} / 5</div>
          <div className="text-center space-y-2">
            <p className="text-sm text-ink-muted">Chọn chữ Hán ứng với nghĩa sau:</p>
            <h2 className="text-xl sm:text-2xl font-black text-ink">{currentQuestion.target.vietnamese}</h2>
            <p className="text-xs text-ink-muted">Âm Hán Việt: {currentQuestion.target.hanViet}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.choices.map((choice) => {
              const isSelected = selectedId === choice.id;
              const isRight = checked && choice.id === currentQuestion.target.id;
              const isWrongSelected = checked && isSelected && !isRight;
              return (
                <button key={choice.id} type="button" disabled={checked} onClick={() => setSelectedId(choice.id)} className={`min-h-20 rounded-2xl border-2 p-4 font-chinese text-2xl font-bold transition-colors ${isRight ? "border-celadon bg-celadon-50 text-celadon-dark" : isWrongSelected ? "border-vermillion bg-vermillion-light text-vermillion-deep" : isSelected ? "border-gilt bg-gilt-light text-gilt-deep" : "border-parchment-300 bg-white text-ink hover:border-celadon-300"}`}>
                  {choice.hanzi}
                </button>
              );
            })}
          </div>
          {checked && <p className={`text-sm font-bold ${selectedId === currentQuestion.target.id ? "text-celadon-dark" : "text-vermillion-deep"}`}>{selectedId === currentQuestion.target.id ? "Chính xác!" : `Đáp án: ${currentQuestion.target.hanzi} · ${currentQuestion.target.pinyin}`}</p>}
          <div className="flex justify-end">
            {!checked ? (
              <button type="button" disabled={!selectedId} onClick={handleCheck} className="px-6 py-3 rounded-xl bg-celadon text-white font-bold disabled:opacity-40">Kiểm tra</button>
            ) : (
              <button type="button" disabled={saving} onClick={handleNextQuestion} className="px-6 py-3 rounded-xl bg-celadon text-white font-bold inline-flex items-center gap-2 disabled:opacity-50">{saving ? "Đang lưu..." : quizIndex === 4 ? "Hoàn tất mini-quiz" : "Câu tiếp theo"}<ArrowRight size={16} /></button>
            )}
          </div>
        </section>
      )}

      {step === "retry" && (
        <section className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-soft space-y-4">
          <RotateCcw size={36} className="mx-auto text-amber-600" />
          <h2 className="text-xl font-black text-ink">Bạn đạt {score}/5 — cần ít nhất 4 câu đúng</h2>
          <p className="text-sm text-ink-muted">Xem lại các thẻ rồi thử mini-quiz lần nữa nhé.</p>
          <button type="button" onClick={() => { setCardIndex(0); setStep("cards"); }} className="px-5 py-2.5 rounded-xl border border-parchment-300 font-bold">Xem lại thẻ</button>
          <button type="button" onClick={beginQuiz} className="ml-2 px-5 py-2.5 rounded-xl bg-celadon text-white font-bold">Thử lại</button>
        </section>
      )}

      {step === "complete" && (
        <section className="rounded-3xl border border-celadon-200 bg-white p-8 text-center shadow-soft space-y-4">
          <CheckCircle2 size={40} className="mx-auto text-celadon" />
          <h2 className="text-xl sm:text-2xl font-black text-ink">Bài học đã hoàn thành!</h2>
          <p className="text-sm text-ink-muted">Đã thêm {cards.length} từ vào lịch ôn SRS. Bây giờ bạn có thể luyện đề của chủ đề này.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/practice/generated-vocab-${topic.id}`} className="px-5 py-2.5 rounded-xl border border-celadon-300 font-bold inline-flex items-center gap-2">Luyện câu từ vựng tự sinh <ArrowRight size={16} /></Link>
            <button type="button" onClick={() => { setCardIndex(0); setStep("cards"); }} className="px-5 py-2.5 rounded-xl border border-parchment-300 font-bold">Xem lại thẻ</button>
            <Link href={practiceHref} className="px-5 py-2.5 rounded-xl bg-celadon text-white font-bold inline-flex items-center gap-2">Vào luyện đề <ArrowRight size={16} /></Link>
          </div>
        </section>
      )}
    </main>
  );
}
