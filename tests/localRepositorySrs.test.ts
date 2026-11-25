import { afterEach, describe, expect, it, vi } from "vitest";
import { localRepository } from "@/services/localRepository";
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
    expect(JSON.parse(storage.getItem("hanyu:v2") || "{}").version).toBe("2.1");

    const card = await localRepository.addVocabularyToSrs("v-hsk1-1");
    expect(card?.itemId).toBe("vocabulary:v-hsk1-1");
    expect((await localRepository.getDueSrsItems()).some((item) => item.kind === "vocabulary")).toBe(true);
  });
});
