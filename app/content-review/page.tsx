"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BookOpenCheck, ClipboardCheck, RefreshCw } from "lucide-react";
import { repository } from "@/services";
import type { ContentReviewItem, ContentReviewKind } from "@/types/contentReview";

type ReviewFilter = "all" | ContentReviewKind;

const labels: Record<ContentReviewKind, string> = {
  grammar: "Ngữ pháp",
  question: "Câu hỏi",
  vocabulary: "Từ vựng",
};

export default function ContentReviewPage() {
  const [items, setItems] = useState<ContentReviewItem[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    repository.getContentReviewItems()
      .then((result) => { if (active) setItems(result); })
      .catch(() => { if (active) setError("Không tải được hàng đợi. Hãy thử tải lại."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleItems = useMemo(
    () => filter === "all" ? items : items.filter((item) => item.kind === filter),
    [filter, items]
  );

  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
    <header className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
      <div className="flex items-center gap-2 text-sm font-bold text-amber-900"><ClipboardCheck size={18} /> Biên tập nội dung</div>
      <h1 className="mt-2 text-3xl font-black text-ink">Hàng đợi cần rà soát</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-light">Các mục dưới đây đã được đánh dấu needsReview trong dữ liệu. Trang này chỉ tổng hợp và hiển thị nguồn để người biên tập kiểm tra; trạng thái chỉ được gỡ sau khi sửa và xác minh nội dung trong ngân hàng.</p>
      <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-amber-900"><AlertTriangle size={16} /> {items.length} mục đang chờ</p>
    </header>

    <nav aria-label="Lọc loại nội dung" className="flex flex-wrap gap-2">
      {(["all", "grammar", "question", "vocabulary"] as const).map((kind) => {
        const text = kind === "all" ? "Tất cả" : labels[kind];
        return <button key={kind} type="button" onClick={() => setFilter(kind)} aria-pressed={filter === kind} className={`rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${filter === kind ? "border-ink bg-ink text-white" : "border-parchment-300 bg-white text-ink-light hover:bg-parchment-100"}`}>{text}</button>;
      })}
    </nav>

    {loading && <div role="status" className="rounded-2xl border border-parchment-300 bg-white p-8 text-center text-ink-muted">Đang tải hàng đợi…</div>}
    {!loading && error && <div role="alert" className="rounded-2xl border border-vermillion-soft bg-vermillion-light p-5 text-vermillion-deep"><p>{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-3 inline-flex items-center gap-2 font-bold underline"><RefreshCw size={15} /> Tải lại</button></div>}
    {!loading && !error && visibleItems.length === 0 && <div className="rounded-2xl border border-celadon-200 bg-white p-8 text-center"><BookOpenCheck size={30} className="mx-auto text-celadon-dark" /><p className="mt-3 font-bold text-ink">Không có mục nào trong bộ lọc này.</p></div>}

    {!loading && !error && <section className="space-y-3" aria-label="Nội dung cần rà soát">
      {visibleItems.map((item) => <article key={item.id} className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">{labels[item.kind]}{item.hskLevel ? ` · HSK ${item.hskLevel}` : ""}</span>
          <span className="text-xs font-semibold text-ink-muted">{item.source}</span>
        </div>
        <h2 className="mt-3 text-lg font-black text-ink">{item.title}</h2>
        {item.chineseText && <p className="mt-2 font-chinese text-xl font-bold text-ink">{item.chineseText}</p>}
        {item.pinyin && <p className="mt-1 text-sm font-semibold text-celadon-dark">{item.pinyin}</p>}
        {item.vietnamese && <p className="mt-1 text-sm text-ink-light">{item.vietnamese}</p>}
        {item.explanation && <p className="mt-3 whitespace-pre-wrap text-sm text-ink-light">{item.explanation}</p>}
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{item.reason}</p>
        {item.kind === "grammar" && item.id.startsWith("grammar:") && <Link href={`/grammar/${item.id.slice("grammar:".length)}`} className="mt-3 inline-flex text-sm font-bold text-celadon-dark underline">Mở bài học ngữ pháp</Link>}
      </article>)}
    </section>}
  </main>;
}
