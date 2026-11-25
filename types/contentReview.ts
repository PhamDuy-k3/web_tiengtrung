export type ContentReviewKind = "question" | "vocabulary" | "grammar";

export interface ContentReviewItem {
  id: string;
  kind: ContentReviewKind;
  title: string;
  source: string;
  reason: string;
  hskLevel?: number;
  chineseText?: string;
  pinyin?: string;
  vietnamese?: string;
  explanation?: string;
}
