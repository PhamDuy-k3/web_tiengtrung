import { describe, expect, it } from "vitest";
import { migrateStorageData } from "@/lib/storageMigration";

const legacyQuestion = {
  id: "basic-greeting-1",
  type: "multiple_choice",
  hskLevel: 1,
  topicId: "basic-greeting",
  tags: ["greeting"],
  prompt: "Chọn câu chào.",
  options: ["你好", "再见"],
  correctAnswer: "你好",
  explanation: "你好 là câu chào.",
};

function legacyData() {
  return {
    version: "1.0",
    profile: {
      name: "Người học cũ",
      streak: 4,
      lastActiveDate: "2026-11-20",
      unlockedLevels: ["basic"],
      completedLevelTests: [],
      badges: [],
      totalXp: 250,
    },
    attempts: [
      {
        id: "attempt-1",
        examId: "exam-1",
        levelId: "basic",
        examTitle: "Đề thử",
        score: 100,
        totalQuestions: 1,
        correctCount: 1,
        incorrectCount: 0,
        answers: {
          "basic-greeting-1": {
            userAnswer: "你好",
            isCorrect: true,
            question: legacyQuestion,
          },
        },
        durationSeconds: 42,
        createdAt: "2026-11-20T10:00:00.000Z",
      },
    ],
    mistakes: {
      "basic-greeting-1": {
        questionId: "basic-greeting-1",
        question: legacyQuestion,
        timesWrong: 2,
        consecutiveCorrect: 1,
        lastWrongAt: "2026-11-20T10:00:00.000Z",
        isMastered: false,
        lastUserAnswer: "再见",
      },
    },
    progress: { "exam-1": { bestScore: 100, attempts: 1 } },
  };
}

describe("migrateStorageData", () => {
  it("migrates v1 attempts, mistakes, and profile without dropping progress", () => {
    const source = legacyData();
    const migrated = migrateStorageData(source);
    expect(migrated?.version).toBe("2.1");
    expect(migrated?.profile.name).toBe("Người học cũ");
    expect(migrated?.profile.totalXp).toBe(250);
    expect(migrated?.attempts[0].answers["basic-greeting-1"].score).toBe(100);
    expect(migrated?.mistakes["basic-greeting-1"].timesWrong).toBe(2);
    expect(migrated?.progress["exam-1"].attempts).toBe(1);
    expect(migrated?.srs["question:basic-greeting-1"].dueAt).toBeTruthy();
    expect((source.attempts[0].answers["basic-greeting-1"].question as typeof legacyQuestion).id)
      .toBe("basic-greeting-1");
  });

  it("supplies metadata defaults to legacy questions", () => {
    const migrated = migrateStorageData(legacyData());
    const question = migrated?.attempts[0].answers["basic-greeting-1"].question;
    expect(question?.version).toBe(1);
    expect(question?.difficulty).toBe(1);
  });

  it("remaps the one duplicated legacy question ID by its stored sentence", () => {
    const source = legacyData();
    const legacyDuplicate = { ...legacyQuestion, id: "i-sk-4-8", chineseText: "笑一笑，十年少。" };
    Object.assign(source.attempts[0].answers, { "i-sk-4-8": {
      userAnswer: "笑一笑，十年少。",
      isCorrect: true,
      question: legacyDuplicate,
    } });
    Object.assign(source.mistakes, { "i-sk-4-8": {
      questionId: "i-sk-4-8",
      question: legacyDuplicate,
      timesWrong: 1,
      consecutiveCorrect: 0,
      lastWrongAt: "2026-11-20T10:00:00.000Z",
      isMastered: false,
    } });
    const migrated = migrateStorageData(source);
    expect(migrated?.attempts[0].answers["i-sk-3-8"].question.id).toBe("i-sk-3-8");
    expect(migrated?.mistakes["i-sk-3-8"].questionId).toBe("i-sk-3-8");
  });

  it("rejects malformed data without producing a blank replacement", () => {
    expect(migrateStorageData({ version: "1.0", profile: {}, attempts: [] })).toBeNull();
  });
});
