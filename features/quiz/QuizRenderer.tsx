"use client";

import React, { useState } from "react";
import { Question } from "@/types";
import { WordOrderQuestion } from "./WordOrderQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { FillInBlankQuestion } from "./FillInBlankQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { ListenChoiceQuestion } from "./ListenChoiceQuestion";
import { ListenWordOrderQuestion } from "./ListenWordOrderQuestion";
import { PinyinChoiceQuestion } from "./PinyinChoiceQuestion";
import { ShortTranslateQuestion } from "./ShortTranslateQuestion";
import { AudioButton } from "./AudioButton";
import { getLevelDifficultyConfig } from "@/lib/difficulty";
import { Eye, EyeOff } from "lucide-react";

interface QuizRendererProps {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const isListeningType =
    question.type === "listen_choice" || question.type === "listen_word_order";

  const diffConfig = getLevelDifficultyConfig(question.hskLevel);
  const [showPinyinHint, setShowPinyinHint] = useState(diffConfig.showPinyinByDefault);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card space-y-6">
      {/* Header Level Badge & Difficulty Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${diffConfig.badgeColor}`}
          >
            HSK {question.hskLevel} • {diffConfig.badgeLabel.split(":")[0]}
          </span>

          {/* Tags */}
          {question.tags?.slice(0, 2).map((t, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
            >
              #{t.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        {/* Audio control for reading text if available */}
        {!isListeningType && question.chineseText && (
          <AudioButton text={question.chineseText} size="sm" />
        )}
      </div>

      {/* Main Prompt */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-charcoal leading-relaxed">
          {question.prompt}
        </h2>

        {/* Hanzi Box with Adaptive Pinyin Control */}
        {!isListeningType && question.chineseText && (
          <div className="p-4 sm:p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
            <div className="font-chinese text-2xl sm:text-3xl font-bold text-charcoal">
              {question.chineseText}
            </div>

            {/* Pinyin display logic based on level */}
            {question.pinyin && (
              <div className="flex items-center gap-2 pt-1">
                {diffConfig.showPinyinByDefault ? (
                  <div className="text-sm font-semibold text-coral-dark font-sans tracking-wide">
                    {question.pinyin}
                  </div>
                ) : diffConfig.allowPinyinToggle ? (
                  <div className="flex items-center gap-2">
                    {showPinyinHint ? (
                      <div className="text-sm font-semibold text-coral-dark font-sans tracking-wide">
                        {question.pinyin}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setShowPinyinHint(!showPinyinHint)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-cream-300 hover:border-amber-400 text-charcoal/60 hover:text-charcoal text-xs font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      {showPinyinHint ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showPinyinHint ? "Ẩn Pinyin" : "Gợi ý Pinyin"}</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-semibold text-charcoal/40 italic">
                    (Cấp Nâng cao: Đọc hiểu thuần chữ Hán không kèm Pinyin)
                  </span>
                )}
              </div>
            )}

            {question.vietnamese && (
              <div className="text-xs text-charcoal/60 italic pt-1 border-t border-cream-200/60">
                Nghĩa ngữ cảnh: {question.vietnamese}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Question Component Dispatcher */}
      <div className="pt-1">
        {(() => {
          switch (question.type) {
            case "word_order":
              return (
                <WordOrderQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            case "multiple_choice":
              return (
                <MultipleChoiceQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            case "fill_in_blank":
              return (
                <FillInBlankQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            case "matching":
              return (
                <MatchingQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            case "listen_choice":
              return (
                <ListenChoiceQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            case "listen_word_order":
              return (
                <ListenWordOrderQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            case "pinyin_choice":
              return (
                <PinyinChoiceQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            case "short_translate":
              return (
                <ShortTranslateQuestion
                  question={question}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            default:
              return <div>Dạng câu hỏi chưa được hỗ trợ.</div>;
          }
        })()}
      </div>
    </div>
  );
};
