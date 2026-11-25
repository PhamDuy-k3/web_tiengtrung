import { describe, expect, it } from "vitest";
import { localRepository } from "@/services/localRepository";

describe("LocalRepository content review queue", () => {
  it("collects flagged questions and vocabulary with stable, unique item IDs", async () => {
    const items = await localRepository.getContentReviewItems();
    expect(items.length).toBeGreaterThan(0);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(items.some((item) => item.kind === "question")).toBe(true);
    expect(items.some((item) => item.kind === "vocabulary")).toBe(true);
    expect(items.every((item) => item.reason.trim().length > 0)).toBe(true);
  });
});
