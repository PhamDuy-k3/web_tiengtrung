import { describe, expect, it } from "vitest";
import type { Question } from "@/types";
import { selectAdaptiveQuestions } from "@/services/adaptiveExamGenerator";

function makeQuestions(count: number, tags: string[] = ["general"], difficulty: 3 = 3): Question[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `question-${index}`,
    version: 1,
    type: "multiple_choice",
    hskLevel: 3,
    difficulty,
    topicId: "test-topic",
    tags,
    prompt: `Question ${index}`,
    options: ["A", "B"],
    correctAnswer: "A",
    explanation: "Test explanation.",
  }));
}

describe("adaptive exam question selection", () => {
  it("returns the requested count without duplicate IDs", () => {
    const selected = selectAdaptiveQuestions({ questions: makeQuestions(15), count: 10, random: () => 0.5 });
    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((question) => question.id)).size).toBe(10);
  });

  it("keeps all questions inside a weak-tag focus when enough candidates exist", () => {
    const pool = [
      ...makeQuestions(12, ["weak-tag"]),
      ...makeQuestions(4, ["other-tag"]).map((question, index) => ({ ...question, id: `other-${index}` })),
    ];
    const selected = selectAdaptiveQuestions({ questions: pool, count: 10, focusTags: ["weak-tag"], random: () => 0.5 });
    expect(selected).toHaveLength(10);
    expect(selected.every((question) => question.tags.includes("weak-tag"))).toBe(true);
  });

  it("weights due-SRS and matching weak tags above unrelated questions", () => {
    const [unrelated, dueAndWeak] = [
      ...makeQuestions(1, ["other"]),
      ...makeQuestions(1, ["weak"]),
    ];
    const dueSelected = selectAdaptiveQuestions({
      questions: [unrelated, dueAndWeak],
      count: 1,
      dueQuestionIds: [dueAndWeak.id],
      focusTags: ["weak"],
      tagWeights: { weak: 10 },
      random: () => 0.5,
    });
    expect(dueSelected[0].id).toBe(dueAndWeak.id);
  });

  it("weights questions closest to the learner's target difficulty", () => {
    const pool = [
      { ...makeQuestions(1, ["same"])[0], id: "easy", difficulty: 1 as const },
      { ...makeQuestions(1, ["same"])[0], id: "target", difficulty: 5 as const },
    ];
    const selected = selectAdaptiveQuestions({ questions: pool, count: 1, targetDifficulty: 5, random: () => 0.8 });
    expect(selected[0].id).toBe("target");
  });

  it("throws when the pool cannot satisfy the requested unique count", () => {
    expect(() => selectAdaptiveQuestions({ questions: makeQuestions(2), count: 3 })).toThrow("Không đủ câu hỏi riêng biệt");
  });
});
