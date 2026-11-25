"use client";

import React, { useEffect, useState } from "react";
import { AnswerValue, Question } from "@/types";
import { WordOrderQuestion } from "./WordOrderQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { FillInBlankQuestion } from "./FillInBlankQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { ListenChoiceQuestion } from "./ListenChoiceQuestion";
import { ListenWordOrderQuestion } from "./ListenWordOrderQuestion";
import { PinyinChoiceQuestion } from "./PinyinChoiceQuestion";
import { ShortTranslateQuestion } from "./ShortTranslateQuestion";
import { HanziWriteQuestion } from "./HanziWriteQuestion";
import Link from "next/link";
import type { QuestionReport } from "@/types";
import { AudioButton } from "./AudioButton";
import { getLevelDifficultyConfig } from "@/lib/difficulty";
import { Eye, EyeOff, Bookmark, BookmarkCheck, Command } from "lucide-react";

interface QuizRendererProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (val: AnswerValue) => void;
  disabled?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onReport?: (report: Pick<QuestionReport, "reason" | "details">) => Promise<void>;
}

// Badge colour per HSK level (new colour system)
function getLevelBadgeClass(hskLevel: number): string {
  if (hskLevel <= 2) return "bg-celadon-100 text-celadon-dark border-celadon-200";
  if (hskLevel <= 4) return "bg-gilt-light text-gilt-deep border-gilt-soft";
  return "bg-vermillion-light text-vermillion-deep border-vermillion-soft";
}

function getLevelLabel(hskLevel: number): string {
  if (hskLevel <= 2) return "Cơ bản";
  if (hskLevel <= 4) return "Trung cấp";
  return "Nâng cao";
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  isBookmarked = false,
  onToggleBookmark,
  onReport,
}) => {
  const isListeningType =
    question.type === "listen_choice" || question.type === "listen_word_order";

  const diffConfig = getLevelDifficultyConfig(question.hskLevel);
  const [showPinyinHint, setShowPinyinHint] = useState(diffConfig.showPinyinByDefault);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Sai đáp án");
  const [reportDetails, setReportDetails] = useState("");
  const [reportState, setReportState] = useState("");

  useEffect(() => {
    setShowPinyinHint(diffConfig.showPinyinByDefault);
    setReportOpen(false);
    setReportReason("Sai đáp án");
    setReportDetails("");
    setReportState("");
  }, [question.id, diffConfig.showPinyinByDefault]);

  const badgeClass = getLevelBadgeClass(question.hskLevel);
  const levelLabel = getLevelLabel(question.hskLevel);

  return (
    <div className="bg-parchment-50 rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-soft space-y-6">
      {/* ── Header: level badge + tags + audio + bookmark ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-parchment-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level badge */}
          <span className={`badge border ${badgeClass}`}>
            HSK {question.hskLevel} · {levelLabel}
          </span>

          {/* Tags */}
          {question.tags?.slice(0, 2).map((t, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-parchment-200 text-ink-light border border-parchment-300"
            >
              #{t.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Audio play button for non-listening types */}
          {!isListeningType && question.type !== "hanzi_write" && question.chineseText && (
            <AudioButton text={question.chineseText} size="sm" />
          )}

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              title={isBookmarked ? "Đã ghim để ôn lại" : "Ghim câu hỏi này"}
              className={`p-2 rounded-2xl border transition-all duration-150 flex items-center gap-1.5 text-xs font-bold ${
                isBookmarked
                  ? "bg-gilt text-white border-gilt shadow-soft"
                  : "bg-parchment-100 hover:bg-parchment-200 text-ink-muted border-parchment-300"
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck size={16} />
                  <span className="hidden sm:inline">Đã ghim</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span className="hidden sm:inline">Ghim câu</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Question prompt ── */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-ink leading-relaxed">
          {question.prompt}
        </h2>

        {/* ── Hanzi box with adaptive Pinyin ── */}
        {!isListeningType && question.type !== "hanzi_write" && question.chineseText && (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-parchment-300 shadow-inner-soft space-y-2">
            <div className="hanzi-box font-chinese text-2xl sm:text-3xl font-bold text-ink">
              {question.chineseText}
            </div>

            {/* Pinyin line */}
            {question.pinyin && (
              <div className="flex items-center gap-2 pt-1">
                {diffConfig.showPinyinByDefault ? (
                  <div className="text-sm font-semibold text-celadon-dark font-sans tracking-wide">
                    {question.pinyin}
                  </div>
                ) : diffConfig.allowPinyinToggle ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {showPinyinHint && (
                      <div className="text-sm font-semibold text-celadon-dark font-sans tracking-wide">
                        {question.pinyin}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPinyinHint(!showPinyinHint)}
                      className="px-2.5 py-1 rounded-lg bg-parchment-100 border border-parchment-300 hover:border-celadon-200 text-ink-light hover:text-ink text-xs font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      {showPinyinHint ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showPinyinHint ? "Ẩn Pinyin" : "Gợi ý Pinyin"}</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-semibold text-ink/35 italic">
                    (Nâng cao: Đọc thuần chữ Hán, không có Pinyin)
                  </span>
                )}
              </div>
            )}

            {question.vietnamese && (
              <div className="text-xs text-ink-light italic pt-1.5 border-t border-parchment-200">
                Nghĩa ngữ cảnh: {question.vietnamese}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Interactive question component ── */}
      <div className="pt-1">
        {(() => {
          switch (question.type) {
            case "word_order":
              return <WordOrderQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "multiple_choice":
              return <MultipleChoiceQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "fill_in_blank":
              return <FillInBlankQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "matching":
              return <MatchingQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "listen_choice":
              return <ListenChoiceQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "listen_word_order":
              return <ListenWordOrderQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "pinyin_choice":
              return <PinyinChoiceQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "short_translate":
              return <ShortTranslateQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            case "hanzi_write":
              return <HanziWriteQuestion key={question.id} question={question} value={value} onChange={onChange} disabled={disabled} />;
            default:
              return <div className="text-ink-light text-sm">Dạng câu hỏi chưa được hỗ trợ.</div>;
          }
        })()}
      </div>
      {question.grammarPointId && <Link href={`/grammar/${question.grammarPointId}`} className="inline-flex rounded-xl bg-celadon-50 px-3 py-2 text-sm font-bold text-celadon-dark hover:underline">Xem ghi chú ngữ pháp</Link>}
      {onReport && <div className="border-t border-parchment-200 pt-3">
        {!reportOpen ? <button type="button" onClick={() => setReportOpen(true)} className="text-sm font-semibold text-ink-muted underline">Báo câu hỏi có lỗi</button> :
          <form className="space-y-2" onSubmit={async (event) => {
            event.preventDefault(); setReportState("");
            try { await onReport({ reason: reportReason, details: reportDetails.trim() || undefined }); setReportState("Đã ghi nhận báo cáo."); setReportOpen(false); }
            catch { setReportState("Chưa lưu được. Hãy thử lại."); }
          }}>
            <label className="block text-sm font-semibold">Lý do
              <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="mt-1 block w-full rounded-xl border border-parchment-300 bg-white p-2">
                {["Sai đáp án", "Lỗi chính tả/Pinyin", "Câu hỏi khó hiểu", "Lý do khác"].map((reason) => <option key={reason}>{reason}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Ghi chú (không bắt buộc)
              <textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={500} className="mt-1 block w-full rounded-xl border border-parchment-300 bg-white p-2" rows={2} />
            </label>
            <div className="flex gap-2"><button type="submit" className="rounded-xl bg-ink px-3 py-2 text-sm font-bold text-white">Gửi báo cáo</button><button type="button" onClick={() => setReportOpen(false)} className="rounded-xl border px-3 py-2 text-sm">Hủy</button></div>
          </form>}
        {reportState && <p role="status" className="mt-2 text-sm">{reportState}</p>}
      </div>}
    </div>
  );
};
