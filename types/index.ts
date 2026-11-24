export type LevelId = "basic" | "intermediate" | "advanced";

export interface Level {
  id: LevelId;
  name: string;
  hskSpan: string;
  description: string;
  badge: string;
  color: string;
  requiredExamsPct: number; // e.g. 70
  minPassingScorePct: number; // e.g. 60
  levelTestPassingScorePct: number; // e.g. 80
}

export interface Topic {
  id: string;
  levelId: LevelId;
  name: string;
  icon: string;
  description: string;
  examCount: number;
}

export type QuestionType =
  | "word_order"
  | "multiple_choice"
  | "fill_in_blank"
  | "matching"
  | "listen_choice"
  | "listen_word_order"
  | "pinyin_choice"
  | "short_translate";

export interface MatchingPair {
  id: string;
  left: string; // Chinese or Pinyin
  pinyin?: string;
  right: string; // Vietnamese meaning
}

export interface Question {
  id: string;
  type: QuestionType;
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6;
  topicId: string;
  tags: string[]; // e.g. ['từ_vựng', 'ngữ_pháp_câu_chữ_bả']
  prompt: string;
  chineseText?: string;
  pinyin?: string;
  vietnamese?: string;
  options?: string[];
  pairs?: MatchingPair[];
  tiles?: string[];
  distractors?: string[]; // Extra distractor options or matching items
  distractorTiles?: string[]; // Extra distractor tiles for word ordering
  orderDirection?: "zh_to_vn" | "vn_to_zh";
  correctAnswer: string | string[] | Record<string, string>;
  explanation: string;
}

export interface Exam {
  id: string;
  topicId: string;
  levelId: LevelId;
  title: string;
  description: string;
  questions: Question[];
  isRandom?: boolean;
  isMistakeReview?: boolean;
  isLevelTest?: boolean;
  isPlacementTest?: boolean;
  timeLimitSeconds?: number;
}

export interface QuestionResult {
  userAnswer: any;
  isCorrect: boolean;
  question: Question;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  levelId: LevelId;
  topicId?: string;
  examTitle: string;
  score: number; // 0 - 100
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  answers: Record<string, QuestionResult>;
  durationSeconds: number;
  createdAt: string;
  passed?: boolean;
}

export interface MistakeEntry {
  questionId: string;
  question: Question;
  timesWrong: number;
  consecutiveCorrect: number;
  lastWrongAt: string;
  isMastered: boolean;
  examId?: string;
  examTitle?: string;
  levelId?: LevelId;
  levelName?: string;
  lastUserAnswer?: any;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface UserProfile {
  name: string;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  unlockedLevels: LevelId[];
  completedLevelTests: LevelId[];
  badges: Badge[];
  totalXp: number;
}

export interface OverallStats {
  totalAttempts: number;
  totalPracticedQuestions: number;
  averageScore: number;
  accuracyByQuestionType: Record<string, { name: string; correct: number; total: number }>;
  accuracyByTopic: Record<string, { topicName: string; correct: number; total: number }>;
  scoreHistory: { date: string; score: number; examTitle: string }[];
}

export interface LevelProgressInfo {
  totalExams: number;
  completedExams: number;
  qualifyingExams: number; // completed with >= 60%
  percentCompleted: number;
  canTakeLevelTest: boolean;
  examsNeededForTest: number;
  hasPassedLevelTest: boolean;
}
