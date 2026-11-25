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
  Badge,
  LocalStorageData,
  AnswerValue,
} from "@/types";
import {
  mockLevels,
  mockTopics,
  allMockExams,
  buildLevelTest,
  buildPlacementTest,
  getQuestionsByLevel,
  mockVocabulary,
} from "@/data/mock";
import { shuffleArray } from "@/lib/shuffle";
import { migrateStorageData } from "@/lib/storageMigration";
import { createSrsCard, getSrsItemId, isSrsMastered, scheduleSrsReview } from "@/lib/srs";
import type { SrsCard, SrsQuality, SrsReviewItem } from "@/types/srs";

const STORAGE_KEY = "hanyu:v2";
const LEGACY_STORAGE_KEY = "hanyu:v1";

const DEFAULT_PROFILE: UserProfile = {
  name: "Học viên Hanyu",
  streak: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  unlockedLevels: ["basic"],
  completedLevelTests: [],
  badges: [
    {
      id: "badge-start",
      name: "Khởi đầu mới",
      description: "Gia nhập đại gia đình học tiếng Trung Hanyu",
      icon: "🌱",
      unlockedAt: new Date().toISOString(),
    },
  ],
  totalXp: 50,
};

function createInitialStorage(): LocalStorageData {
  return {
    version: "2.1",
    profile: { ...DEFAULT_PROFILE },
    attempts: [],
    mistakes: {},
    progress: {},
    srs: {},
  };
}

class LocalRepository implements IRepository {
  private artificialDelay(ms: number = 150): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadStorage(): LocalStorageData {
    if (typeof window === "undefined") {
      return createInitialStorage();
    }

    const currentRaw = localStorage.getItem(STORAGE_KEY);
    if (currentRaw) {
      try {
        const current = migrateStorageData(JSON.parse(currentRaw) as unknown);
        if (current) {
          if (current.version !== "2.1") this.saveStorage(current);
          return current;
        }
      } catch {
        // Keep the unreadable value intact and try the legacy backup below.
      }
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const migrated = migrateStorageData(JSON.parse(legacyRaw) as unknown);
        if (migrated) {
          this.saveStorage(migrated);
          return migrated;
        }
      } catch {
        // Keep legacy data intact; fall back to a fresh in-memory profile.
      }
    }

    const initial = createInitialStorage();
    this.saveStorage(initial);
    return initial;
  }

  private saveStorage(data: LocalStorageData): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Lỗi ghi dữ liệu vào localStorage:", e);
      return false;
    }
  }

  async getLevels(): Promise<Level[]> {
    await this.artificialDelay(80);
    return [...mockLevels];
  }

  async getLevel(levelId: LevelId): Promise<Level | null> {
    await this.artificialDelay(80);
    return mockLevels.find((l) => l.id === levelId) || null;
  }

  async getTopics(levelId: LevelId): Promise<Topic[]> {
    await this.artificialDelay(100);
    return mockTopics.filter((t) => t.levelId === levelId);
  }

  async getTopic(topicId: string): Promise<Topic | null> {
    await this.artificialDelay(80);
    return mockTopics.find((t) => t.id === topicId) || null;
  }

  async getExams(topicId: string): Promise<Exam[]> {
    await this.artificialDelay(120);
    return allMockExams.filter((e) => e.topicId === topicId);
  }

  async getExam(examId: string): Promise<Exam | null> {
    await this.artificialDelay(100);
    // 1. Check in standard mock exams
    const found = allMockExams.find((e) => e.id === examId);
    if (found) return found;

    // 2. Check if it's a level test
    if (examId.startsWith("level-test-")) {
      const levelId = examId.replace("level-test-", "") as LevelId;
      return buildLevelTest(levelId);
    }

    // 3. Check if it's placement test
    if (examId === "placement-test-standard") {
      return buildPlacementTest();
    }

    // 4. Check if it's a dynamic random exam
    if (examId.startsWith("random-exam-")) {
      const levelId = examId.replace("random-exam-", "") as LevelId;
      return this.generateRandomExam(levelId);
    }

    // 5. Check if it's mistake review
    if (examId === "mistake-review-exam") {
      return this.generateMistakeExam();
    }
    if (examId.startsWith("mistake-review-exam-")) {
      const levelId = examId.replace("mistake-review-exam-", "") as LevelId;
      return this.generateMistakeExam(levelId);
    }

    return null;
  }

  async getAllExams(): Promise<Exam[]> {
    await this.artificialDelay(120);
    return [...allMockExams];
  }

  async generateLevelTest(levelId: LevelId, seed?: number): Promise<Exam> {
    await this.artificialDelay(150);
    return buildLevelTest(levelId, seed);
  }

  async generatePlacementTest(): Promise<Exam> {
    await this.artificialDelay(150);
    return buildPlacementTest();
  }

  async generateRandomExam(levelId: LevelId): Promise<Exam> {
    await this.artificialDelay(150);
    const pool = getQuestionsByLevel(levelId);
    const shuffled = shuffleArray(pool);
    const questions = shuffled.slice(0, 12);
    const levelObj = mockLevels.find((l) => l.id === levelId);

    return {
      id: `random-exam-${levelId}`,
      topicId: `random-topic-${levelId}`,
      levelId,
      title: `Đề ngẫu nhiên - ${levelObj?.name || levelId}`,
      description: `Đề thi luyện tập 12 câu ngẫu nhiên tổng hợp từ toàn bộ các chủ đề của cấp độ ${levelObj?.name}.`,
      questions,
      isRandom: true,
      timeLimitSeconds: 15 * 60,
    };
  }

  async generateMistakeExam(levelId?: LevelId): Promise<Exam | null> {
    await this.artificialDelay(150);
    const store = this.loadStorage();
    let mistakes = Object.values(store.mistakes).filter((m) => !m.isMastered);

    if (levelId) {
      mistakes = mistakes.filter((m) => {
        if (m.levelId) return m.levelId === levelId;
        const qLvl = m.question.hskLevel <= 2 ? "basic" : m.question.hskLevel <= 4 ? "intermediate" : "advanced";
        return qLvl === levelId;
      });
    }

    if (mistakes.length === 0) {
      return null;
    }

    // Sort by times wrong descending
    const sorted = [...mistakes].sort((a, b) => b.timesWrong - a.timesWrong);
    const questions = sorted.slice(0, 15).map((m) => m.question);

    const levelTitle =
      levelId === "basic"
        ? "Cơ bản"
        : levelId === "intermediate"
        ? "Trung cấp"
        : levelId === "advanced"
        ? "Nâng cao"
        : "Tổng hợp";

    return {
      id: "mistake-review-exam",
      topicId: "mistake-topic",
      levelId: levelId || (questions[0]?.hskLevel <= 2 ? "basic" : questions[0]?.hskLevel <= 4 ? "intermediate" : "advanced"),
      title: `Luyện tập: Ôn lại các câu hay sai (${levelTitle})`,
      description: `Đề luyện chuyên biệt gồm ${questions.length} câu bạn từng làm sai nhiều nhất trong sổ tay lỗi sai (${levelTitle}). Hãy chinh phục lại chúng!`,
      questions,
      isMistakeReview: true,
      timeLimitSeconds: 20 * 60,
    };
  }

  async submitAttempt(payload: {
    examId: string;
    levelId: LevelId;
    topicId?: string;
    examTitle: string;
    answers: Record<string, QuestionResult>;
    durationSeconds: number;
  }): Promise<ExamAttempt> {
    await this.artificialDelay(200);
    const store = this.loadStorage();

    let correctCount = 0;
    const totalQuestions = Object.keys(payload.answers).length;
    let totalScore = 0;
    for (const key of Object.keys(payload.answers)) {
      const answer = payload.answers[key];
      if (answer.isCorrect) correctCount++;
      totalScore += answer.score;
    }

    const score = totalQuestions > 0 ? Math.round(totalScore / totalQuestions) : 0;
    const isLevelTest = payload.examId.startsWith("level-test-");
    const passed = isLevelTest ? score >= 80 : score >= 60;

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      examId: payload.examId,
      levelId: payload.levelId,
      topicId: payload.topicId,
      examTitle: payload.examTitle,
      score,
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      answers: payload.answers,
      durationSeconds: payload.durationSeconds,
      createdAt: new Date().toISOString(),
      passed,
    };

    // Update attempts list
    store.attempts.unshift(attempt);

    // Update test progress stats
    const currentProgress = store.progress[payload.examId] || { bestScore: 0, attempts: 0 };
    store.progress[payload.examId] = {
      bestScore: Math.max(currentProgress.bestScore, score),
      attempts: currentProgress.attempts + 1,
    };

    // Award XP
    const earnedXp = Math.max(10, Math.round(score * 1.5));
    store.profile.totalXp += earnedXp;

    // Update Streak
    const today = new Date().toISOString().split("T")[0];
    if (store.profile.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (store.profile.lastActiveDate === yesterday) {
        store.profile.streak += 1;
      } else {
        store.profile.streak = 1;
      }
      store.profile.lastActiveDate = today;
    }

    // Check Level-up unlock
    if (isLevelTest && passed) {
      if (!store.profile.completedLevelTests.includes(payload.levelId)) {
        store.profile.completedLevelTests.push(payload.levelId);
      }

      // Unlock next level
      if (payload.levelId === "basic" && !store.profile.unlockedLevels.includes("intermediate")) {
        store.profile.unlockedLevels.push("intermediate");
        store.profile.badges.push({
          id: `badge-unlock-inter`,
          name: "Vượt ải Cơ bản",
          description: "Xuất sắc vượt qua bài thi lên cấp Cơ bản (HSK 1-2) và mở khóa Trung cấp!",
          icon: "🎋",
          unlockedAt: new Date().toISOString(),
        });
      } else if (payload.levelId === "intermediate" && !store.profile.unlockedLevels.includes("advanced")) {
        store.profile.unlockedLevels.push("advanced");
        store.profile.badges.push({
          id: `badge-unlock-adv`,
          name: "Chinh phục Trung cấp",
          description: "Xuất sắc vượt qua bài thi lên cấp Trung cấp (HSK 3-4) và mở khóa Nâng cao!",
          icon: "🐉",
          unlockedAt: new Date().toISOString(),
        });
      }
    }

    // Badge for first 100% score
    if (score === 100 && !store.profile.badges.some((b) => b.id === "badge-perfect")) {
      store.profile.badges.push({
        id: "badge-perfect",
        name: "Hoàn hảo tuyệt đối",
        description: "Đạt điểm số tuyệt đối 100% trong một bài luyện tập",
        icon: "💯",
        unlockedAt: new Date().toISOString(),
      });
    }

    // Update mistakes and SRS cards in the same storage transaction as the attempt.
    this.recordQuestionMistakes(store, payload.answers, {
      examId: payload.examId,
      examTitle: payload.examTitle,
      levelId: payload.levelId,
    });

    this.saveStorage(store);
    return attempt;
  }

  async getAttempts(): Promise<ExamAttempt[]> {
    await this.artificialDelay(100);
    const store = this.loadStorage();
    return store.attempts;
  }

  async getAttempt(id: string): Promise<ExamAttempt | null> {
    await this.artificialDelay(80);
    const store = this.loadStorage();
    return store.attempts.find((a) => a.id === id) || null;
  }

  async getMistakes(): Promise<MistakeEntry[]> {
    await this.artificialDelay(120);
    const store = this.loadStorage();
    return Object.values(store.mistakes).map((mistake) => {
      const card = store.srs[getSrsItemId("question", mistake.questionId)];
      return card ? { ...mistake, isMastered: isSrsMastered(card) } : mistake;
    });
  }

  private queueQuestionForSrs(store: LocalStorageData, question: Question, now: string): void {
    const itemId = getSrsItemId("question", question.id);
    const existing = store.srs[itemId];
    store.srs[itemId] = existing
      ? {
          ...existing,
          intervalDays: 0,
          repetitions: 0,
          easeFactor: Math.max(1.3, existing.easeFactor - 0.2),
          dueAt: now,
          lastQuality: 1,
        }
      : createSrsCard(itemId, "question", now);
  }

  private recordQuestionMistakes(
    store: LocalStorageData,
    answers: Record<string, QuestionResult>,
    context?: { examId?: string; examTitle?: string; levelId?: LevelId }
  ): void {
    const now = new Date().toISOString();

    for (const qId of Object.keys(answers)) {
      const result = answers[qId];
      if (result.isCorrect) continue;
      const existing = store.mistakes[qId];
      const levelId: LevelId = context?.levelId ||
        (result.question.hskLevel <= 2 ? "basic" : result.question.hskLevel <= 4 ? "intermediate" : "advanced");
      const levelName = levelId === "basic"
        ? "Cơ bản (HSK 1-2)"
        : levelId === "intermediate"
          ? "Trung cấp (HSK 3-4)"
          : "Nâng cao (HSK 5-6)";

      if (existing) {
        existing.timesWrong += 1;
        existing.consecutiveCorrect = 0;
        existing.lastWrongAt = now;
        existing.isMastered = false;
        existing.lastUserAnswer = result.userAnswer;
        if (context?.examId) existing.examId = context.examId;
        if (context?.examTitle) existing.examTitle = context.examTitle;
        existing.levelId = levelId;
        existing.levelName = levelName;
      } else {
        store.mistakes[qId] = {
          questionId: qId,
          question: result.question,
          timesWrong: 1,
          consecutiveCorrect: 0,
          lastWrongAt: now,
          isMastered: false,
          examId: context?.examId,
          examTitle: context?.examTitle,
          levelId,
          levelName,
          lastUserAnswer: result.userAnswer,
        };
      }
      this.queueQuestionForSrs(store, result.question, now);
    }
  }

  async updateMistakes(
    answers: Record<string, QuestionResult>,
    context?: { examId?: string; examTitle?: string; levelId?: LevelId }
  ): Promise<void> {
    const store = this.loadStorage();
    this.recordQuestionMistakes(store, answers, context);
    this.saveStorage(store);
  }

  async recordSingleMistake(
    question: Question,
    userAnswer: AnswerValue | null | undefined,
    context?: { examId?: string; examTitle?: string; levelId?: LevelId }
  ): Promise<void> {
    const store = this.loadStorage();
    const now = new Date().toISOString();
    const qId = question.id;
    const existing = store.mistakes[qId];

    const resolvedLevelId: LevelId =
      context?.levelId ||
      (question.hskLevel <= 2
        ? "basic"
        : question.hskLevel <= 4
        ? "intermediate"
        : "advanced");

    const resolvedLevelName =
      resolvedLevelId === "basic"
        ? "Cơ bản (HSK 1-2)"
        : resolvedLevelId === "intermediate"
        ? "Trung cấp (HSK 3-4)"
        : "Nâng cao (HSK 5-6)";

    if (existing) {
      existing.timesWrong += 1;
      existing.consecutiveCorrect = 0;
      existing.lastWrongAt = now;
      existing.isMastered = false;
      existing.lastUserAnswer = userAnswer;
      if (context?.examId) existing.examId = context.examId;
      if (context?.examTitle) existing.examTitle = context.examTitle;
      existing.levelId = resolvedLevelId;
      existing.levelName = resolvedLevelName;
    } else {
      store.mistakes[qId] = {
        questionId: qId,
        question,
        timesWrong: 1,
        consecutiveCorrect: 0,
        lastWrongAt: now,
        isMastered: false,
        examId: context?.examId,
        examTitle: context?.examTitle,
        levelId: resolvedLevelId,
        levelName: resolvedLevelName,
        lastUserAnswer: userAnswer,
      };
    }

    this.queueQuestionForSrs(store, question, now);
    this.saveStorage(store);
  }

  async resetMistake(questionId: string): Promise<void> {
    await this.artificialDelay(60);
    const store = this.loadStorage();
    delete store.mistakes[questionId];
    delete store.srs[getSrsItemId("question", questionId)];
    this.saveStorage(store);
  }

  async getDueSrsItems(now: string = new Date().toISOString()): Promise<SrsReviewItem[]> {
    await this.artificialDelay(80);
    const store = this.loadStorage();
    const nowTime = Date.parse(now);
    if (Number.isNaN(nowTime)) throw new Error("Thời điểm SRS không hợp lệ.");

    const vocabularyById = new Map(mockVocabulary.map((item) => [item.id, item]));
    const questionsById = new Map(allMockExams.flatMap((exam) => exam.questions).map((question) => [question.id, question]));
    const dueCards = Object.values(store.srs)
      .filter((card) => Date.parse(card.dueAt) <= nowTime)
      .sort((left, right) => left.dueAt.localeCompare(right.dueAt));

    const items: SrsReviewItem[] = [];
    for (const card of dueCards) {
      if (card.itemType === "vocabulary") {
        const vocabulary = vocabularyById.get(card.itemId.slice("vocabulary:".length));
        if (vocabulary) items.push({ kind: "vocabulary", card, vocabulary });
      } else {
        const questionId = card.itemId.slice("question:".length);
        const question = store.mistakes[questionId]?.question ?? questionsById.get(questionId);
        if (question) items.push({ kind: "question", card, question });
      }
    }
    return items;
  }

  async addVocabularyToSrs(vocabularyId: string): Promise<SrsCard | null> {
    await this.artificialDelay(50);
    if (!mockVocabulary.some((item) => item.id === vocabularyId)) return null;
    const store = this.loadStorage();
    const itemId = getSrsItemId("vocabulary", vocabularyId);
    const card = store.srs[itemId] ?? createSrsCard(itemId, "vocabulary");
    store.srs[itemId] = card;
    this.saveStorage(store);
    return card;
  }

  async reviewSrsItem(itemId: string, quality: SrsQuality, reviewedAt: string = new Date().toISOString()): Promise<SrsCard | null> {
    await this.artificialDelay(60);
    const store = this.loadStorage();
    const existing = store.srs[itemId];
    if (!existing) return null;
    const updated = scheduleSrsReview(existing, quality, reviewedAt);
    store.srs[itemId] = updated;

    if (existing.itemType === "question") {
      const questionId = itemId.slice("question:".length);
      const mistake = store.mistakes[questionId];
      if (mistake) {
        if (quality < 3) {
          mistake.timesWrong += 1;
          mistake.lastWrongAt = new Date(reviewedAt).toISOString();
          mistake.consecutiveCorrect = 0;
          mistake.isMastered = false;
        } else {
          mistake.consecutiveCorrect = updated.repetitions;
          mistake.isMastered = isSrsMastered(updated);
        }
      }
    }
    this.saveStorage(store);
    return updated;
  }

  async getProgress(): Promise<Record<string, { bestScore: number; attempts: number }>> {
    await this.artificialDelay(80);
    const store = this.loadStorage();
    return store.progress;
  }

  async getLevelProgress(levelId: LevelId): Promise<LevelProgressInfo> {
    await this.artificialDelay(100);
    const store = this.loadStorage();
    const levelExams = allMockExams.filter((e) => e.levelId === levelId);
    const totalExams = levelExams.length;

    let completedExams = 0;
    let qualifyingExams = 0;

    for (const ex of levelExams) {
      const p = store.progress[ex.id];
      if (p && p.attempts > 0) {
        completedExams++;
        if (p.bestScore >= 60) {
          qualifyingExams++;
        }
      }
    }

    const percentCompleted = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;
    const requiredQualifying = Math.ceil(totalExams * 0.7); // 70%
    const canTakeLevelTest = qualifyingExams >= requiredQualifying;
    const examsNeededForTest = Math.max(0, requiredQualifying - qualifyingExams);
    const hasPassedLevelTest = store.profile.completedLevelTests.includes(levelId);

    return {
      totalExams,
      completedExams,
      qualifyingExams,
      percentCompleted,
      canTakeLevelTest,
      examsNeededForTest,
      hasPassedLevelTest,
    };
  }

  async getProfile(): Promise<UserProfile> {
    await this.artificialDelay(80);
    const store = this.loadStorage();
    return store.profile;
  }

  async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    await this.artificialDelay(120);
    const store = this.loadStorage();
    store.profile = { ...store.profile, ...profile };
    this.saveStorage(store);
    return store.profile;
  }

  async getStats(): Promise<OverallStats> {
    await this.artificialDelay(150);
    const store = this.loadStorage();
    const attempts = store.attempts;

    let totalPracticedQuestions = 0;
    let totalScoreSum = 0;
    const accuracyByType: Record<string, { name: string; correct: number; total: number }> = {};
    const accuracyByTopic: Record<string, { topicName: string; correct: number; total: number }> = {};

    const typeNames: Record<string, string> = {
      word_order: "Sắp xếp câu",
      multiple_choice: "Trắc nghiệm chọn nghĩa",
      fill_in_blank: "Điền từ vào chỗ trống",
      matching: "Nối cặp từ nghĩa",
      listen_choice: "Nghe chọn đáp án",
      listen_word_order: "Nghe xếp lại câu",
      pinyin_choice: "Chọn Pinyin chuẩn",
      short_translate: "Dịch câu ngắn",
    };

    attempts.forEach((att) => {
      totalPracticedQuestions += att.totalQuestions;
      totalScoreSum += att.score;

      for (const qId of Object.keys(att.answers)) {
        const item = att.answers[qId];
        const qType = item.question.type;
        const topicId = item.question.topicId;
        const topicObj = mockTopics.find((t) => t.id === topicId);
        const topicName = topicObj ? topicObj.name : "Chủ đề khác";

        // Aggregate by type
        if (!accuracyByType[qType]) {
          accuracyByType[qType] = {
            name: typeNames[qType] || qType,
            correct: 0,
            total: 0,
          };
        }
        accuracyByType[qType].total++;
        if (item.isCorrect) accuracyByType[qType].correct++;

        // Aggregate by topic
        if (!accuracyByTopic[topicId]) {
          accuracyByTopic[topicId] = {
            topicName,
            correct: 0,
            total: 0,
          };
        }
        accuracyByTopic[topicId].total++;
        if (item.isCorrect) accuracyByTopic[topicId].correct++;
      }
    });

    const averageScore = attempts.length > 0 ? Math.round(totalScoreSum / attempts.length) : 0;

    const scoreHistory = attempts.slice(0, 10).reverse().map((att) => ({
      date: new Date(att.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      score: att.score,
      examTitle: att.examTitle,
    }));

    return {
      totalAttempts: attempts.length,
      totalPracticedQuestions,
      averageScore,
      accuracyByQuestionType: accuracyByType,
      accuracyByTopic,
      scoreHistory,
    };
  }

  async exportData(): Promise<string> {
    await this.artificialDelay(100);
    const store = this.loadStorage();
    return JSON.stringify(store, null, 2);
  }

  async importData(json: string): Promise<boolean> {
    await this.artificialDelay(200);
    try {
      const parsed: unknown = JSON.parse(json);
      const migrated = migrateStorageData(parsed);
      if (!migrated) {
        return false;
      }
      return this.saveStorage(migrated);
    } catch {
      return false;
    }
  }

  async resetData(): Promise<void> {
    await this.artificialDelay(150);
    const initial = createInitialStorage();
    this.saveStorage(initial);
  }
}

export const localRepository = new LocalRepository();
