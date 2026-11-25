import type { Question } from "@/types";
import type { VocabularyItem } from "@/data/mock/vocabulary";

export type SrsItemType = "question" | "vocabulary";
export type SrsQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SrsCard {
  itemId: string;
  itemType: SrsItemType;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  dueAt: string;
  createdAt: string;
  lastReviewedAt?: string;
  lastQuality?: SrsQuality;
}

export type SrsReviewItem =
  | { kind: "question"; card: SrsCard; question: Question }
  | { kind: "vocabulary"; card: SrsCard; vocabulary: VocabularyItem };
