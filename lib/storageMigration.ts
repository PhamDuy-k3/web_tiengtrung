import {
  AnswerValue,
  ExamAttempt,
  LocalStorageData,
  MistakeEntry,
  Question,
  QuestionResult,
  UserProfile,
} from "@/types";

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
    id: value.id,
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
    answers[id] = result;
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
    questionId: value.questionId,
    question,
    timesWrong: typeof value.timesWrong === "number" ? value.timesWrong : 0,
    consecutiveCorrect: typeof value.consecutiveCorrect === "number" ? value.consecutiveCorrect : 0,
    lastWrongAt: typeof value.lastWrongAt === "string" ? value.lastWrongAt : new Date(0).toISOString(),
    isMastered: value.isMastered === true,
    lastUserAnswer: isAnswerValue(value.lastUserAnswer) ? value.lastUserAnswer : null,
  };
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
      mistakes[id] = mistake;
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

  return {
    version: "2.0",
    profile: value.profile,
    attempts,
    mistakes,
    progress,
  };
}
