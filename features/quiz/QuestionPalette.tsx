"use client";

import React from "react";
import { Question } from "@/types";
import { Check, Send, Grid } from "lucide-react";

interface QuestionPaletteProps {
  questions: Question[];
  answers: Record<string, any>;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
  mode?: "dialog" | "sidebar";
  onSubmit?: () => void;
  isSubmitting?: boolean;
  bookmarkedIds?: Set<string>;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  answers,
  currentIndex,
  onSelectIndex,
  isOpen = false,
  onClose,
  mode = "dialog",
  onSubmit,
  isSubmitting = false,
  bookmarkedIds,
}) => {
  const total = questions.length;
  const answeredCount = questions.filter((q) => {
    const val = answers[q.id];
    return (
      val !== undefined &&
      val !== "" &&
      val !== null &&
      (!Array.isArray(val) || val.length > 0) &&
      (typeof val !== "object" || Object.keys(val).length > 0)
    );
  }).length;

  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const renderContent = (isModal: boolean) => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-celadon-100 text-celadon-dark">
              <Grid size={16} />
            </span>
            <h3 className="text-base font-black text-ink">Bảng câu hỏi</h3>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Đã làm <strong className="text-celadon-dark font-bold">{answeredCount}</strong>/{total} câu ({pct}%)
          </p>
        </div>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-parchment-200 hover:bg-parchment-300 text-ink font-bold flex items-center justify-center transition-all text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mini Progress track */}
      <div className="w-full h-2 rounded-full bg-parchment-200 overflow-hidden">
        <div
          className="h-full bg-celadon rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-ink-muted bg-parchment-100 p-2 rounded-xl border border-parchment-200 flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-vermillion shadow-sm"></span>
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-celadon"></span>
          <span>Đã làm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gilt-dark"></span>
          <span>Đã ghim</span>
        </div>
      </div>

      {/* Grid of question numbers */}
      <div className="max-h-[360px] overflow-y-auto p-1 grid grid-cols-5 gap-2 custom-scrollbar">
        {questions.map((q, idx) => {
          const val = answers[q.id];
          const hasAnswer =
            val !== undefined &&
            val !== "" &&
            val !== null &&
            (!Array.isArray(val) || val.length > 0) &&
            (typeof val !== "object" || Object.keys(val).length > 0);
          const isCurrent = idx === currentIndex;
          const isBookmarked = bookmarkedIds ? bookmarkedIds.has(q.id) : false;

          let style =
            "bg-white border-parchment-300 text-ink-light hover:border-celadon hover:text-celadon-dark hover:bg-celadon-50";

          if (isCurrent) {
            style =
              "bg-vermillion text-white border-vermillion font-bold shadow-md ring-2 ring-vermillion/30 scale-105";
          } else if (hasAnswer) {
            style =
              "bg-celadon-50 text-celadon-dark border-celadon-300 font-bold hover:bg-celadon-100";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                onSelectIndex(idx);
                if (isModal && onClose) onClose();
              }}
              className={`h-10 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all transform active:scale-95 relative ${style}`}
              title={`Câu ${idx + 1}${hasAnswer ? " (Đã làm)" : " (Chưa làm)"}${isBookmarked ? " [Đã ghim]" : ""}`}
            >
              <span>{idx + 1}</span>
              {isBookmarked && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gilt border border-white shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit button on sidebar */}
      {onSubmit && (
        <div className="pt-2 border-t border-parchment-200">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Send size={16} />
            <span>{isSubmitting ? "Đang nộp..." : "Nộp bài thi"}</span>
          </button>
          {answeredCount < total && (
            <p className="text-[11px] text-center text-ink-muted mt-1.5">
              Còn {total - answeredCount} câu chưa trả lời
            </p>
          )}
        </div>
      )}
    </div>
  );

  // If sidebar mode: render directly inside page layout
  if (mode === "sidebar") {
    return (
      <aside className="w-full bg-white rounded-3xl p-5 border border-parchment-300 shadow-soft">
        {renderContent(false)}
      </aside>
    );
  }

  // Dialog / Modal mode (for mobile)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-parchment-300 space-y-4">
        {renderContent(true)}
      </div>
    </div>
  );
};
