import { describe, expect, it } from "vitest";
import { mockTopics, mockVocabulary } from "@/data/mock";

describe("topic vocabulary data", () => {
  it("provides 8–10 complete cards for every topic", () => {
    for (const topic of mockTopics) {
      const words = mockVocabulary.filter((item) => item.topicId === topic.id);
      expect(words.length, `${topic.id} vocabulary count`).toBeGreaterThanOrEqual(8);
      expect(words.length, `${topic.id} vocabulary count`).toBeLessThanOrEqual(10);
      for (const word of words) {
        expect(word.hanzi.trim()).not.toBe("");
        expect(word.pinyin.trim()).not.toBe("");
        expect(word.hanViet.trim()).not.toBe("");
        expect(word.examplePinyin.trim()).not.toBe("");
      }
    }
  });

  it("marks vocabulary with newly supplied Hán Việt or Pinyin for native-speaker review", () => {
    expect(mockVocabulary.filter((item) => item.needsReview === true)).toHaveLength(88);
  });
});
