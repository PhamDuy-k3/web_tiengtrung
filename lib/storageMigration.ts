import {
  AnswerValue,
  ExamAttempt,
  LocalStorageData,
  MistakeEntry,
  Question,
  QuestionResult,
  UserProfile,
} from "@/types";
import { createSrsCard } from "@/lib/srs";
import type { SrsCard } from "@/types/srs";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnswerValue(value: unknown): value is AnswerValue {
  return typeof value === "string" ||
    (Array.isArray(value) && value.every((part) => typeof part === "string")) ||
    (isRecord(value) && Object.values(value).every((part) => typeof part === "string"));
}

function difficultyFor(hskLevel: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, hskLevel)) as 1 | 2 | 3 | 4 | 5;
}

function stableQuestionId(value: UnknownRecord): string {
  // The v1 bank accidentally reused this ID for two different listening questions.
  if (value.id === "i-sk-4-8" && value.chineseText === "笑一笑，十年少。") {
    return "i-sk-3-8";
  }
  return value.id as string;
}

function migrateQuestion(value: unknown): Question | null {
  if (!isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.type !== "string" ||
    typeof value.hskLevel !== "number" ||
    value.hskLevel < 1 || value.hskLevel > 6 ||
    typeof value.topicId !== "string" ||
    !Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === "string") ||
    typeof value.prompt !== "string" ||
    typeof value.explanation !== "string" ||
    !isAnswerValue(value.correctAnswer)) {
    return null;
  }

  return {
    ...value,
    id: stableQuestionId(value),
    version: typeof value.version === "number" && value.version > 0 ? value.version : 1,
    type: value.type as Question["type"],
    hskLevel: value.hskLevel as Question["hskLevel"],
    difficulty: typeof value.difficulty === "number"
      ? difficultyFor(value.difficulty)
      : difficultyFor(value.hskLevel),
    topicId: value.topicId,
    tags: value.tags,
    prompt: value.prompt,
    correctAnswer: value.correctAnswer,
    explanation: value.explanation,
  };
}

function migrateQuestionResult(value: unknown): QuestionResult | null {
  if (!isRecord(value)) return null;
  const question = migrateQuestion(value.question);
  if (!question || typeof value.isCorrect !== "boolean") return null;
  const userAnswer = isAnswerValue(value.userAnswer) ? value.userAnswer : null;
  const score = typeof value.score === "number" && Number.isFinite(value.score)
    ? Math.max(0, Math.min(100, Math.round(value.score)))
    : value.isCorrect ? 100 : 0;
  return {
    userAnswer,
    isCorrect: score === 100,
    score,
    matchedAnswer: isAnswerValue(value.matchedAnswer)
      ? value.matchedAnswer
      : question.correctAnswer,
    feedback: typeof value.feedback === "string" ? value.feedback : question.explanation,
    question,
  };
}

function migrateAttempt(value: unknown): ExamAttempt | null {
  if (!isRecord(value) || !isRecord(value.answers) ||
    typeof value.id !== "string" ||
    typeof value.examId !== "string" ||
    typeof value.levelId !== "string" ||
    typeof value.examTitle !== "string") {
    return null;
  }
  const answers: Record<string, QuestionResult> = {};
  for (const [id, rawResult] of Object.entries(value.answers)) {
    const result = migrateQuestionResult(rawResult);
    if (!result) return null;
    answers[result.question.id || id] = result;
  }
  const score = typeof value.score === "number" ? value.score : 0;
  return {
    ...value,
    id: value.id,
    examId: value.examId,
    levelId: value.levelId as ExamAttempt["levelId"],
    examTitle: value.examTitle,
    score,
    totalQuestions: typeof value.totalQuestions === "number" ? value.totalQuestions : Object.keys(answers).length,
    correctCount: typeof value.correctCount === "number" ? value.correctCount : Object.values(answers).filter((a) => a.isCorrect).length,
    incorrectCount: typeof value.incorrectCount === "number" ? value.incorrectCount : Object.values(answers).filter((a) => !a.isCorrect).length,
    answers,
    durationSeconds: typeof value.durationSeconds === "number" ? value.durationSeconds : 0,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date(0).toISOString(),
  };
}

function migrateMistake(value: unknown): MistakeEntry | null {
  if (!isRecord(value) || typeof value.questionId !== "string") return null;
  const question = migrateQuestion(value.question);
  if (!question) return null;
  return {
    ...value,
    questionId: question.id,
    question,
    timesWrong: typeof value.timesWrong === "number" ? value.timesWrong : 0,
    consecutiveCorrect: typeof value.consecutiveCorrect === "number" ? value.consecutiveCorrect : 0,
    lastWrongAt: typeof value.lastWrongAt === "string" ? value.lastWrongAt : new Date(0).toISOString(),
    isMastered: value.isMastered === true,
    lastUserAnswer: isAnswerValue(value.lastUserAnswer) ? value.lastUserAnswer : null,
  };
}

function isSrsCard(value: unknown, itemId: string): value is SrsCard {
  if (!isRecord(value)) return false;
  return value.itemId === itemId &&
    (value.itemType === "question" || value.itemType === "vocabulary") &&
    typeof value.intervalDays === "number" && value.intervalDays >= 0 &&
    typeof value.repetitions === "number" && value.repetitions >= 0 &&
    typeof value.easeFactor === "number" && value.easeFactor >= 1.3 &&
    typeof value.dueAt === "string" && !Number.isNaN(Date.parse(value.dueAt)) &&
    typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt)) &&
    (value.lastReviewedAt === undefined || (typeof value.lastReviewedAt === "string" && !Number.isNaN(Date.parse(value.lastReviewedAt))));
}

function migrateSrsCards(
  value: unknown,
  mistakes: Record<string, MistakeEntry>,
  now: string
): Record<string, SrsCard> | null {
  if (value !== undefined) {
    if (!isRecord(value)) return null;
    const cards: Record<string, SrsCard> = {};
    for (const [itemId, rawCard] of Object.entries(value)) {
      if (!isSrsCard(rawCard, itemId)) return null;
      cards[itemId] = rawCard;
    }
    return cards;
  }

  const cards: Record<string, SrsCard> = {};
  for (const mistake of Object.values(mistakes)) {
    const itemId = `question:${mistake.questionId}`;
    const initial = createSrsCard(itemId, "question", now);
    cards[itemId] = mistake.isMastered
      ? {
          ...initial,
          intervalDays: 21,
          repetitions: 3,
          dueAt: new Date(Date.parse(now) + 21 * 24 * 60 * 60 * 1000).toISOString(),
          lastReviewedAt: now,
          lastQuality: 5,
        }
      : initial;
  }
  return cards;
}

function isProfile(value: unknown): value is UserProfile {
  return isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.streak === "number" &&
    typeof value.lastActiveDate === "string" &&
    Array.isArray(value.unlockedLevels) &&
    Array.isArray(value.completedLevelTests) &&
    Array.isArray(value.badges) &&
    typeof value.totalXp === "number";
}

/** Convert the v1 localStorage/export shape to the current v2 shape without mutating its source. */
export function migrateStorageData(value: unknown): LocalStorageData | null {
  if (!isRecord(value) || !isProfile(value.profile) || !Array.isArray(value.attempts)) {
    return null;
  }

  const attempts: ExamAttempt[] = [];
  for (const rawAttempt of value.attempts) {
    const attempt = migrateAttempt(rawAttempt);
    if (!attempt) return null;
    attempts.push(attempt);
  }

  const mistakes: Record<string, MistakeEntry> = {};
  if (isRecord(value.mistakes)) {
    for (const [id, rawMistake] of Object.entries(value.mistakes)) {
      const mistake = migrateMistake(rawMistake);
      if (!mistake) return null;
      mistakes[mistake.questionId || id] = mistake;
    }
  }

  const progress: LocalStorageData["progress"] = {};
  if (isRecord(value.progress)) {
    for (const [id, rawProgress] of Object.entries(value.progress)) {
      if (!isRecord(rawProgress) || typeof rawProgress.bestScore !== "number" || typeof rawProgress.attempts !== "number") {
        return null;
      }
      progress[id] = { bestScore: rawProgress.bestScore, attempts: rawProgress.attempts };
    }
  }

  const now = new Date().toISOString();
  const srs = migrateSrsCards(value.srs, mistakes, now);
  if (!srs) return null;

  return {
    version: "2.1",
    profile: value.profile,
    attempts,
    mistakes,
    progress,
    srs,
  };
}
