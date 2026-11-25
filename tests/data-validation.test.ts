import { describe, expect, it } from "vitest";
import { allMockExams } from "@/data/mock";
import { formatValidationErrors, listQuestionsNeedingReview, validateExamData } from "@/data/mock/validation";

describe("mock question bank validation", () => {
  it("contains no duplicate IDs or incomplete question records", () => {
    const errors = validateExamData(allMockExams);
    expect(errors, formatValidationErrors(errors)).toEqual([]);
  });

  it("lists uncertain source items for language review", () => {
    expect(listQuestionsNeedingReview(allMockExams)).toContain("adv-van-hoa-1/a-vh-1-4");
  });
});
