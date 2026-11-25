import { afterEach, describe, expect, it, vi } from "vitest";
import { localRepository } from "@/services/localRepository";
import { mockVocabulary } from "@/data/mock";
import type { Question, QuestionResult } from "@/types";

function mockStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

function question(): Question {
  return {
    id: "srs-test-question",
    version: 1,
    type: "multiple_choice",
    hskLevel: 1,
    difficulty: 1,
    topicId: "test-topic",
    tags: ["test"],
    prompt: "Choose one answer",
    options: ["A", "B"],
    correctAnswer: "A",
    explanation: "Test explanation.",
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("LocalRepository SRS", () => {
  it("stores question reports in the exported local backup", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    const report = await localRepository.reportQuestion({
      questionId: "reported-question",
      examId: "reported-exam",
      prompt: "Question prompt",
      reason: "Sai đáp án",
      details: "Ghi chú của người học",
    });
    expect(report.id).toBeTruthy();
    const backup = JSON.parse(await localRepository.exportData());
    expect(backup.version).toBe("2.4");
    expect(backup.reportedQuestions).toEqual([report]);
  });

  it("queues wrong questions due now and schedules reviewed cards", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    const q = question();
    const result: QuestionResult = {
      question: q,
      userAnswer: "B",
      isCorrect: false,
      score: 0,
      matchedAnswer: "A",
      feedback: "Try again.",
    };

    await localRepository.updateMistakes({ [q.id]: result });
    const due = await localRepository.getDueSrsItems();
    expect(due).toHaveLength(1);
    expect(due[0].kind).toBe("question");

    const itemId = due[0].card.itemId;
    const scheduled = await localRepository.reviewSrsItem(itemId, 1, "2026-01-01T12:00:00.000Z");
    expect(scheduled?.dueAt).toBe("2026-01-02T12:00:00.000Z");
    expect(await localRepository.getDueSrsItems("2026-01-01T12:00:00.000Z")).toHaveLength(0);
  });

  it("adds vocabulary cards and persists migration of older v2 data", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    storage.setItem("hanyu:v2", JSON.stringify({
      version: "2.0",
      profile: {
        name: "Old learner",
        streak: 3,
        lastActiveDate: "2026-11-20",
        unlockedLevels: ["basic"],
        completedLevelTests: [],
        badges: [],
        totalXp: 100,
      },
      attempts: [],
      mistakes: {},
      progress: {},
    }));

    const profile = await localRepository.getProfile();
    expect(profile.name).toBe("Old learner");
    expect(JSON.parse(storage.getItem("hanyu:v2") || "{}").version).toBe("2.4");

    const card = await localRepository.addVocabularyToSrs("v-hsk1-1");
    expect(card?.itemId).toBe("vocabulary:v-hsk1-1");
    expect((await localRepository.getDueSrsItems()).some((item) => item.kind === "vocabulary")).toBe(true);
  });

  it("loads topic vocabulary and stores lesson completion with SRS cards", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    const words = await localRepository.getVocabularyForTopic("basic-chao-hoi");
    expect(words.length).toBeGreaterThanOrEqual(5);

    const selectedIds = words.slice(0, 5).map((word) => word.id);
    await localRepository.completeTopicLesson("basic-chao-hoi", selectedIds);

    expect(await localRepository.getCompletedLessons()).toContain("basic-chao-hoi");
    const dueVocabulary = (await localRepository.getDueSrsItems()).filter((item) => item.kind === "vocabulary");
    expect(dueVocabulary.map((item) => item.card.itemId)).toEqual(
      expect.arrayContaining(selectedIds.map((id) => `vocabulary:${id}`))
    );
    expect(mockVocabulary.some((word) => word.topicId === "basic-chao-hoi")).toBe(true);
  });

  it("rejects vocabulary IDs that do not belong to the completed topic", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);

    await expect(localRepository.completeTopicLesson("basic-chao-hoi", ["v-hsk5-1"])).rejects.toThrow(
      "Bài học có từ vựng không thuộc chủ đề này."
    );
    expect(await localRepository.getCompletedLessons()).toEqual([]);
  });

  it("generates a type-specific exam with unique questions", async () => {
    const exam = await localRepository.getExam("type-practice-basic-multiple_choice");
    expect(exam).not.toBeNull();
    expect(exam?.questions.length).toBeGreaterThan(0);
    expect(exam?.questions.length).toBeLessThanOrEqual(10);
    expect(exam?.questions.every((item) => item.type === "multiple_choice")).toBe(true);
    expect(new Set(exam?.questions.map((item) => item.id)).size).toBe(exam?.questions.length);
  });

  it("generates ten-question weak-area and adaptive exams with unique questions", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    const q = question();
    const failed: QuestionResult = {
      question: q,
      userAnswer: "B",
      isCorrect: false,
      score: 0,
      matchedAnswer: "A",
      feedback: "Incorrect.",
    };
    const attempt = await localRepository.submitAttempt({
      examId: "weak-area-source",
      levelId: "basic",
      examTitle: "Source attempt",
      answers: { [q.id]: failed },
      durationSeconds: 5,
    });

    const weak = await localRepository.getExam(`weak-area-${attempt.id}`);
    const adaptive = await localRepository.getExam("adaptive-basic");
    for (const generated of [weak, adaptive]) {
      expect(generated?.questions).toHaveLength(10);
      expect(new Set(generated?.questions.map((item) => item.id)).size).toBe(10);
      expect(generated?.questions.every((item) => item.hskLevel <= 2)).toBe(true);
    }
  });

  it("awards the daily exam mission XP once and counts today's attempts", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    const before = await localRepository.getProfile();
    const q = question();
    const answer: QuestionResult = {
      question: q,
      userAnswer: "A",
      isCorrect: true,
      score: 100,
      matchedAnswer: "A",
      feedback: "Correct.",
    };
    const payload = {
      examId: "daily-mission-test",
      levelId: "basic" as const,
      examTitle: "Daily mission test",
      answers: { [q.id]: answer },
      durationSeconds: 10,
    };

    await localRepository.submitAttempt(payload);
    await localRepository.submitAttempt(payload);

    const after = await localRepository.getProfile();
    const mission = await localRepository.getDailyMissionProgress();
    expect(after.totalXp - before.totalXp).toBe(315);
    expect(mission.examsCompleted).toBe(2);
    expect(mission.examRewardClaimed).toBe(true);
  });

  it("awards the review mission after ten distinct SRS cards and advances streak", async () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);
    const reviewedAt = "2026-11-25T12:00:00.000Z";
    const before = await localRepository.getProfile();
    const ids = mockVocabulary.slice(0, 10).map((word) => word.id);
    for (const id of ids) await localRepository.addVocabularyToSrs(id);
    for (const id of ids) await localRepository.reviewSrsItem(`vocabulary:${id}`, 5, reviewedAt);

    const after = await localRepository.getProfile();
    const mission = await localRepository.getDailyMissionProgress("2026-11-25");
    expect(mission.reviewsCompleted).toBe(10);
    expect(mission.reviewRewardClaimed).toBe(true);
    expect(after.totalXp - before.totalXp).toBe(20);
    expect(after.lastActiveDate).toBe("2026-11-25");
  });
});
