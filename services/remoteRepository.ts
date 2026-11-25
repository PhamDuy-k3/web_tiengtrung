import { IRepository } from "./types";
import {
  Level,
  LevelId,
  Topic,
  Exam,
  ExamAttempt,
  MistakeEntry,
  UserProfile,
  OverallStats,
  LevelProgressInfo,
  QuestionResult,
  Question,
  AnswerValue,
  DailyMissionProgress,
  QuestionType,
  QuestionReport,
} from "@/types";
import type { GrammarLesson } from "@/types/grammar";
import type { ContentReviewItem } from "@/types/contentReview";
import type { SrsCard, SrsQuality, SrsReviewItem } from "@/types/srs";
import type { VocabularyItem } from "@/data/mock/vocabulary";

/**
 * RemoteRepository: Sẵn sàng để kết nối API thật sau này.
 * Khi triển khai backend (REST/GraphQL), chỉ cần điền logic fetch()
 * vào các phương thức dưới đây mà không cần sửa đổi bất kỳ giao diện nào.
 */
export class RemoteRepository implements IRepository {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "https://api.hanyu.example.com/v1") {
    this.baseUrl = baseUrl;
  }

  async getLevels(): Promise<Level[]> {
    // TODO: fetch(`${this.baseUrl}/levels`)
    throw new Error("Remote API chưa hỗ trợ tạo câu hỏi từ vựng.");
  }

  async getLevel(levelId: LevelId): Promise<Level | null> {
    // TODO: fetch(`${this.baseUrl}/levels/${levelId}`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getTopics(levelId: LevelId): Promise<Topic[]> {
    // TODO: fetch(`${this.baseUrl}/levels/${levelId}/topics`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getTopic(topicId: string): Promise<Topic | null> {
    // TODO: fetch(`${this.baseUrl}/topics/${topicId}`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getGrammarLesson(_grammarPointId: string): Promise<GrammarLesson | null> {
    throw new Error("Remote API chưa hỗ trợ bài học ngữ pháp.");
  }

  async getContentReviewItems(): Promise<ContentReviewItem[]> {
    throw new Error("Remote API chưa hỗ trợ hàng đợi kiểm duyệt nội dung.");
  }

  async getExams(topicId: string): Promise<Exam[]> {
    // TODO: fetch(`${this.baseUrl}/topics/${topicId}/exams`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getExam(examId: string): Promise<Exam | null> {
    // TODO: fetch(`${this.baseUrl}/exams/${examId}`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async generateVocabularyExam(_topicId: string): Promise<Exam> {
    throw new Error("Remote API chưa hỗ trợ tạo câu hỏi từ vựng.");
  }

  async getAllExams(): Promise<Exam[]> {
    // TODO: fetch(`${this.baseUrl}/exams`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async generateLevelTest(levelId: LevelId, seed?: number): Promise<Exam> {
    // TODO: post(`${this.baseUrl}/level-tests/generate`, { levelId, seed })
    throw new Error("Remote API chưa được kết nối.");
  }

  async generatePlacementTest(): Promise<Exam> {
    // TODO: post(`${this.baseUrl}/placement-test/generate`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async generateRandomExam(levelId: LevelId): Promise<Exam> {
    // TODO: post(`${this.baseUrl}/random-exam/generate`, { levelId })
    throw new Error("Remote API chưa được kết nối.");
  }

  async generateQuestionTypeExam(_levelId: LevelId, _questionType: QuestionType): Promise<Exam> {
    // TODO: post(`${this.baseUrl}/practice/type`, { levelId, questionType })
    throw new Error("Remote API chưa hỗ trợ sinh đề theo dạng câu hỏi.");
  }

  async generateWeakAreaExam(_attemptId: string, _count = 10): Promise<Exam | null> {
    // TODO: post(`${this.baseUrl}/adaptive/weak-area`, { attemptId, count })
    throw new Error("Remote API chưa hỗ trợ sinh đề theo phần yếu.");
  }

  async generateAdaptiveExam(_levelId: LevelId, _count = 10): Promise<Exam> {
    // TODO: post(`${this.baseUrl}/adaptive/exams`, { levelId, count })
    throw new Error("Remote API chưa hỗ trợ sinh đề thích ứng.");
  }

  async generateMistakeExam(): Promise<Exam | null> {
    // TODO: post(`${this.baseUrl}/mistakes/exam/generate`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async submitAttempt(payload: {
    examId: string;
    levelId: LevelId;
    topicId?: string;
    examTitle: string;
    answers: Record<string, QuestionResult>;
    durationSeconds: number;
    questionDurations?: Record<string, number>;
  }): Promise<ExamAttempt> {
    // TODO: post(`${this.baseUrl}/attempts`, payload)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getAttempts(): Promise<ExamAttempt[]> {
    // TODO: fetch(`${this.baseUrl}/attempts`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getAttempt(id: string): Promise<ExamAttempt | null> {
    // TODO: fetch(`${this.baseUrl}/attempts/${id}`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async reportQuestion(_report: Omit<QuestionReport, "id" | "createdAt">): Promise<QuestionReport> {
    throw new Error("Remote API chưa hỗ trợ báo lỗi câu hỏi.");
  }

  async getMistakes(): Promise<MistakeEntry[]> {
    // TODO: fetch(`${this.baseUrl}/mistakes`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async updateMistakes(
    answers: Record<string, QuestionResult>,
    context?: { examId?: string; examTitle?: string; levelId?: LevelId }
  ): Promise<void> {
    // TODO: post(`${this.baseUrl}/mistakes/update`, { answers, context })
    throw new Error("Remote API chưa được kết nối.");
  }

  async recordSingleMistake(
    question: Question,
    userAnswer: AnswerValue | null | undefined,
    context?: { examId?: string; examTitle?: string; levelId?: LevelId }
  ): Promise<void> {
    // TODO: post(`${this.baseUrl}/mistakes/single`, { question, userAnswer, context })
    throw new Error("Remote API chưa được kết nối.");
  }

  async resetMistake(questionId: string): Promise<void> {
    // TODO: delete(`${this.baseUrl}/mistakes/${questionId}`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getDueSrsItems(_now?: string): Promise<SrsReviewItem[]> {
    // TODO: fetch(`${this.baseUrl}/srs/due`)
    throw new Error("Remote API chưa hỗ trợ SRS.");
  }

  async addVocabularyToSrs(_vocabularyId: string): Promise<SrsCard | null> {
    // TODO: post(`${this.baseUrl}/srs/vocabulary`, { vocabularyId })
    throw new Error("Remote API chưa hỗ trợ SRS.");
  }

  async reviewSrsItem(_itemId: string, _quality: SrsQuality, _reviewedAt?: string): Promise<SrsCard | null> {
    // TODO: post(`${this.baseUrl}/srs/reviews`, { itemId, quality, reviewedAt })
    throw new Error("Remote API chưa hỗ trợ SRS.");
  }

  async getDailyMissionProgress(_date?: string): Promise<DailyMissionProgress> {
    // TODO: fetch(`${this.baseUrl}/daily-missions`)
    throw new Error("Remote API chưa hỗ trợ nhiệm vụ hằng ngày.");
  }

  async getVocabularyForTopic(_topicId: string): Promise<VocabularyItem[]> {
    // TODO: fetch(`${this.baseUrl}/topics/${topicId}/vocabulary`)
    throw new Error("Remote API chưa hỗ trợ bài học từ vựng.");
  }

  async getCompletedLessons(): Promise<string[]> {
    // TODO: fetch(`${this.baseUrl}/learning/completed`)
    throw new Error("Remote API chưa hỗ trợ tiến độ bài học.");
  }

  async completeTopicLesson(_topicId: string, _vocabularyIds: string[]): Promise<void> {
    // TODO: post(`${this.baseUrl}/learning/complete`, { topicId, vocabularyIds })
    throw new Error("Remote API chưa hỗ trợ tiến độ bài học.");
  }

  async getProgress(): Promise<Record<string, { bestScore: number; attempts: number }>> {
    // TODO: fetch(`${this.baseUrl}/progress`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getLevelProgress(levelId: LevelId): Promise<LevelProgressInfo> {
    // TODO: fetch(`${this.baseUrl}/levels/${levelId}/progress`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getProfile(): Promise<UserProfile> {
    // TODO: fetch(`${this.baseUrl}/profile`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    // TODO: patch(`${this.baseUrl}/profile`, profile)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getStats(): Promise<OverallStats> {
    // TODO: fetch(`${this.baseUrl}/stats`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async exportData(): Promise<string> {
    // TODO: fetch(`${this.baseUrl}/backup/export`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async importData(json: string): Promise<boolean> {
    // TODO: post(`${this.baseUrl}/backup/import`, { json })
    throw new Error("Remote API chưa được kết nối.");
  }

  async resetData(): Promise<void> {
    // TODO: post(`${this.baseUrl}/account/reset`)
    throw new Error("Remote API chưa được kết nối.");
  }
}

export const remoteRepository = new RemoteRepository();
