import type { Question } from "@/types";
import type { GrammarLessonSource } from "@/types/grammar";

/** Checks grammar lesson provenance, completeness, and links to the question bank. */
export function validateGrammarLessons(
  lessons: readonly GrammarLessonSource[],
  questions: readonly Question[]
): string[] {
  const errors: string[] = [];
  const lessonIds = new Set<string>();
  const questionIds = new Set(questions.map((question) => question.id));

  for (const lesson of lessons) {
    if (lessonIds.has(lesson.id)) errors.push(`${lesson.id}: grammar lesson ID bị trùng.`);
    lessonIds.add(lesson.id);
    if (new Set(lesson.sourceQuestionIds).size !== lesson.sourceQuestionIds.length) {
      errors.push(`${lesson.id}: sourceQuestionIds có ID bị trùng.`);
    }
    for (const questionId of lesson.sourceQuestionIds) {
      if (!questionIds.has(questionId)) errors.push(`${lesson.id}: không tìm thấy câu nguồn ${questionId}.`);
    }
    const sourcedExampleCount = lesson.sourceQuestionIds.length + (lesson.externalExamples?.length ?? 0);
    if (sourcedExampleCount < 2 && !lesson.needsReview) {
      errors.push(`${lesson.id}: cần ít nhất hai ví dụ nguồn hoặc needsReview=true.`);
    }
    for (const example of lesson.externalExamples ?? []) {
      if (!example.sourceTitle?.trim() || !example.sourceUrl || !/^https:\/\//.test(example.sourceUrl)) {
        errors.push(`${lesson.id}: ví dụ ngoài cần tên nguồn và URL HTTPS.`);
      }
    }
    if (lesson.needsReview && !lesson.reviewNote?.trim()) {
      errors.push(`${lesson.id}: bài cần rà soát phải có reviewNote.`);
    }
  }

  for (const question of questions) {
    if (question.grammarPointId && !lessonIds.has(question.grammarPointId)) {
      errors.push(`${question.id}: grammarPointId không trỏ tới bài học nào.`);
    }
  }
  return errors;
}
