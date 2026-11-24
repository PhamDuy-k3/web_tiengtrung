"use client";

import React from "react";
import { Question } from "@/types";

interface QuestionPaletteProps {
  questions: Question[];
  answers: Record<string, any>;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  answers,
  currentIndex,
  onSelectIndex,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const total = questions.length;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== "" && answers[k] !== null
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-cream-300 space-y-6">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div>
            <h3 className="text-xl font-bold text-charcoal">Danh sách câu hỏi</h3>
            <p className="text-xs text-charcoal/60">
              Đã làm: <span className="font-bold text-coral">{answeredCount}</span>/{total} câu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-200 hover:bg-cream-300 text-charcoal font-bold flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-around text-xs text-charcoal/70 bg-cream-100 p-2.5 rounded-xl border border-cream-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-coral"></span>
            <span>Đang chọn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-mint"></span>
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white border border-amber-300"></span>
            <span>Chưa làm</span>
          </div>
        </div>

        {/* Matrix grid */}
        <div className="max-h-[350px] overflow-y-auto p-1 grid grid-cols-5 sm:grid-cols-8 gap-2.5">
          {questions.map((q, idx) => {
            const hasAnswer =
              answers[q.id] !== undefined &&
              answers[q.id] !== "" &&
              answers[q.id] !== null &&
              (!Array.isArray(answers[q.id]) || answers[q.id].length > 0) &&
              (typeof answers[q.id] !== "object" || Object.keys(answers[q.id]).length > 0);
            const isCurrent = idx === currentIndex;

            let style = "bg-white border-amber-200 text-charcoal hover:border-amber-400";
            if (isCurrent) {
              style = "bg-coral text-white border-coral font-bold shadow-md scale-105";
            } else if (hasAnswer) {
              style = "bg-mint-light text-mint-dark border-mint font-bold";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  onSelectIndex(idx);
                  onClose();
                }}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-sm font-semibold transition-all transform active:scale-95 ${style}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-cream-200 hover:bg-cream-300 font-bold text-charcoal transition-colors"
        >
          Đóng bảng câu hỏi
        </button>
      </div>
    </div>
  );
};
