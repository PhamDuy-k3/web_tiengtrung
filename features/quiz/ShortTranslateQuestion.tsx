"use client";

import React from "react";
import { QuestionComponentProps } from "./WordOrderQuestion";

export const ShortTranslateQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const textValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-4">
      <div className="text-sm text-charcoal/70">
        Nhập câu dịch tiếng Trung của bạn (chấp nhận chữ Hán hoặc Pinyin có/không dấu, không phân biệt hoa thường hay dấu câu):
      </div>

      <div className="relative">
        <textarea
          rows={3}
          disabled={disabled}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Gõ bản dịch vào đây..."
          className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-coral focus:ring-4 focus:ring-coral/15 bg-white text-charcoal font-chinese text-xl outline-none transition-all shadow-inner resize-none"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-charcoal/50">
        <span>Gợi ý: Hệ thống chấm linh hoạt, tự động bỏ qua khoảng trắng và dấu câu.</span>
        <span>{textValue.length} ký tự</span>
      </div>
    </div>
  );
};
