/**
 * hskContentEngine.ts
 * ───────────────────
 * Implements the HSK 2.0 content-level rules described in the system prompt:
 *
 *   band: co_ban (HSK 1-2) | trung_cap (HSK 3-4) | nang_cao (HSK 5-6)
 *   - target_vocab: words that BELONG to the exact lesson hskLevel.
 *   - support_vocab: words from strictly lower levels (permitted context).
 *   - Structural particles always allowed: 我, 的, 了, 是, 和, 不, 在.
 *
 * Key guarantee: NO word above the lesson's hskLevel ever appears in
 * target_vocab, and NO word at or above hskLevel appears in support_vocab.
 */

import type { LevelId } from "@/types";
import type { VocabularyItem } from "@/data/mock/vocabulary";
import { mockVocabulary, mockTopics } from "@/data/mock";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Band = "co_ban" | "trung_cap" | "nang_cao";

/** What the system prompt calls "đầu vào" for a lesson. */
export interface LessonVocabContext {
  band: Band;
  /** Exact HSK level for this lesson (1-6). */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  topicId: string;
  /** Words of exactly this HSK level and matching topicId (or same band topic). */
  targetVocab: VocabularyItem[];
  /** Words of level < hskLevel only — allowed in context, NOT as lesson targets. */
  supportVocab: VocabularyItem[];
}

/** Summary used for self_check block in generated exercises. */
export interface ContentSelfCheck {
  off_topic_items: string[];
  words_above_level: string[];
  target_words_below_level: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Always-allowed structural particles regardless of HSK level (exempt from level filtering). */
export const STRUCTURAL_PARTICLES: ReadonlySet<string> = new Set([
  "我", "的", "了", "是", "和", "不", "在", "也", "都", "把", "被",
  "吗", "呢", "啊", "吧", "就", "还", "很", "都", "人", "们",
]);

/** Map HSK level number → band id. */
export function hskLevelToBand(level: number): Band {
  if (level <= 2) return "co_ban";
  if (level <= 4) return "trung_cap";
  return "nang_cao";
}

/** Map HSK level number → LevelId used in topics/exams. */
export function hskLevelToLevelId(level: number): LevelId {
  if (level <= 2) return "basic";
  if (level <= 4) return "intermediate";
  return "advanced";
}

/** HSK level range for each band. */
export const BAND_HSK_RANGE: Record<Band, [number, number]> = {
  co_ban:   [1, 2],
  trung_cap: [3, 4],
  nang_cao: [5, 6],
};

// ─── Core API ────────────────────────────────────────────────────────────────

/**
 * Build target_vocab and support_vocab for a given lesson.
 *
 * Rules:
 * 1. target_vocab = items whose hskLevel === level AND (topicId matches OR
 *    same band topic). Sorted by relevance (exact topicId first).
 * 2. support_vocab = items whose hskLevel < level. Excludes structural particles
 *    (they are always implicitly allowed). Max 40 items to keep context small.
 * 3. If targetVocab is empty after exact-level + exact-topic filter, expand to
 *    same-band topics (never cross-band).
 */
export function buildLessonVocabContext(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  topicId: string
): LessonVocabContext {
  const band = hskLevelToBand(level);
  const exactLevelVocab = mockVocabulary.filter((v) => v.hskLevel === level);
  const targetVocab = exactLevelVocab.filter((v) => v.topicId === topicId);

  // Fallback: same band's topics (but NOT lower/higher band)
  if (targetVocab.length < 4) {
    const sameBandTopicIds = mockTopics
      .filter((t) => {
        const tLevelId = t.levelId;
        return (
          (band === "co_ban"    && tLevelId === "basic") ||
          (band === "trung_cap" && tLevelId === "intermediate") ||
          (band === "nang_cao"  && tLevelId === "advanced")
        );
      })
      .map((t) => t.id);

    const bandVocab = exactLevelVocab.filter((v) =>
      sameBandTopicIds.includes(v.topicId)
    );

    // Merge: exact topicId items first, then other same-band items (dedup)
    const seen = new Set(targetVocab.map((v) => v.id));
    for (const item of bandVocab) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        targetVocab.push(item);
      }
    }
  }

  // support_vocab: strictly hskLevel < level, exclude structural particles
  const supportVocab = mockVocabulary
    .filter(
      (v) =>
        v.hskLevel < level &&
        !STRUCTURAL_PARTICLES.has(v.hanzi) &&
        !STRUCTURAL_PARTICLES.has(v.hanzi[0])
    )
    .slice(0, 40);

  return {
    band,
    level,
    topicId,
    targetVocab,
    supportVocab,
  };
}

/**
 * Strict vocabulary pool for a roadmap lesson.
 *
 * Returns ONLY vocab at the exact hskLevel. If fewer than `minItems` are
 * found for the exact level, expands to the same BAND (but never crosses
 * to a different band). Never returns all-vocab as a fallback.
 */
export function getStrictLevelVocabPool(
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6,
  topicTokens: string[],
  minItems = 5
): VocabularyItem[] {
  const levelId = hskLevelToLevelId(hskLevel);

  // Exact level match, topic-scored
  const exactLevel = mockVocabulary.filter((v) => v.hskLevel === hskLevel);

  if (exactLevel.length >= minItems) {
    return scoredSort(exactLevel, topicTokens, hskLevel);
  }

  // Fallback: same band only
  const sameBand = mockVocabulary.filter(
    (v) => hskLevelToLevelId(v.hskLevel) === levelId
  );
  return scoredSort(sameBand, topicTokens, hskLevel);
}

/**
 * Sorts vocabulary by relevance to topic tokens (higher → first).
 * Does NOT mix in lower-level words even if the pool is small.
 */
function scoredSort(
  pool: VocabularyItem[],
  tokens: string[],
  targetHsk: number
): VocabularyItem[] {
  return [...pool].sort((a, b) => {
    const sa = vocabRelevanceScore(a, tokens, targetHsk);
    const sb = vocabRelevanceScore(b, tokens, targetHsk);
    return sb - sa;
  });
}

function vocabRelevanceScore(
  item: VocabularyItem,
  tokens: string[],
  targetHsk: number
): number {
  // Level score: exact = 10, ±1 within same band = 4, otherwise 0
  const levelDiff = Math.abs(item.hskLevel - targetHsk);
  const sameBand =
    hskLevelToLevelId(item.hskLevel) === hskLevelToLevelId(targetHsk);
  let score = item.hskLevel === targetHsk ? 10 : sameBand && levelDiff === 1 ? 4 : 0;

  // Topic relevance
  const haystack =
    `${item.hanzi} ${item.pinyin} ${item.vietnamese} ${item.exampleZh} ${item.topicId}`.toLowerCase();
  for (const token of tokens) {
    if (item.hanzi.includes(token)) score += 12;
    else if (haystack.includes(token)) score += 3;
  }
  return score;
}

// ─── Self-check helper ────────────────────────────────────────────────────────

/**
 * Validates a list of words against level rules.
 * Returns a ContentSelfCheck report (all arrays should be empty to pass).
 */
export function selfCheck(
  targetVocab: VocabularyItem[],
  supportVocab: VocabularyItem[],
  usedWords: string[],
  topicId: string,
  level: 1 | 2 | 3 | 4 | 5 | 6
): ContentSelfCheck {
  const topicLevelId = hskLevelToLevelId(level);
  const topicObj = mockTopics.find((t) => t.id === topicId);
  const topicBandMatch = topicObj?.levelId === topicLevelId;

  const targetHanzis = new Set(targetVocab.map((v) => v.hanzi));
  const supportHanzis = new Set(supportVocab.map((v) => v.hanzi));

  const off_topic_items: string[] = [];
  const words_above_level: string[] = [];
  const target_words_below_level: string[] = [];

  for (const word of usedWords) {
    const isAllowed =
      targetHanzis.has(word) ||
      supportHanzis.has(word) ||
      STRUCTURAL_PARTICLES.has(word);
    if (!isAllowed && word.length > 1) {
      // Try to find in vocabulary to see if it's above level
      const found = mockVocabulary.find((v) => v.hanzi === word);
      if (found) {
        if (found.hskLevel > level) words_above_level.push(`${word}(HSK${found.hskLevel})`);
      }
    }
  }

  for (const v of targetVocab) {
    if (v.hskLevel < level - 1) {
      target_words_below_level.push(`${v.hanzi}(HSK${v.hskLevel})`);
    }
  }

  if (!topicBandMatch) {
    off_topic_items.push(`topic '${topicId}' không thuộc band '${hskLevelToBand(level)}'`);
  }

  return { off_topic_items, words_above_level, target_words_below_level };
}
