import type { SrsCard, SrsItemType, SrsQuality } from "@/types/srs";

const INITIAL_EASE_FACTOR = 2.5;

function asDate(value: string | Date): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Thời điểm SRS không hợp lệ.");
  return date;
}

function addDays(value: Date, days: number): string {
  const next = new Date(value.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

export function createSrsCard(
  itemId: string,
  itemType: SrsItemType,
  now: string | Date = new Date()
): SrsCard {
  const createdAt = asDate(now).toISOString();
  return {
    itemId,
    itemType,
    intervalDays: 0,
    repetitions: 0,
    easeFactor: INITIAL_EASE_FACTOR,
    dueAt: createdAt,
    createdAt,
  };
}

export function scheduleSrsReview(
  card: SrsCard,
  quality: SrsQuality,
  reviewedAt: string | Date = new Date()
): SrsCard {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error("Chất lượng ghi nhớ phải nằm trong khoảng 0–5.");
  }
  const reviewedDate = asDate(reviewedAt);
  const difficulty = 5 - quality;
  const easeFactor = Math.max(
    1.3,
    card.easeFactor + 0.1 - difficulty * (0.08 + difficulty * 0.02)
  );

  if (quality < 3) {
    return {
      ...card,
      repetitions: 0,
      intervalDays: 1,
      easeFactor,
      dueAt: addDays(reviewedDate, 1),
      lastReviewedAt: reviewedDate.toISOString(),
      lastQuality: quality,
    };
  }

  const repetitions = card.repetitions + 1;
  const intervalDays = repetitions === 1
    ? 1
    : repetitions === 2
      ? 6
      : Math.max(1, Math.round(card.intervalDays * easeFactor));

  return {
    ...card,
    repetitions,
    intervalDays,
    easeFactor,
    dueAt: addDays(reviewedDate, intervalDays),
    lastReviewedAt: reviewedDate.toISOString(),
    lastQuality: quality,
  };
}

export function isSrsMastered(card: SrsCard): boolean {
  return card.intervalDays >= 21;
}

export function getSrsItemId(itemType: SrsItemType, id: string): string {
  return `${itemType}:${id}`;
}

