import {
  allMockExams,
  grammarLessons,
  mockTopics,
  mockVocabulary,
  type VocabularyItem,
} from "@/data/mock";
import {
  generateAssessmentRoadmap,
  type GenerateRoadmapResponse,
  type RoadmapLesson,
  type RoadmapWeek,
} from "@/lib/assessmentEngine";
import { shuffleArray } from "@/lib/shuffle";
import { getStrictLevelVocabPool, hskLevelToLevelId } from "@/lib/hskContentEngine";
import type { LevelId, MistakeEntry, Question } from "@/types";

export const ROADMAP_SAVED_STORAGE_KEY = "hanyu:saved_roadmap";
export const ROADMAP_PREVIEW_STORAGE_KEY = "hanyu:preview_roadmap";
export const ROADMAP_PROGRESS_STORAGE_KEY = "hanyu:roadmap_progress";

export interface RoadmapStudyCard {
  id: string;
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  hanViet?: string;
  partOfSpeech: string;
  exampleZh: string;
  examplePinyin: string;
  exampleVn: string;
  tip?: string;
  vocabularyId?: string;
}

export interface RoadmapGrammarGuide {
  id: string;
  title: string;
  structure?: string;
  explanation: string;
  commonMistakes?: string[];
  examples: Array<{
    chinese: string;
    pinyin?: string;
    vietnamese: string;
  }>;
}

export interface RoadmapLessonPlan {
  week: RoadmapWeek;
  lesson: RoadmapLesson;
  prevLesson: RoadmapLesson | null;
  nextLesson: RoadmapLesson | null;
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6;
  levelId: LevelId;
  studyCards: RoadmapStudyCard[];
  grammarGuides: RoadmapGrammarGuide[];
  practiceQuestions: Question[];
  recommendedHref: string;
  recommendedLabel: string;
}

export interface RoadmapProgressRecord {
  completedLessonIds: string[];
  scores: Record<string, number>;
}

const FOUNDATIONAL_CARDS_BY_LESSON: Record<string, RoadmapStudyCard[]> = {
  w1_l1: [
    {
      id: "fd-1",
      hanzi: "爸",
      pinyin: "bà",
      vietnamese: "Bố, cha",
      hanViet: "Ba",
      partOfSpeech: "thanh mẫu b + vận mẫu a",
      exampleZh: "我爱爸爸。",
      examplePinyin: "Wǒ ài bàba.",
      exampleVn: "Con yêu bố.",
      tip: "Âm 'b' đọc giống âm 'p' nhẹ không bật hơi trong tiếng Việt.",
    },
    {
      id: "fd-2",
      hanzi: "妈",
      pinyin: "mā",
      vietnamese: "Mẹ, má",
      hanViet: "Ma",
      partOfSpeech: "thanh mẫu m + thanh 1",
      exampleZh: "妈妈在家。",
      examplePinyin: "Māma zài jiā.",
      exampleVn: "Mẹ đang ở nhà.",
      tip: "Thanh 1 đọc cao và kéo dài đều giọng.",
    },
    {
      id: "fd-3",
      hanzi: "不",
      pinyin: "bù / bú",
      vietnamese: "Không (biến điệu)",
      hanViet: "Bất",
      partOfSpeech: "phó từ phủ định",
      exampleZh: "不是我的。",
      examplePinyin: "Bú shì wǒ de.",
      exampleVn: "Không phải của tôi.",
      tip: "Trước âm thanh 4 (như 是 shì), 不 biến từ thanh 4 thành thanh 2 (bú).",
    },
    {
      id: "fd-4",
      hanzi: "你",
      pinyin: "nǐ",
      vietnamese: "Bạn, anh, chị",
      hanViet: "Nhĩ",
      partOfSpeech: "đại từ",
      exampleZh: "你好！",
      examplePinyin: "Nǐ hǎo!",
      exampleVn: "Xin chào!",
      tip: "Thanh 3 đọc xuống thấp rồi lên nhẹ.",
    },
    {
      id: "fd-5",
      hanzi: "女",
      pinyin: "nǚ",
      vietnamese: "Nữ, con gái",
      hanViet: "Nữ",
      partOfSpeech: "vận mẫu ü",
      exampleZh: "女儿很聪明。",
      examplePinyin: "Nǚ'ér hěn cōngming.",
      exampleVn: "Con gái rất thông minh.",
      tip: "Âm 'ü' tròn môi như 'u' nhưng phát âm lưỡi chữ 'i'.",
    },
    {
      id: "fd-6",
      hanzi: "大",
      pinyin: "dà",
      vietnamese: "To, lớn",
      hanViet: "Đại",
      partOfSpeech: "thanh mẫu d + thanh 4",
      exampleZh: "这个苹果很大。",
      examplePinyin: "Zhège píngguǒ hěn dà.",
      exampleVn: "Quả táo này rất to.",
      tip: "Thanh 4 đọc dứt khoát từ cao xuống thấp.",
    },
  ],
  w1_l2: [
    {
      id: "fd-7",
      hanzi: "知",
      pinyin: "zhī",
      vietnamese: "Biết",
      hanViet: "Tri",
      partOfSpeech: "âm đầu lưỡi sau zh",
      exampleZh: "我知道。",
      examplePinyin: "Wǒ zhīdào.",
      exampleVn: "Tôi biết rồi.",
      tip: "zh cong đầu lưỡi chạm vòm cứng, không bật hơi.",
    },
    {
      id: "fd-8",
      hanzi: "几",
      pinyin: "jǐ",
      vietnamese: "Mấy, vài",
      hanViet: "Kỷ",
      partOfSpeech: "âm mặt lưỡi j",
      exampleZh: "你家有几口人？",
      examplePinyin: "Nǐ jiā yǒu jǐ kǒu rén?",
      exampleVn: "Nhà bạn có mấy người?",
      tip: "j dùng mặt lưỡi áp sát ngạc cứng, đầu lưỡi thả lỏng.",
    },
    {
      id: "fd-9",
      hanzi: "吃",
      pinyin: "chī",
      vietnamese: "Ăn",
      hanViet: "Cật",
      partOfSpeech: "âm cong lưỡi bật hơi ch",
      exampleZh: "我想吃米饭。",
      examplePinyin: "Wǒ xiǎng chī mǐfàn.",
      exampleVn: "Tôi muốn ăn cơm.",
      tip: "ch cong lưỡi giống zh nhưng phải bật hơi mạnh ra ngoài.",
    },
    {
      id: "fd-10",
      hanzi: "七",
      pinyin: "qī",
      vietnamese: "Số 7",
      hanViet: "Thất",
      partOfSpeech: "âm mặt lưỡi bật hơi q",
      exampleZh: "现在七点了。",
      examplePinyin: "Xiànzài qī diǎn le.",
      exampleVn: "Bây giờ 7 giờ rồi.",
      tip: "q đọc giống 'ch' nhưng bật hơi rõ, không cong lưỡi.",
    },
    {
      id: "fd-11",
      hanzi: "十",
      pinyin: "shí",
      vietnamese: "Số 10",
      hanViet: "Thập",
      partOfSpeech: "âm cong lưỡi sh",
      exampleZh: "十块钱。",
      examplePinyin: "Shí kuài qián.",
      exampleVn: "Mười tệ.",
      tip: "sh cong đầu lưỡi giống âm 's' nặng.",
    },
    {
      id: "fd-12",
      hanzi: "西",
      pinyin: "xī",
      vietnamese: "Phía Tây",
      hanViet: "Tây",
      partOfSpeech: "âm mặt lưỡi x",
      exampleZh: "我喜欢吃西瓜。",
      examplePinyin: "Wǒ xǐhuan chī xīguā.",
      exampleVn: "Tôi thích ăn dưa hấu.",
      tip: "x đọc nhẹ gần giống 'x' tiếng Việt nhưng hơi ép mặt lưỡi.",
    },
  ],
  w1_l3: [
    {
      id: "fd-13",
      hanzi: "一",
      pinyin: "yī",
      vietnamese: "Số 1 (Nét ngang 一)",
      hanViet: "Nhất",
      partOfSpeech: "nét ngang (横 héng)",
      exampleZh: "一个人。",
      examplePinyin: "Yí gè rén.",
      exampleVn: "Một người.",
      tip: "Viết từ trái sang phải, hơi chếch nhẹ lên ở cuối nét.",
    },
    {
      id: "fd-14",
      hanzi: "十",
      pinyin: "shí",
      vietnamese: "Số 10 (Ngang trước, sổ sau)",
      hanViet: "Thập",
      partOfSpeech: "nét ngang + nét sổ",
      exampleZh: "十月十日。",
      examplePinyin: "Shí yuè shí rì.",
      exampleVn: "Ngày 10 tháng 10.",
      tip: "Quy tắc bút thuận: Ngang trước, sổ sau.",
    },
    {
      id: "fd-15",
      hanzi: "人",
      pinyin: "rén",
      vietnamese: "Con người (Phẩy trước, mác sau)",
      hanViet: "Nhân",
      partOfSpeech: "nét phẩy + nét mác",
      exampleZh: "中国人。",
      examplePinyin: "Zhōngguó rén.",
      exampleVn: "Người Trung Quốc.",
      tip: "Quy tắc bút thuận: Phẩy (丿) trước, mác (㇏) sau.",
    },
    {
      id: "fd-16",
      hanzi: "口",
      pinyin: "kǒu",
      vietnamese: "Cái miệng / Lượng từ nhân khẩu",
      hanViet: "Khẩu",
      partOfSpeech: "quy tắc vào trước đóng sau",
      exampleZh: "我家有三口人。",
      examplePinyin: "Wǒ jiā yǒu sān kǒu rén.",
      exampleVn: "Nhà tôi có 3 người.",
      tip: "Viết khung trái và trên-phải trước, nét ngang dưới đóng sau cùng.",
    },
    {
      id: "fd-17",
      hanzi: "山",
      pinyin: "shān",
      vietnamese: "Ngọn núi",
      hanViet: "Sơn",
      partOfSpeech: "chữ tượng hình",
      exampleZh: "去爬山。",
      examplePinyin: "Qù pá shān.",
      exampleVn: "Đi leo núi.",
      tip: "Viết nét sổ giữa trước (từ giữa ra hai bên đối xứng).",
    },
    {
      id: "fd-18",
      hanzi: "水",
      pinyin: "shuǐ",
      vietnamese: "Nước",
      hanViet: "Thủy",
      partOfSpeech: "giữa trước hai bên sau",
      exampleZh: "喝水。",
      examplePinyin: "Hē shuǐ.",
      exampleVn: "Uống nước.",
      tip: "Viết nét sổ móc chính giữa trước, rồi mới viết hai bên trái phải.",
    },
  ],
};

function toLevelId(hskLevel: number): LevelId {
  return hskLevelToLevelId(hskLevel);
}

function inferLessonHskLevel(week: RoadmapWeek, lesson: RoadmapLesson, roadmap: GenerateRoadmapResponse): 1 | 2 | 3 | 4 | 5 | 6 {
  const text = `${lesson.topic} ${week.goal}`;
  const match = text.match(/HSK\s*([1-6])/i);
  if (match) {
    return Number(match[1]) as 1 | 2 | 3 | 4 | 5 | 6;
  }
  const fallback = Math.max(1, Math.min(6, roadmap.from_level || 1));
  return fallback as 1 | 2 | 3 | 4 | 5 | 6;
}

function extractMatchTokens(lesson: RoadmapLesson, week: RoadmapWeek): string[] {
  const raw = `${lesson.topic} ${lesson.grammar.join(" ")} ${week.goal}`;
  const hanziChunks = raw.match(/[\u3400-\u9fff]+/g) ?? [];
  const words = raw
    .toLowerCase()
    .replace(/[,.;:!?()[\]"'•/\\\-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
  return Array.from(new Set([...hanziChunks, ...words]));
}

function scoreQuestionRelevance(question: Question, tokens: string[], targetHsk: number, skills: string[]): number {
  let score = question.hskLevel === targetHsk ? 10 : Math.abs(question.hskLevel - targetHsk) <= 1 ? 3 : 0;
  const haystack = `${question.prompt} ${question.chineseText ?? ""} ${question.explanation} ${question.tags.join(" ")}`.toLowerCase();
  for (const token of tokens) {
    if ((question.chineseText ?? question.prompt).includes(token)) score += 10;
    else if (haystack.includes(token)) score += 3;
  }
  if (skills.includes("listening") && (question.type === "listen_choice" || question.type === "listen_word_order")) score += 6;
  if (skills.includes("grammar") && (question.type === "word_order" || question.type === "fill_in_blank")) score += 5;
  if (skills.includes("vocab") && (question.type === "multiple_choice" || question.type === "pinyin_choice" || question.type === "matching")) score += 5;
  if (skills.includes("writing") && question.type === "hanzi_write") score += 6;
  return score;
}

function toStudyCard(item: VocabularyItem): RoadmapStudyCard {
  return {
    id: item.id,
    hanzi: item.hanzi,
    pinyin: item.pinyin,
    vietnamese: item.vietnamese,
    hanViet: item.hanViet,
    partOfSpeech: item.partOfSpeech,
    exampleZh: item.exampleZh,
    examplePinyin: item.examplePinyin,
    exampleVn: item.exampleVn,
    vocabularyId: item.id,
  };
}

function buildGrammarGuides(
  lesson: RoadmapLesson,
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6,
  matchedQuestions: Question[]
): RoadmapGrammarGuide[] {
  const guides: RoadmapGrammarGuide[] = [];
  const rawJoined = `${lesson.topic} ${lesson.grammar.join(" ")}`.toLowerCase();

  for (const source of grammarLessons) {
    const keywordMatch =
      (source.id === "so-sanh-bi" && rawJoined.includes("比")) ||
      (source.id === "hoi-tuoi-duo-da-le" && (rawJoined.includes("tuổi") || rawJoined.includes("多大")));
    if (!keywordMatch) continue;

    const allQuestions = allMockExams.flatMap((exam) => exam.questions);
    const examples = source.sourceQuestionIds.flatMap((id) => {
      const q = allQuestions.find((item) => item.id === id);
      if (!q?.chineseText && !q?.prompt) return [];
      return [{
        chinese: q.chineseText ?? q.prompt,
        pinyin: q.pinyin,
        vietnamese: source.exampleTranslations?.[id] ?? q.explanation,
      }];
    });
    guides.push({
      id: source.id,
      title: source.title,
      structure: source.structure,
      explanation: source.explanation,
      commonMistakes: source.commonMistakes,
      examples: [...examples, ...(source.externalExamples ?? [])].slice(0, 3),
    });
  }

  lesson.grammar.forEach((point, idx) => {
    if (guides.some((guide) => point.toLowerCase().includes(guide.title.toLowerCase()))) return;
    const relatedExamples = matchedQuestions
      .filter((question) => Boolean(question.chineseText))
      .slice(idx, idx + 2)
      .map((question) => ({
        chinese: question.chineseText!,
        pinyin: question.pinyin,
        vietnamese: question.explanation,
      }));

    guides.push({
      id: `${lesson.id}-grammar-${idx}`,
      title: point,
      explanation: `Trọng tâm ${lesson.type === "remedial" ? "củng cố" : "kiến thức"} cấp độ HSK ${hskLevel}: ${point}. Hãy chú ý trật tự từ và ngữ cảnh sử dụng trong các ví dụ bên dưới.`,
      examples: relatedExamples,
    });
  });

  return guides;
}

export function buildRoadmapLessonPlan(
  roadmap: GenerateRoadmapResponse,
  lessonId: string,
  mistakes: MistakeEntry[] = []
): RoadmapLessonPlan | null {
  const flatLessons: Array<{ week: RoadmapWeek; lesson: RoadmapLesson }> = [];
  for (const week of roadmap.weeks) {
    for (const lesson of week.lessons) {
      flatLessons.push({ week, lesson });
    }
  }

  const targetIdx = flatLessons.findIndex((entry) => entry.lesson.id === lessonId);
  if (targetIdx === -1) return null;

  const { week, lesson } = flatLessons[targetIdx];
  const prevLesson = targetIdx > 0 ? flatLessons[targetIdx - 1].lesson : null;
  const nextLesson = targetIdx < flatLessons.length - 1 ? flatLessons[targetIdx + 1].lesson : null;

  const hskLevel = inferLessonHskLevel(week, lesson, roadmap);
  const levelId = toLevelId(hskLevel);
  const tokens = extractMatchTokens(lesson, week);

  const desiredCardCount = Math.max(5, Math.min(8, lesson.new_words || 6));
  const rankedVocab = getStrictLevelVocabPool(hskLevel, tokens, desiredCardCount);
  const curatedCards = FOUNDATIONAL_CARDS_BY_LESSON[lesson.id];
  const studyCards: RoadmapStudyCard[] = curatedCards
    ? curatedCards
    : rankedVocab.slice(0, desiredCardCount).map(toStudyCard);

  const allQuestions = allMockExams.flatMap((exam) => exam.questions);
  const levelQuestions = allQuestions.filter((q) => q.hskLevel === hskLevel);
  const fallbackLevelQuestions = allQuestions.filter((q) => toLevelId(q.hskLevel) === levelId);
  const questionPool = levelQuestions.length >= 6 ? levelQuestions : fallbackLevelQuestions;

  const targetCount = lesson.type === "test" ? 8 : 5;
  const chosen: Question[] = [];
  const seenIds = new Set<string>();

  if (lesson.type === "remedial" || lesson.type === "review") {
    const activeMistakes = mistakes
      .filter((entry) => !entry.isMastered && toLevelId(entry.question.hskLevel) === levelId)
      .map((entry) => entry.question);
    for (const q of activeMistakes.slice(0, 3)) {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        chosen.push(q);
      }
    }
  }

  const rankedQuestions = [...questionPool].sort(
    (a, b) => scoreQuestionRelevance(b, tokens, hskLevel, lesson.skills) - scoreQuestionRelevance(a, tokens, hskLevel, lesson.skills)
  );
  const topCandidates = shuffleArray(rankedQuestions.slice(0, Math.min(rankedQuestions.length, targetCount * 3)));
  for (const q of topCandidates) {
    if (chosen.length >= targetCount) break;
    if (!seenIds.has(q.id)) {
      seenIds.add(q.id);
      chosen.push(q);
    }
  }

  const matchedTopic =
    mockTopics.find((topic) => topic.levelId === levelId && tokens.some((token) => topic.name.toLowerCase().includes(token))) ??
    mockTopics.find((topic) => topic.levelId === levelId);

  const recommendedHref =
    lesson.type === "remedial" && mistakes.some((m) => !m.isMastered)
      ? "/mistakes"
      : matchedTopic
      ? `/learn/${matchedTopic.id}`
      : `/levels/${levelId}`;

  const recommendedLabel =
    lesson.type === "remedial" && mistakes.some((m) => !m.isMastered)
      ? "Mở Sổ tay câu hay sai"
      : matchedTopic
      ? `Học sâu chủ đề: ${matchedTopic.name}`
      : "Mở kho đề cùng cấp độ";

  return {
    week,
    lesson,
    prevLesson,
    nextLesson,
    hskLevel,
    levelId,
    studyCards,
    grammarGuides: buildGrammarGuides(lesson, hskLevel, chosen),
    practiceQuestions: chosen,
    recommendedHref,
    recommendedLabel,
  };
}

export function loadActiveRoadmapContext(): {
  roadmap: GenerateRoadmapResponse;
  roadmapKey: string;
  isLocked: boolean;
} {
  if (typeof window !== "undefined") {
    try {
      const savedRaw = localStorage.getItem(ROADMAP_SAVED_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as { roadmap?: GenerateRoadmapResponse; lockedAt?: string };
        if (parsed?.roadmap?.weeks?.length) {
          return {
            roadmap: parsed.roadmap,
            roadmapKey: parsed.lockedAt || "saved",
            isLocked: true,
          };
        }
      }

      const previewRaw = localStorage.getItem(ROADMAP_PREVIEW_STORAGE_KEY);
      if (previewRaw) {
        const parsed = JSON.parse(previewRaw) as GenerateRoadmapResponse;
        if (parsed?.weeks?.length) {
          return {
            roadmap: parsed,
            roadmapKey: "preview",
            isLocked: false,
          };
        }
      }
    } catch {}
  }

  return {
    roadmap: generateAssessmentRoadmap({ verified_level: 0, target_level: 3, daily_minutes: 30 }),
    roadmapKey: "preview",
    isLocked: false,
  };
}

export function getRoadmapProgress(roadmapKey: string): RoadmapProgressRecord {
  if (typeof window === "undefined") {
    return { completedLessonIds: [], scores: {} };
  }
  try {
    const raw = localStorage.getItem(ROADMAP_PROGRESS_STORAGE_KEY);
    if (!raw) return { completedLessonIds: [], scores: {} };
    const parsed = JSON.parse(raw) as Record<string, RoadmapProgressRecord>;
    const entry = parsed?.[roadmapKey];
    if (entry && Array.isArray(entry.completedLessonIds)) {
      return {
        completedLessonIds: entry.completedLessonIds,
        scores: entry.scores || {},
      };
    }
  } catch {}
  return { completedLessonIds: [], scores: {} };
}

export function markRoadmapLessonCompleted(
  roadmapKey: string,
  lessonId: string,
  score: number
): RoadmapProgressRecord {
  const current = getRoadmapProgress(roadmapKey);
  const next: RoadmapProgressRecord = {
    completedLessonIds: Array.from(new Set([...current.completedLessonIds, lessonId])),
    scores: {
      ...current.scores,
      [lessonId]: Math.max(current.scores[lessonId] ?? 0, score),
    },
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(ROADMAP_PROGRESS_STORAGE_KEY);
      const all = raw ? (JSON.parse(raw) as Record<string, RoadmapProgressRecord>) : {};
      all[roadmapKey] = next;
      localStorage.setItem(ROADMAP_PROGRESS_STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }

  return next;
}
