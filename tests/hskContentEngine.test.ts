import { describe, expect, it } from "vitest";
import { mockTopics, mockVocabulary } from "@/data/mock";
import {
  buildLessonVocabContext,
  getStrictLevelVocabPool,
  hskLevelToBand,
  hskLevelToLevelId,
  selfCheck,
} from "@/lib/hskContentEngine";
import { generateAssessmentRoadmap } from "@/lib/assessmentEngine";
import { buildRoadmapLessonPlan } from "@/lib/roadmapStudy";
import { localRepository } from "@/services/localRepository";

describe("HSK level & topic alignment", () => {
  it("every vocabulary item belongs to the same HSK band as its topic", () => {
    const topicById = new Map(mockTopics.map((t) => [t.id, t]));
    for (const word of mockVocabulary) {
      const topic = topicById.get(word.topicId);
      expect(topic, `Missing topic for ${word.id}`).toBeDefined();
      expect(
        hskLevelToLevelId(word.hskLevel),
        `${word.id} (${word.hanzi}, HSK ${word.hskLevel}) does not match topic ${word.topicId} (${topic!.levelId})`
      ).toBe(topic!.levelId);
    }
  });

  it("buildLessonVocabContext separates targetVocab (exact level) and supportVocab (strictly lower)", () => {
    const ctx = buildLessonVocabContext(5, "adv-xa-hoi");
    expect(ctx.band).toBe("nang_cao");
    expect(ctx.targetVocab.length).toBeGreaterThan(0);
    expect(ctx.targetVocab.every((v) => v.hskLevel === 5)).toBe(true);
    expect(ctx.supportVocab.every((v) => v.hskLevel < 5)).toBe(true);
  });

  it("getStrictLevelVocabPool never falls back to lower-band vocabulary for HSK 5 or 6", () => {
    const pool5 = getStrictLevelVocabPool(5, ["xã", "hội"], 5);
    expect(pool5.length).toBeGreaterThanOrEqual(5);
    expect(pool5.every((v) => hskLevelToLevelId(v.hskLevel) === "advanced")).toBe(true);

    const pool6 = getStrictLevelVocabPool(6, ["triết", "lý"], 5);
    expect(pool6.length).toBeGreaterThanOrEqual(5);
    expect(pool6.every((v) => hskLevelToLevelId(v.hskLevel) === "advanced")).toBe(true);
  });

  it("roadmap lesson plan for HSK 5 only selects advanced vocabulary and questions", () => {
    const roadmap = generateAssessmentRoadmap({
      verified_level: 4,
      target_level: 5,
      daily_minutes: 30,
    });
    const hsk5Lesson = roadmap.weeks
      .flatMap((w) => w.lessons)
      .find((l) => /HSK\s*5/i.test(l.topic));
    expect(hsk5Lesson).toBeDefined();

    const plan = buildRoadmapLessonPlan(roadmap, hsk5Lesson!.id);
    expect(plan).not.toBeNull();
    expect(plan!.hskLevel).toBe(5);
    expect(plan!.levelId).toBe("advanced");

    const cardHanzis = new Set(plan!.studyCards.map((c) => c.hanzi));
    for (const item of mockVocabulary) {
      if (cardHanzis.has(item.hanzi)) {
        expect(item.hskLevel).toBeGreaterThanOrEqual(5);
      }
    }
    expect(plan!.practiceQuestions.every((q) => hskLevelToLevelId(q.hskLevel) === "advanced")).toBe(true);
  });

  it("getVocabularyForTopic returns only level-appropriate vocabulary", async () => {
    for (const topic of mockTopics) {
      const words = await localRepository.getVocabularyForTopic(topic.id);
      expect(words.length).toBeGreaterThanOrEqual(5);
      expect(words.every((w) => hskLevelToLevelId(w.hskLevel) === topic.levelId)).toBe(true);
    }
  });

  it("selfCheck passes when topic and vocabulary match level rules", () => {
    const ctx = buildLessonVocabContext(5, "adv-kinh-te");
    const check = selfCheck(
      ctx.targetVocab,
      ctx.supportVocab,
      ctx.targetVocab.map((v) => v.hanzi),
      "adv-kinh-te",
      5
    );
    expect(check.off_topic_items).toEqual([]);
    expect(check.words_above_level).toEqual([]);
    expect(check.target_words_below_level).toEqual([]);
    expect(hskLevelToBand(5)).toBe("nang_cao");
  });
});
