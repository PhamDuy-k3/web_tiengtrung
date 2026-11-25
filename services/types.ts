import {
  Level,
  LevelId,
  Topic,
  Exam,
  ExamAttempt,
  MistakeEntry,
  UserProfile,
  OverallStats,
  Question,
  LevelProgressInfo,
  QuestionResult,
  AnswerValue,
} from "@/types";
import type { SrsCard, SrsQuality, SrsReviewItem } from "@/types/srs";

export interface IRepository {
  // Levels & Topics
  getLevels(): Promise<Level[]>;
  getLevel(levelId: LevelId): Promise<Level | null>;
  getTopics(levelId: LevelId): Promise<Topic[]>;
  getTopic(topicId: string): Promise<Topic | null>;

  // Exams & Tests
  getExams(topicId: string): Promise<Exam[]>;
  getExam(examId: string): Promise<Exam | null>;
  getAllExams(): Promise<Exam[]>;
  generateLevelTest(levelId: LevelId, seed?: number): Promise<Exam>;
  generatePlacementTest(): Promise<Exam>;
  generateRandomExam(levelId: LevelId): Promise<Exam>;
  generateMistakeExam(): Promise<Exam | null>;

  // Exam Attempts & Grading
  submitAttempt(payload: {
    examId: string;
    levelId: LevelId;
    topicId?: string;
    examTitle: string;
    answers: Record<string, QuestionResult>;
    durationSeconds: number;
  }): Promise<ExamAttempt>;
  getAttempts(): Promise<ExamAttempt[]>;
  getAttempt(id: string): Promise<ExamAttempt | null>;

  // Mistakes & Spaced Repetition
  getMistakes(): Promise<MistakeEntry[]>;
  updateMistakes(
    answers: Record<string, QuestionResult>,
    context?: { examId?: string; examTitle?: string; levelId?: LevelId }
  ): Promise<void>;
  recordSingleMistake?(
    question: Question,
    userAnswer: AnswerValue | null | undefined,
    context?: { examId?: string; examTitle?: string; levelId?: LevelId }
  ): Promise<void>;
  resetMistake(questionId: string): Promise<void>;

  // Spaced repetition
  getDueSrsItems(now?: string): Promise<SrsReviewItem[]>;
  addVocabularyToSrs(vocabularyId: string): Promise<SrsCard | null>;
  reviewSrsItem(itemId: string, quality: SrsQuality, reviewedAt?: string): Promise<SrsCard | null>;

  // Progress & Profile
  getProgress(): Promise<Record<string, { bestScore: number; attempts: number }>>;
  getLevelProgress(levelId: LevelId): Promise<LevelProgressInfo>;
  getProfile(): Promise<UserProfile>;
  saveProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
  getStats(): Promise<OverallStats>;

  // Data Management
  exportData(): Promise<string>;
  importData(json: string): Promise<boolean>;
  resetData(): Promise<void>;
}
