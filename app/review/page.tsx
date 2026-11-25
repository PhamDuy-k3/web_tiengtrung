"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { repository } from "@/services";
import { AudioButton, QuizRenderer } from "@/features/quiz";
import { FloatingMascot } from "@/components/mascot/FloatingMascot";
import { gradeQuestion } from "@/lib/grading";
import type { AnswerValue, GradeResult } from "@/types";
import type { SrsQuality, SrsReviewItem } from "@/types/srs";

const QUALITY_CHOICES: { value: SrsQuality; label: string; hint: string }[] = [
  { value: 1, label: "Quên", hint: "Ôn lại ngày mai" },
  { value: 3, label: "Khó nhớ", hint: "Khoảng ôn ngắn" },
  { value: 5, label: "Nhớ rõ", hint: "Khoảng ôn dài hơn" },
];

export default function ReviewPage() {
  const [items, setItems] = useState<SrsReviewItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState<AnswerValue | undefined>();
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [returnTo, setReturnTo] = useState("/");
  const [showThinkMascot, setShowThinkMascot] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get("topicId");
    const requestedReturnTo = params.get("returnTo") || "/";
    const safeReturnTo = requestedReturnTo.startsWith("/levels/") ? requestedReturnTo : "/";
    setReturnTo(safeReturnTo);
    repository.getDueSrsItems()
      .then((dueItems) => {
        if (active) {
          const filteredItems = topicId
            ? dueItems.filter((item) => item.kind === "question"
              ? item.question.topicId === topicId
              : item.vocabulary.topicId === topicId)
            : dueItems;
          setItems(filteredItems);
          setTotalItems(filteredItems.length);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không tải được danh sách ôn tập.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadAttempt]);

  const current = items[0];
  const currentItemId = current?.card.itemId;

  useEffect(() => {
    setShowThinkMascot(false);
    if (!currentItemId || revealed) return;
    const timer = window.setTimeout(() => {
      setShowThinkMascot(true);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [currentItemId, revealed]);

  const handleCheckAnswer = () => {
    if (!current || current.kind !== "question") return;
    const result = gradeQuestion(current.question, answer);
    setGrade(result);
    setRevealed(true);
  };

  const handleRate = async (quality: SrsQuality) => {
    if (!current || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await repository.reviewSrsItem(current.card.itemId, quality);
      if (!updated) throw new Error("Không tìm thấy thẻ ôn tập này.");
      setItems((existing) => existing.slice(1));
      setRevealed(false);
      setAnswer(undefined);
      setGrade(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được kết quả ôn tập.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-ink-muted">Đang tải mục đến hạn...</div>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <Link href={returnTo} className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted hover:text-ink">
        <ArrowLeft size={17} /> Về trang chủ
      </Link>

      <header className="rounded-3xl bg-gradient-to-br from-celadon-50 to-white border border-celadon-200 p-6 sm:p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-celadon-100 border border-celadon-200 text-celadon-dark flex items-center justify-center">
            <RotateCcw size={23} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink">Phiên ôn tập hôm nay</h1>
            <p className="text-sm text-ink-muted">Ôn từ vựng và câu hỏi theo khoảng cách lặp lại.</p>
          </div>
        </div>
        {items.length > 0 && (
          <p className="mt-5 text-sm font-bold text-celadon-dark">Mục {totalItems - items.length + 1} / {totalItems}</p>
        )}
      </header>

      {error && <div role="alert" className="rounded-2xl border border-vermillion-soft bg-vermillion-light p-4 text-sm text-vermillion-deep">{error}</div>}

      {!current ? (
        error ? (
          <section className="rounded-3xl border border-vermillion-soft bg-white p-8 text-center shadow-soft space-y-3">
            <XCircle size={38} className="mx-auto text-vermillion" />
            <h2 className="text-xl font-black text-ink">Không tải được phiên ôn</h2>
            <button type="button" onClick={() => { setError(null); setLoading(true); setLoadAttempt((value) => value + 1); }} className="inline-flex mt-2 px-5 py-2.5 rounded-xl bg-celadon text-white font-bold">Thử tải lại</button>
          </section>
        ) : (
          <section className="rounded-3xl border border-parchment-300 bg-white p-8 text-center shadow-soft space-y-3">
            <CheckCircle2 size={38} className="mx-auto text-celadon" />
            <h2 className="text-xl font-black text-ink">Bạn đã hoàn tất phần ôn hôm nay</h2>
            <p className="text-sm text-ink-muted">Khi có mục đến hạn, chúng sẽ xuất hiện ở đây.</p>
            <Link href={returnTo} className="inline-flex mt-2 px-5 py-2.5 rounded-xl bg-celadon text-white font-bold">Quay lại lộ trình</Link>
          </section>
        )
      ) : (
        <section className="rounded-3xl border border-parchment-300 bg-white p-5 sm:p-8 shadow-soft space-y-5">
          {current.kind === "vocabulary" ? (
            <>
              <div className="text-center space-y-3 py-4">
                <div className="text-xs font-bold uppercase tracking-widest text-ink-muted">Từ vựng · HSK {current.vocabulary.hskLevel}</div>
                <div className="font-chinese text-5xl sm:text-6xl font-black text-ink">{current.vocabulary.hanzi}</div>
                <div className="flex justify-center"><AudioButton text={current.vocabulary.hanzi} /></div>
                {!revealed ? (
                  <button type="button" onClick={() => setRevealed(true)} className="mt-2 px-6 py-3 rounded-2xl bg-celadon text-white font-bold">Hiện đáp án</button>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="text-lg font-bold text-celadon-dark">{current.vocabulary.pinyin}</div>
                    <div className="text-base text-ink">{current.vocabulary.vietnamese}</div>
                    <div className="border-t border-parchment-200 pt-3 space-y-1">
                      <div className="font-chinese text-xl text-ink">{current.vocabulary.exampleZh}</div>
                      <div className="text-sm text-ink-muted">{current.vocabulary.exampleVn}</div>
                    </div>
                    <div className="flex justify-center"><AudioButton text={current.vocabulary.exampleZh} /></div>
                  </div>
                )}
              </div>
              {revealed && <RatingButtons choices={QUALITY_CHOICES} saving={saving} onRate={handleRate} />}
            </>
          ) : (
            <>
              <div className="text-xs font-bold uppercase tracking-widest text-ink-muted">Câu hỏi đã sai · HSK {current.question.hskLevel}</div>
              <QuizRenderer question={current.question} value={answer} onChange={setAnswer} disabled={grade !== null} />
              {grade ? (
                <div className={`rounded-2xl p-4 border ${grade.correct ? "bg-celadon-50 border-celadon-200" : "bg-vermillion-light border-vermillion-soft"}`}>
                  <div className={`flex items-center gap-2 font-bold ${grade.correct ? "text-celadon-dark" : "text-vermillion-deep"}`}>
                    {grade.correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {grade.correct ? "Đúng rồi" : "Chưa đúng"}
                  </div>
                  <p className="mt-2 text-sm text-ink-light">{grade.feedback}</p>
                </div>
              ) : (
                <button type="button" disabled={answer === undefined} onClick={handleCheckAnswer} className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-celadon text-white font-bold disabled:opacity-40">Kiểm tra đáp án</button>
              )}
              {grade && (grade.correct ? (
                <RatingButtons choices={[
                  { value: 3, label: "Khó nhớ", hint: "Ôn sớm" },
                  { value: 4, label: "Nhớ được", hint: "Theo lịch" },
                  { value: 5, label: "Nhớ rõ", hint: "Ôn muộn hơn" },
                ]} saving={saving} onRate={handleRate} />
              ) : (
                <button type="button" disabled={saving} onClick={() => handleRate(1)} className="w-full px-5 py-3 rounded-2xl bg-vermillion text-white font-bold disabled:opacity-50">{saving ? "Đang lưu..." : "Đã quên · ôn lại ngày mai"}</button>
              ))}
            </>
          )}
        </section>
      )}

      {showThinkMascot && current && !revealed && (
        <FloatingMascot
          action="think"
          tone="gilt"
          title="Nhớ lại thử xem nào… 🤔"
          message="Cố hồi tưởng nghĩa và thanh điệu trước khi bấm xem đáp án nhé!"
          onClose={() => setShowThinkMascot(false)}
          bottomOffsetClass="bottom-20 md:bottom-6"
        />
      )}
    </main>
  );
}

function RatingButtons({
  choices,
  saving,
  onRate,
}: {
  choices: { value: SrsQuality; label: string; hint: string }[];
  saving: boolean;
  onRate: (quality: SrsQuality) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {choices.map((choice) => (
        <button key={choice.value} type="button" disabled={saving} onClick={() => onRate(choice.value)} className="rounded-2xl border-2 border-parchment-300 hover:border-celadon-300 bg-parchment-50 p-4 text-left transition-colors disabled:opacity-50">
          <span className="block font-black text-ink">{choice.label}</span>
          <span className="block mt-1 text-xs text-ink-muted">{saving ? "Đang lưu..." : choice.hint}</span>
        </button>
      ))}
    </div>
  );
}
