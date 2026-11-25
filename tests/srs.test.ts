import { describe, expect, it } from "vitest";
import { createSrsCard, isSrsMastered, scheduleSrsReview } from "@/lib/srs";

const start = "2026-01-01T12:00:00.000Z";

describe("SRS scheduling", () => {
  it("starts new cards due immediately", () => {
    const card = createSrsCard("vocabulary:v-hsk1-1", "vocabulary", start);
    expect(card.dueAt).toBe(start);
    expect(card.intervalDays).toBe(0);
    expect(isSrsMastered(card)).toBe(false);
  });

  it("uses the short SM-2 intervals and graduates after a long interval", () => {
    let card = createSrsCard("question:q1", "question", start);
    card = scheduleSrsReview(card, 5, start);
    expect(card.intervalDays).toBe(1);
    card = scheduleSrsReview(card, 5, card.dueAt);
    expect(card.intervalDays).toBe(6);
    card = scheduleSrsReview(card, 5, card.dueAt);
    expect(card.intervalDays).toBeGreaterThanOrEqual(15);
    expect(isSrsMastered(card)).toBe(false);
    card = scheduleSrsReview(card, 5, card.dueAt);
    expect(isSrsMastered(card)).toBe(true);
    expect(card.dueAt).toBe("2026-03-15T12:00:00.000Z");
  });

  it("resets repetitions after a difficult recall and schedules the next day", () => {
    const card = scheduleSrsReview(
      { ...createSrsCard("question:q2", "question", start), repetitions: 3, intervalDays: 21 },
      1,
      start
    );
    expect(card.repetitions).toBe(0);
    expect(card.intervalDays).toBe(1);
    expect(card.dueAt).toBe("2026-01-02T12:00:00.000Z");
    expect(isSrsMastered(card)).toBe(false);
  });

  it("rejects invalid review timestamps", () => {
    expect(() => createSrsCard("question:q3", "question", "invalid")).toThrow();
  });
});
