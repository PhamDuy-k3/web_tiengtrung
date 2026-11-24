"use client";

import React from "react";
import { Question } from "@/types";

interface AnswerDiffViewerProps {
  question: Question;
  userAnswer: any;
  isCorrect: boolean;
}

export const AnswerDiffViewer: React.FC<AnswerDiffViewerProps> = ({
  question,
  userAnswer,
  isCorrect,
}) => {
  // ── Render User Answer ──
  const renderUserAnswer = () => {
    if (
      userAnswer === undefined ||
      userAnswer === null ||
      userAnswer === "" ||
      (Array.isArray(userAnswer) && userAnswer.length === 0) ||
      (typeof userAnswer === "object" && Object.keys(userAnswer).length === 0)
    ) {
      return (
        <span className="italic text-ink-muted font-normal text-sm">
          (Chưa điền câu trả lời)
        </span>
      );
    }

    // NẾU CÂU TRẢ LỜI ĐÚNG: Luôn hiển thị chữ màu ĐEN
    if (isCorrect) {
      if (Array.isArray(userAnswer)) {
        return (
          <span className="text-ink font-semibold text-sm sm:text-base">
            {userAnswer.join(" ")}
          </span>
        );
      }
      if (typeof userAnswer === "object" && userAnswer !== null) {
        return (
          <div className="flex flex-wrap gap-2">
            {Object.entries(userAnswer).map(([left, right]) => (
              <span
                key={left}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-parchment-100 text-ink font-semibold border border-parchment-200 text-xs sm:text-sm"
              >
                <span>{left}</span>
                <span className="text-celadon-dark font-bold">➔</span>
                <span>{String(right)}</span>
              </span>
            ))}
          </div>
        );
      }
      return (
        <span className="text-ink font-semibold text-sm sm:text-base">
          {String(userAnswer)}
        </span>
      );
    }

    // NẾU CÂU TRẢ LỜI SAI: Bôi đỏ chỗ sai, gạch chân ở dưới nếu là nối từ / ghép từ
    if (question.type === "matching") {
      // Câu nối từ: Kiểm tra từng cặp
      const pairsMap = new Map<string, string>();
      if (question.pairs) {
        for (const p of question.pairs) {
          pairsMap.set(p.left.trim(), p.right.trim());
        }
      } else if (
        typeof question.correctAnswer === "object" &&
        !Array.isArray(question.correctAnswer)
      ) {
        for (const [k, v] of Object.entries(question.correctAnswer)) {
          pairsMap.set(k.trim(), String(v).trim());
        }
      }

      if (typeof userAnswer === "object" && userAnswer !== null) {
        return (
          <div className="flex flex-wrap gap-2">
            {Object.entries(userAnswer).map(([left, right]) => {
              const expectedRight = pairsMap.get(left.trim());
              const pairIsCorrect =
                expectedRight !== undefined &&
                expectedRight.toLowerCase() === String(right).trim().toLowerCase();

              if (pairIsCorrect) {
                // Cặp đúng: chữ đen bình thường
                return (
                  <span
                    key={left}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-parchment-100 text-ink font-medium border border-parchment-200 text-xs sm:text-sm"
                  >
                    <span>{left}</span>
                    <span className="text-ink-muted">➔</span>
                    <span>{String(right)}</span>
                  </span>
                );
              }

              // Cặp sai: BÔI ĐỎ + GẠCH CHÂN Ở DƯỚI
              return (
                <span
                  key={left}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-vermillion-light text-vermillion-deep font-bold border border-vermillion-soft text-xs sm:text-sm underline underline-offset-4 decoration-vermillion decoration-2"
                >
                  <span>{left}</span>
                  <span className="text-vermillion">➔</span>
                  <span>{String(right)}</span>
                </span>
              );
            })}
          </div>
        );
      }
    }

    if (
      question.type === "word_order" ||
      question.type === "listen_word_order"
    ) {
      // Sắp xếp câu: So sánh từng từ với vị trí đúng
      const userTokens: string[] = Array.isArray(userAnswer)
        ? userAnswer
        : typeof userAnswer === "string"
        ? userAnswer.split(/\s+/)
        : [];

      const correctTokens: string[] = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : typeof question.correctAnswer === "string"
        ? question.correctAnswer.split(/\s+/)
        : [];

      return (
        <div className="flex flex-wrap gap-2 items-center">
          {userTokens.map((token, i) => {
            const isMatch = correctTokens[i] === token;
            if (isMatch) {
              return (
                <span key={i} className="text-ink font-semibold text-sm sm:text-base px-1">
                  {token}
                </span>
              );
            }
            // Từ sai vị trí hoặc từ nhiễu: Bôi đỏ + gạch chân ở dưới
            return (
              <span
                key={i}
                className="text-vermillion-deep font-bold underline underline-offset-4 decoration-vermillion decoration-2 bg-vermillion-light px-2 py-0.5 rounded-lg text-sm sm:text-base"
              >
                {token}
              </span>
            );
          })}
        </div>
      );
    }

    // Các dạng khác (trắc nghiệm, điền từ, dịch...):
    // Bôi đỏ chữ và gạch chân ở dưới
    return (
      <span className="text-vermillion-deep font-bold underline underline-offset-4 decoration-vermillion decoration-2 text-sm sm:text-base">
        {String(userAnswer)}
      </span>
    );
  };

  // ── Render Correct Answer (Luôn màu xanh) ──
  const renderCorrectAnswer = () => {
    const ca = question.correctAnswer;
    if (Array.isArray(ca)) {
      return (
        <span className="text-celadon-dark font-bold text-sm sm:text-base">
          {ca.join(" ")}
        </span>
      );
    }
    if (typeof ca === "object" && ca !== null) {
      return (
        <div className="flex flex-wrap gap-2">
          {Object.entries(ca).map(([left, right]) => (
            <span
              key={left}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-celadon-100 text-celadon-dark font-bold border border-celadon-200 text-xs sm:text-sm"
            >
              <span>{left}</span>
              <span className="text-celadon-dark font-bold">➔</span>
              <span>{String(right)}</span>
            </span>
          ))}
        </div>
      );
    }
    return (
      <span className="text-celadon-dark font-bold text-sm sm:text-base">
        {String(ca)}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {/* Box 1: Đáp án của bạn */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isCorrect
            ? "bg-white border-parchment-300 shadow-soft"
            : "bg-vermillion-light/30 border-vermillion-soft"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-ink-muted">Đáp án của bạn:</span>
          {isCorrect ? (
            <span className="text-celadon-dark text-[11px] font-bold">✓ Đúng</span>
          ) : (
            <span className="text-vermillion-deep text-[11px] font-bold">✗ Sai</span>
          )}
        </div>
        <div className="break-words">{renderUserAnswer()}</div>
      </div>

      {/* Box 2: Đáp án đúng chuẩn (Luôn màu xanh) */}
      <div className="p-4 rounded-2xl bg-celadon-50 border border-celadon-200">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5 text-celadon-dark">
          <span>Đáp án đúng chuẩn:</span>
          <span className="text-[11px] font-bold">✓ Chuẩn</span>
        </div>
        <div className="break-words">{renderCorrectAnswer()}</div>
      </div>
    </div>
  );
};
