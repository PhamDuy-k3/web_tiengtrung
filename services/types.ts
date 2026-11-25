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
  DailyMissionProgress,
  QuestionType,
  QuestionReport,
} from "@/types";
import type { GrammarLesson } from "@/types/grammar";
import type { SrsCard, SrsQuality, SrsReviewItem } from "@/types/srs";
import type { VocabularyItem } from "@/data/mock/vocabulary";

export interface IRepository {
  // Levels & Topics
  getLevels(): Promise<Level[]>;
  getLevel(levelId: LevelId): Promise<Level | null>;
  getTopics(levelId: LevelId): Promise<Topic[]>;
  getTopic(topicId: string): Promise<Topic | null>;
  getGrammarLesson(grammarPointId: string): Promise<GrammarLesson | null>;

  // Exams & Tests
  getExams(topicId: string): Promise<Exam[]>;
  getExam(examId: string): Promise<Exam | null>;
  generateVocabularyExam(topicId: string): Promise<Exam>;
  getAllExams(): Promise<Exam[]>;
  generateLevelTest(levelId: LevelId, seed?: number): Promise<Exam>;
  generatePlacementTest(): Promise<Exam>;
  generateRandomExam(levelId: LevelId): Promise<Exam>;
  generateQuestionTypeExam(levelId: LevelId, questionType: QuestionType): Promise<Exam>;
  generateWeakAreaExam(attemptId: string, count?: number): Promise<Exam | null>;
  generateAdaptiveExam(levelId: LevelId, count?: number): Promise<Exam>;
  generateMistakeExam(): Promise<Exam | null>;

  // Exam Attempts & Grading
  submitAttempt(payload: {
    examId: string;
    levelId: LevelId;
    topicId?: string;
    examTitle: string;
    answers: Record<string, QuestionResult>;
    durationSeconds: number;
    questionDurations?: Record<string, number>;
  }): Promise<ExamAttempt>;
  getAttempts(): Promise<ExamAttempt[]>;
  getAttempt(id: string): Promise<ExamAttempt | null>;
  reportQuestion(report: Omit<QuestionReport, "id" | "createdAt">): Promise<QuestionReport>;

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
  getDailyMissionProgress(date?: string): Promise<DailyMissionProgress>;

  // Vocabulary learning
  getVocabularyForTopic(topicId: string): Promise<VocabularyItem[]>;
  getCompletedLessons(): Promise<string[]>;
  completeTopicLesson(topicId: string, vocabularyIds: string[]): Promise<void>;

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
