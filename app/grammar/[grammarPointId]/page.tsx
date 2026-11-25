"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { repository } from "@/services";
import type { GrammarLesson } from "@/types/grammar";

export default function GrammarLessonPage() {
  const params = useParams();
  const grammarPointId = params.grammarPointId as string;
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    repository.getGrammarLesson(grammarPointId).then((value) => { if (active) setLesson(value); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [grammarPointId]);

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-16 text-center">Äang táº£i ghi chÃº ngá»¯ phÃ¡pâ€¦</main>;
  if (!lesson) return <main className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-center"><h1 className="text-2xl font-black">KhÃ´ng tÃ¬m tháº¥y Ä‘iá»ƒm ngá»¯ phÃ¡p</h1><Link href="/" className="underline">Vá» trang chá»§</Link></main>;

  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
    <Link href="/levels/basic" className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted"><ArrowLeft size={17} /> Quay láº¡i</Link>
    <header className="rounded-3xl border border-celadon-200 bg-white p-6 shadow-soft">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-celadon-dark"><BookOpen size={18} /> Ghi chÃº ngá»¯ phÃ¡p Â· HSK {lesson.hskLevel}</div>
      <h1 className="text-3xl font-black text-ink">{lesson.title}</h1>
      {lesson.needsReview && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">Cần rà soát: {lesson.reviewNote || "Bài học có nội dung chưa đủ nguồn kiểm chứng."}</p>}
      <p className="mt-4 rounded-xl bg-parchment-100 p-4 font-mono text-lg font-bold">{lesson.structure}</p>
      <p className="mt-4 leading-relaxed text-ink-light">{lesson.explanation}</p>
    </header>
    <section className="space-y-3 rounded-3xl border border-parchment-300 bg-white p-6">
      <h2 className="text-xl font-black">VÃ­ dá»¥ tá»« ngÃ¢n hÃ ng cÃ¢u há»i</h2>
      {lesson.examples.length ? lesson.examples.map((example, index) => <article key={example.sourceQuestionId ?? example.sourceUrl ?? index} className="rounded-2xl bg-parchment-50 p-4">
        <p className="font-chinese text-2xl font-bold">{example.chinese}</p>
        {example.pinyin && <p className="mt-1 text-sm font-semibold text-celadon-dark">{example.pinyin}</p>}
        <p className="mt-2 text-sm text-ink-light">{example.vietnamese}</p>
        {example.sourceTitle && example.sourceUrl && <a href={example.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-celadon-dark underline">Nguồn: {example.sourceTitle}</a>}
      </article>) : <p className="text-sm text-amber-800">VÃ­ dá»¥ nguá»“n chÆ°a cÃ³ Ä‘á»§ dá»¯ liá»‡u, cáº§n rÃ  soÃ¡t.</p>}
    </section>
    <section className="rounded-3xl border border-vermillion-soft bg-vermillion-light p-6">
      <h2 className="text-lg font-black text-vermillion-deep">Lá»—i ngÆ°á»i há»c tiáº¿ng Viá»‡t hay gáº·p</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-vermillion-deep">{lesson.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
    </section>
  </main>;
}
