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
      <div className="text-sm font-semibold text-ink-muted">
        ✍️ Nhập câu dịch tiếng Trung của bạn (chấp nhận chữ Hán hoặc Pinyin có/không dấu, tự động bỏ qua hoa thường và dấu câu):
      </div>

      <div className="relative">
        <textarea
          rows={3}
          disabled={disabled}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Gõ bản dịch vào đây..."
          className="w-full p-4 rounded-2xl border-2 border-parchment-300 focus:border-celadon focus:ring-4 focus:ring-celadon/15 bg-white text-ink font-chinese text-xl outline-none transition-all shadow-inner-soft resize-none"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>💡 Hệ thống chấm thông minh: tự động nhận diện từ đồng nghĩa và biến thể ngữ pháp.</span>
        <span className="font-mono">{textValue.length} ký tự</span>
      </div>
    </div>
  );
};
