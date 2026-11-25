import { describe, expect, it } from "vitest";
import { allMockExams, grammarLessons, validateGrammarLessons } from "@/data/mock";
import { localRepository } from "@/services/localRepository";

const questions = allMockExams.flatMap((exam) => exam.questions);

describe("grammar lesson content", () => {
  it("validates sourced examples and confirms the 比 lesson has two verified examples", () => {
    expect(validateGrammarLessons(grammarLessons, questions)).toEqual([]);
    expect(grammarLessons.find((lesson) => lesson.id === "so-sanh-bi")).toMatchObject({
      sourceQuestionIds: ["b-gd-3-10"],
    });
    expect(grammarLessons.find((lesson) => lesson.id === "so-sanh-bi")?.externalExamples?.[0].sourceUrl).toMatch(/^https:\/\//);
    expect(grammarLessons.find((lesson) => lesson.id === "hoi-tuoi-duo-da-le")?.sourceQuestionIds).toHaveLength(3);
  });

  it("renders all three age examples from their referenced question records", async () => {
    const lesson = await localRepository.getGrammarLesson("hoi-tuoi-duo-da-le");
    expect(lesson?.examples).toHaveLength(3);
    for (const example of lesson?.examples ?? []) {
      const source = questions.find((question) => question.id === example.sourceQuestionId);
      expect(source).toBeDefined();
      expect(example.pinyin).toBe(source?.pinyin);
      const expectedChinese = source?.chineseText ?? (Array.isArray(source?.correctAnswer)
        ? source.correctAnswer.join("")
        : typeof source?.correctAnswer === "string" ? source.correctAnswer : "");
      expect(example.chinese).toBe(expectedChinese);
    }
  });

  it("includes the verified HSK textbook example and its source link", async () => {
    const lesson = await localRepository.getGrammarLesson("so-sanh-bi");
    expect(lesson?.needsReview).toBeUndefined();
    expect(lesson?.examples).toHaveLength(2);
    expect(lesson?.examples[1]).toMatchObject({
      chinese: "我觉得数学比历史难多了",
      pinyin: "Wǒ juéde shùxué bǐ lìshǐ nánduō le",
      sourceUrl: "https://cdn.baulchino.com/hsk-books/HSK-3-Workbook.pdf",
    });
  });

  it("detects missing source questions, unreviewed single-example lessons, and broken links", () => {
    const invalidLessons = [
      { ...grammarLessons[0], needsReview: false, sourceQuestionIds: ["missing-source"], externalExamples: undefined },
    ];
    const linkedQuestion = questions.find((question) => question.grammarPointId);
    expect(linkedQuestion).toBeDefined();
    const invalidQuestions = [{ ...linkedQuestion!, grammarPointId: "missing-lesson" }];
    const errors = validateGrammarLessons(invalidLessons, invalidQuestions);
    expect(errors.some((error) => error.includes("missing-source"))).toBe(true);
    expect(errors.some((error) => error.includes("ít nhất hai ví dụ"))).toBe(true);
    expect(errors.some((error) => error.includes(linkedQuestion!.id) && error.includes("grammarPointId"))).toBe(true);
    const invalidCitation = [{
      ...grammarLessons[0],
      sourceQuestionIds: ["b-gd-3-10"],
      externalExamples: [{ ...grammarLessons[0].externalExamples![0], sourceUrl: "" }],
    }];
    expect(validateGrammarLessons(invalidCitation, questions).some((error) => error.includes("HTTPS"))).toBe(true);
  });
});
