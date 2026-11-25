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
} from "@/types";

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
    throw new Error("Remote API chưa được kết nối. Vui lòng sử dụng localRepository.");
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

  async getExams(topicId: string): Promise<Exam[]> {
    // TODO: fetch(`${this.baseUrl}/topics/${topicId}/exams`)
    throw new Error("Remote API chưa được kết nối.");
  }

  async getExam(examId: string): Promise<Exam | null> {
    // TODO: fetch(`${this.baseUrl}/exams/${examId}`)
    throw new Error("Remote API chưa được kết nối.");
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
