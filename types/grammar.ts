export interface GrammarExample {
  sourceQuestionId?: string;
  chinese: string;
  pinyin?: string;
  vietnamese: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  hskLevel: number;
  structure: string;
  explanation: string;
  commonMistakes: string[];
  sourceQuestionIds: string[];
  examples: GrammarExample[];
  needsReview?: boolean;
  reviewNote?: string;
}

export interface GrammarLessonSource extends Omit<GrammarLesson, "examples"> {
  exampleTranslations?: Record<string, string>;
  externalExamples?: GrammarExample[];
}
