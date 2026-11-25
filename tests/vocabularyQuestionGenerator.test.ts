import { describe, expect, it } from "vitest";
import { mockVocabulary } from "@/data/mock";
import { generateVocabularyQuestions } from "@/services/vocabularyQuestionGenerator";

describe("generateVocabularyQuestions", () => {
  it("builds meaning, Pinyin, listening, and matching questions from source vocabulary", () => {
    const source = mockVocabulary.filter((word) => word.topicId === "basic-chao-hoi").slice(0, 8);
    const questions = generateVocabularyQuestions(source);
    expect(new Set(questions.map((question) => question.type))).toEqual(
      new Set(["multiple_choice", "pinyin_choice", "listen_choice", "matching", "hanzi_write"])
    );
    expect(questions.every((question) => question.generated)).toBe(true);
    expect(questions.every((question) => question.vocabIds?.length)).toBe(true);
    expect(questions.filter((question) => question.type === "pinyin_choice").every((question) => !question.pinyin && !question.vietnamese)).toBe(true);
    expect(questions.filter((question) => question.type === "multiple_choice").every((question) => !question.vietnamese)).toBe(true);
    expect(questions.filter((question) => question.type === "matching").every((question) => question.pairs?.length === 4)).toBe(true);
    for (const question of questions) {
      const sourceWords = source.filter((word) => question.vocabIds?.includes(word.id));
      expect(sourceWords.length).toBeGreaterThan(0);
      if (question.type === "hanzi_write") {
        expect(Array.from(question.chineseText ?? "")).toHaveLength(1);
        expect(sourceWords[0].hanzi).toContain(question.chineseText);
      } else if (question.type !== "matching") {
        expect(question.chineseText).toBe(sourceWords[0].hanzi);
      }
    }
  });
});
