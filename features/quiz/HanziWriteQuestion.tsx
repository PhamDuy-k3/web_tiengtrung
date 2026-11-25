"use client";

import { useEffect, useRef, useState } from "react";
import type HanziWriter from "hanzi-writer";
import type { AnswerValue, Question } from "@/types";

interface HanziWriteQuestionProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}

export function HanziWriteQuestion({ question, value, onChange, disabled = false }: HanziWriteQuestionProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const character = question.chineseText?.trim().slice(0, 1) ?? "";

  const startQuiz = () => {
    if (!writerRef.current || disabled) return;
    setComplete(false);
    onChange("");
    writerRef.current.cancelQuiz();
    void writerRef.current.quiz({ onComplete: () => { setComplete(true); onChange(character); } }).catch(() => {
      setError("Không tải được dữ liệu nét chữ. Kiểm tra kết nối rồi thử lại.");
    });
  };

  useEffect(() => {
    let active = true;
    const root = mountRef.current;
    setComplete(false);
    if (!root || !character) {
      setError("Câu hỏi chưa có một chữ Hán hợp lệ.");
      setLoading(false);
      return;
    }
    // Give each Hanzi Writer instance its own host. The library mutates this
    // subtree, so React must not reconcile or clear the SVG nodes it owns.
    const host = document.createElement("div");
    root.appendChild(host);
    setLoading(true);
    setError("");
    void import("hanzi-writer").then(({ default: HanziWriterLib }) => {
      if (!active) return;
      const writer = HanziWriterLib.create(host, character, {
        width: 260,
        height: 260,
        padding: 12,
        showCharacter: false,
        showOutline: true,
        onLoadCharDataSuccess: () => { if (active) setLoading(false); },
        onLoadCharDataError: () => {
          if (active) {
            setLoading(false);
            setError("Không tải được dữ liệu nét chữ. Kiểm tra kết nối rồi thử lại.");
          }
        },
      });
      writerRef.current = writer;
      void writer.quiz({ onComplete: () => { if (active) { setComplete(true); onChange(character); } } }).catch(() => {
        if (active) {
          setLoading(false);
          setError("Không tải được dữ liệu nét chữ. Kiểm tra kết nối rồi thử lại.");
        }
      });
    }).catch(() => {
      if (active) { setLoading(false); setError("Không khởi tạo được bộ luyện viết."); }
    });
    return () => {
      active = false;
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
      // Detach only the wrapper. Leave its SVG children intact so any pending
      // Hanzi Writer cleanup can still remove nodes from their original parent.
      host.remove();
    };
  // The writer is recreated for each question.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, question.id, retryKey]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-light">Viết đúng thứ tự nét cho chữ đang ẩn trong ô bên dưới.</p>
      <div className="relative mx-auto w-fit rounded-2xl border border-parchment-300 bg-white p-2">
        <div ref={mountRef} aria-label="Vùng luyện viết chữ Hán" />
        {loading && !error && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/85 text-sm">Đang tải nét chữ…</div>}
        {error && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/95 p-4 text-center text-sm text-red-700">{error}</div>}
      </div>
      {error && <button type="button" onClick={() => { setError(""); setLoading(true); setComplete(false); setRetryKey((key) => key + 1); }} className="rounded-xl border px-3 py-2 text-sm font-semibold">Thử lại</button>}
      {!error && <div className="flex justify-center gap-2">
        <button type="button" disabled={disabled || loading} onClick={startQuiz} className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50">Viết lại</button>
        <button type="button" disabled={disabled || loading} onClick={() => writerRef.current?.animateCharacter()} className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50">Xem thứ tự nét</button>
      </div>}
      {complete && <p role="status" className="text-center text-sm font-bold text-celadon-dark">Hoàn thành! Đã ghi nhận câu trả lời.</p>}
      {typeof value === "string" && value && <span className="sr-only">Đã hoàn thành viết chữ.</span>}
    </div>
  );
}
