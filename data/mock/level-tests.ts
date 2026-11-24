import { Exam, LevelId, Question } from "@/types";
import { basicExams } from "./exams/basic";
import { intermediateExams } from "./exams/intermediate";
import { advancedExams } from "./exams/advanced";
import { shuffleArray } from "@/lib/shuffle";

export const allMockExams: Exam[] = [
  ...basicExams,
  ...intermediateExams,
  ...advancedExams,
];

/**
 * Returns all questions belonging to a specific level
 */
export function getQuestionsByLevel(levelId: LevelId): Question[] {
  const exams = allMockExams.filter((e) => e.levelId === levelId);
  const questions: Question[] = [];
  exams.forEach((ex) => questions.push(...ex.questions));
  return questions;
}

/**
 * Generates a 40-question comprehensive Level-Up Exam for the given level.
 * Covers all topics and all 8 question types with a 40-minute time limit.
 */
export function buildLevelTest(levelId: LevelId, seed?: number): Exam {
  const pool = getQuestionsByLevel(levelId);
  const shuffled = shuffleArray(pool, seed);
  // Pick 40 questions (or all if pool is smaller, but here pool has 120-160 questions)
  const selected = shuffled.slice(0, 40);

  const levelNames: Record<LevelId, string> = {
    basic: "Cơ bản (HSK 1-2)",
    intermediate: "Trung cấp (HSK 3-4)",
    advanced: "Nâng cao (HSK 5-6)",
  };

  return {
    id: `level-test-${levelId}`,
    topicId: `level-test-topic-${levelId}`,
    levelId,
    title: `Bài kiểm tra lên cấp - ${levelNames[levelId]}`,
    description: `Đề thi tổng hợp 40 câu ngẫu nhiên từ toàn bộ kho đề cấp độ ${levelNames[levelId]}. Đạt từ 80% (32/40 câu) để hoàn thành cấp và mở khóa cấp tiếp theo!`,
    questions: selected,
    isLevelTest: true,
    timeLimitSeconds: 40 * 60, // 40 minutes
  };
}

/**
 * Generates a 30-question Placement Test (Bài kiểm tra xếp lớp đầu vào):
 * - 10 câu Cơ bản (HSK 1-2)
 * - 10 câu Trung cấp (HSK 3-4)
 * - 10 câu Nâng cao (HSK 5-6)
 */
export function buildPlacementTest(seed?: number): Exam {
  const basicPool = shuffleArray(getQuestionsByLevel("basic"), seed).slice(0, 10);
  const interPool = shuffleArray(getQuestionsByLevel("intermediate"), (seed || 1) + 1).slice(0, 10);
  const advPool = shuffleArray(getQuestionsByLevel("advanced"), (seed || 1) + 2).slice(0, 10);

  const combined = [...basicPool, ...interPool, ...advPool];

  return {
    id: "placement-test-standard",
    topicId: "placement-topic",
    levelId: "basic",
    title: "Bài kiểm tra trình độ đầu vào (HSK 1 - 6)",
    description: "Đề thi phân loại gồm 30 câu hỏi từ sơ cấp đến cao cấp (10 câu Cơ bản, 10 câu Trung cấp, 10 câu Nâng cao). Dựa vào kết quả, hệ thống sẽ đề xuất cấp học phù hợp nhất cho bạn!",
    questions: combined,
    isPlacementTest: true,
    timeLimitSeconds: 30 * 60, // 30 minutes
  };
}
