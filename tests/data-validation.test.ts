import { describe, expect, it } from "vitest";
import { allMockExams } from "@/data/mock";
import { formatValidationErrors, validateExamData } from "@/data/mock/validation";

describe("mock question bank validation", () => {
  it("contains no duplicate IDs or incomplete question records", () => {
    const errors = validateExamData(allMockExams);
    expect(errors, formatValidationErrors(errors)).toEqual([]);
  });
});
