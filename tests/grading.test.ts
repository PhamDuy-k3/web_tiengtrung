import { describe, expect, it } from "vitest";
import { AnswerValue, Question, QuestionType } from "@/types";
import { gradeQuestion, normalizeAnswer, normalizePinyin } from "@/lib/grading";

function makeQuestion(
  type: QuestionType,
  correctAnswer: AnswerValue,
  extra: Partial<Question> = {}
): Question {
  return {
    id: `test-${type}`,
    version: 1,
    type,
    hskLevel: 1,
    difficulty: 1,
    topicId: "test-topic",
    tags: [],
    prompt: "Question",
    correctAnswer,
    explanation: "Giải thích.",
    ...extra,
  };
}

describe("answer normalization", () => {
  it("normalizes punctuation, spacing, and case", () => {
    expect(normalizeAnswer("  NǏ   HǍO，World！ ")).toBe("nǐ hǎoworld");
  });

  it("normalizes Pinyin tone marks and ü spellings", () => {
    expect(normalizePinyin("Nǚ Hǎo")).toBe("nv hao");
    expect(normalizePinyin("nu: hao")).toBe("nv hao");
  });
});

describe("gradeQuestion", () => {
  it("grades multiple choice and accepted alternatives", () => {
    const question = makeQuestion("multiple_choice", "你好", { acceptedAnswers: ["您好"] });
    expect(gradeQuestion(question, " 您好！").score).toBe(100);
    expect(gradeQuestion(question, "再见").correct).toBe(false);
  });

  it("grades fill in blank with full and partial credit", () => {
    const question = makeQuestion("fill_in_blank", "我住在北京");
    expect(gradeQuestion(question, "我住在北京。").score).toBe(100);
    expect(gradeQuestion(question, "北京").score).toBeGreaterThan(0);
  });

  it("awards positional partial credit for word order", () => {
    const question = makeQuestion("word_order", ["我", "爱", "你"]);
    const result = gradeQuestion(question, ["我", "你", "爱"]);
    expect(result.correct).toBe(false);
    expect(result.score).toBe(33);
  });

  it("awards partial credit to typed word order by matched characters", () => {
    const question = makeQuestion("word_order", ["你好", "世界"]);
    expect(gradeQuestion(question, "你好").score).toBe(50);
  });

  it("grades matching pairs partially", () => {
    const question = makeQuestion("matching", { one: "một", two: "hai" }, {
      pairs: [
        { id: "one", left: "一", right: "một" },
        { id: "two", left: "二", right: "hai" },
      ],
    });
    expect(gradeQuestion(question, { one: "một", two: "sai" }).score).toBe(50);
  });

  it("grades listen choice", () => {
    const question = makeQuestion("listen_choice", "你好");
    expect(gradeQuestion(question, "你好").correct).toBe(true);
  });

  it("grades listen word order", () => {
    const question = makeQuestion("listen_word_order", ["你", "好"]);
    expect(gradeQuestion(question, ["你", "好"]).score).toBe(100);
  });

  it("compares Pinyin without requiring tone marks", () => {
    const question = makeQuestion("pinyin_choice", "fùhé");
    expect(gradeQuestion(question, "fuhe").score).toBe(100);
  });

  it("grades short translation variants and partial text", () => {
    const question = makeQuestion("short_translate", ["你好世界", "您好世界"]);
    expect(gradeQuestion(question, "您好世界！").correct).toBe(true);
    expect(gradeQuestion(question, "世界").score).toBeGreaterThan(0);
  });

  it("returns zero for missing and malformed answers", () => {
    const question = makeQuestion("multiple_choice", "A");
    expect(gradeQuestion(question, undefined).score).toBe(0);
    expect(gradeQuestion(question, { unexpected: "record" }).score).toBe(0);
  });
});
