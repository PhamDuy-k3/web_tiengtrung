import type { Question } from "@/types";

export interface AdaptiveSelectionOptions {
  questions: Question[];
  count: number;
  tagWeights?: Record<string, number>;
  dueQuestionIds?: string[];
  focusTags?: string[];
  targetDifficulty?: number;
  random?: () => number;
}

/** Selects unique questions by weight, without changing or duplicating source questions. */
export function selectAdaptiveQuestions({
  questions,
  count,
  tagWeights = {},
  dueQuestionIds = [],
  focusTags = [],
  targetDifficulty = 3,
  random = Math.random,
}: AdaptiveSelectionOptions): Question[] {
  if (!Number.isInteger(count) || count < 1) throw new Error("Số câu hỏi cần sinh phải là số nguyên dương.");

  const uniqueQuestions = Array.from(new Map(questions.map((question) => [question.id, question])).values());
  if (uniqueQuestions.length < count) throw new Error(`Không đủ câu hỏi riêng biệt để tạo đề ${count} câu.`);

  const normalizedTarget = Math.min(5, Math.max(1, targetDifficulty));
  const dueIds = new Set(dueQuestionIds);
  const focus = new Set(focusTags);
  const taggedCandidates = focus.size > 0
    ? uniqueQuestions.filter((question) => question.tags.some((tag) => focus.has(tag)))
    : [];
  const candidatePool = taggedCandidates.length >= count ? taggedCandidates : uniqueQuestions;
  const remaining = [...candidatePool];
  const selected: Question[] = [];

  while (selected.length < count) {
    const weights = remaining.map((question) => {
      const tagWeight = question.tags.reduce((sum, tag) => sum + Math.max(0, tagWeights[tag] ?? 0), 0);
      const focusBoost = question.tags.some((tag) => focus.has(tag)) ? 8 : 0;
      const dueBoost = dueIds.has(question.id) ? 5 : 0;
      const difficultyBoost = Math.max(0, 6 - Math.abs(question.difficulty - normalizedTarget) * 1.5);
      return Math.max(0.1, 1 + tagWeight + focusBoost + dueBoost + difficultyBoost);
    });
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const sample = Math.min(0.999999999, Math.max(0, random())) * totalWeight;
    let cursor = 0;
    let pickedIndex = weights.length - 1;
    for (let index = 0; index < weights.length; index += 1) {
      cursor += weights[index];
      if (sample < cursor) {
        pickedIndex = index;
        break;
      }
    }
    selected.push(remaining[pickedIndex]);
    remaining.splice(pickedIndex, 1);
  }

  return selected;
}
