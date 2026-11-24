import { Question } from "@/types";

/**
 * Normalizes text for flexible grading:
 * - strips punctuation (Chinese and Western: 。,.!?，！？、“”"':;)
 * - collapses whitespace
 * - lowercases
 * - strips tone marks if needed for pinyin comparisons
 */
export function normalizeAnswer(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'，。！？、；：“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes pinyin removing tone marks and formatting:
 * e.g., "Nǐ hǎo" -> "ni hao"
 */
export function normalizePinyin(text: string): string {
  if (!text) return "";
  return normalizeAnswer(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ü/g, "v")
    .replace(/ǖ|ǘ|ǚ|ǜ/g, "v");
}

/**
 * Checks if a user's answer is correct for any of the 8 question types
 */
export function gradeQuestion(question: Question, userAnswer: any): boolean {
  if (userAnswer === undefined || userAnswer === null) return false;

  switch (question.type) {
    case "multiple_choice":
    case "listen_choice":
    case "pinyin_choice": {
      if (typeof userAnswer !== "string") return false;
      const expected = String(question.correctAnswer).trim();
      return normalizeAnswer(userAnswer) === normalizeAnswer(expected);
    }

    case "fill_in_blank": {
      if (typeof userAnswer !== "string") return false;
      const expected = String(question.correctAnswer).trim();
      const normUser = normalizeAnswer(userAnswer);
      const normExp = normalizeAnswer(expected);
      if (normUser === normExp) return true;
      if (normalizePinyin(normUser) === normalizePinyin(normExp)) return true;
      if (question.pinyin && normalizePinyin(normUser) === normalizePinyin(question.pinyin)) return true;
      return false;
    }

    case "word_order":
    case "listen_word_order": {
      // Support direct typing mode (Intermediate/Advanced self-typing)
      if (typeof userAnswer === "string") {
        const expected = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.join("")
          : String(question.correctAnswer);
        const normUser = normalizeAnswer(userAnswer).replace(/\s+/g, "");
        const normExp = normalizeAnswer(expected).replace(/\s+/g, "");
        if (normUser === normExp) return true;
        return normalizePinyin(normUser) === normalizePinyin(normExp);
      }

      // Support tile ordering mode
      if (!Array.isArray(userAnswer)) return false;
      const expected = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [String(question.correctAnswer)];

      if (userAnswer.length !== expected.length) return false;
      return userAnswer.every((tile, idx) => tile === expected[idx]);
    }

    case "matching": {
      // userAnswer is Record<leftId, rightId> or array of pairs
      if (!question.pairs || typeof userAnswer !== "object") return false;
      const totalPairs = question.pairs.length;
      let matchedCount = 0;

      for (const pair of question.pairs) {
        if (userAnswer[pair.id] === pair.right) {
          matchedCount++;
        }
      }
      return matchedCount === totalPairs;
    }

    case "short_translate": {
      if (typeof userAnswer !== "string") return false;
      const userNorm = normalizeAnswer(userAnswer);
      const expected = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [String(question.correctAnswer)];

      return expected.some((ans) => {
        const ansNorm = normalizeAnswer(ans);
        if (userNorm === ansNorm) return true;
        // Also compare pinyin equivalent if user typed pinyin
        return normalizePinyin(userNorm) === normalizePinyin(ansNorm);
      });
    }

    default:
      return false;
  }
}
