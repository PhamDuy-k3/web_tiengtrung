import { Exam, Question, QuestionType } from "@/types";

const questionTypes: QuestionType[] = [
  "word_order",
  "multiple_choice",
  "fill_in_blank",
  "matching",
  "listen_choice",
  "listen_word_order",
  "pinyin_choice",
  "short_translate",
  "hanzi_write",
];

function isRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateExamData(exams: Exam[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const exam of exams) {
    for (const question of exam.questions) {
      const label = `${exam.id}/${question.id || "<missing-id>"}`;
      if (!question.id.trim()) errors.push(`${label}: thiếu ID câu hỏi.`);
      else if (seenIds.has(question.id)) errors.push(`${label}: ID câu hỏi bị trùng.`);
      else seenIds.add(question.id);

      if (!questionTypes.includes(question.type)) {
        errors.push(`${label}: dạng bài không hợp lệ (${String(question.type)}).`);
      }
      if (typeof question.version !== "number" || !Number.isInteger(question.version) || question.version < 1) {
        errors.push(`${label}: version phải là số nguyên từ 1 trở lên.`);
      }
      if (![1, 2, 3, 4, 5].includes(question.difficulty)) {
        errors.push(`${label}: difficulty phải nằm trong khoảng 1–5.`);
      }
      if (!question.prompt?.trim()) errors.push(`${label}: thiếu prompt.`);
      if (!question.explanation?.trim()) errors.push(`${label}: thiếu explanation.`);
      if (question.pinyin !== undefined && !question.pinyin.trim()) {
        errors.push(`${label}: trường Pinyin đang rỗng.`);
      }
      if (question.acceptedAnswers?.some((answer) => answer === "" || (Array.isArray(answer) && answer.length === 0))) {
        errors.push(`${label}: acceptedAnswers có đáp án rỗng.`);
      }

      if (question.needsReview === true) continue;

      switch (question.type) {
        case "multiple_choice":
        case "listen_choice":
        case "pinyin_choice":
          if (!question.options?.length) errors.push(`${label}: dạng ${question.type} cần options.`);
          if (typeof question.correctAnswer !== "string") errors.push(`${label}: đáp án chuẩn cần là chuỗi.`);
          break;
        case "matching":
          if (!question.pairs?.length) errors.push(`${label}: dạng matching cần ít nhất một cặp.`);
          if (!isRecord(question.correctAnswer)) errors.push(`${label}: đáp án matching cần là record.`);
          break;
        case "word_order":
        case "listen_word_order":
          if (!question.tiles?.length && !Array.isArray(question.correctAnswer)) {
            errors.push(`${label}: dạng ${question.type} cần tiles hoặc đáp án dạng mảng.`);
          }
          break;
        case "fill_in_blank":
        case "short_translate":
          if (typeof question.correctAnswer !== "string" && !Array.isArray(question.correctAnswer)) {
            errors.push(`${label}: dạng ${question.type} cần đáp án chuỗi hoặc danh sách đáp án.`);
          }
          break;
        case "hanzi_write":
          if (!question.chineseText?.trim() || Array.from(question.chineseText).length !== 1) {
            errors.push(`${label}: hanzi_write cần đúng một chữ Hán trong chineseText.`);
          }
          if (typeof question.correctAnswer !== "string") errors.push(`${label}: hanzi_write cần đáp án chuỗi.`);
          break;
      }
    }
  }
  return errors;
}

export function listQuestionsNeedingReview(exams: Exam[]): string[] {
  return exams.flatMap((exam) => exam.questions
    .filter((question) => question.needsReview === true)
    .map((question) => `${exam.id}/${question.id}`));
}

export function formatValidationErrors(errors: string[]): string {
  return errors.length === 0
    ? "Dữ liệu câu hỏi hợp lệ."
    : `Phát hiện ${errors.length} lỗi dữ liệu:\n${errors.map((error) => `- ${error}`).join("\n")}`;
}

export function validateQuestion(question: Question, examId = "<exam>"): string[] {
  return validateExamData([{ id: examId, topicId: "", levelId: "basic", title: "", description: "", questions: [question] }]);
}
