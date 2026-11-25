import type { Exam, Question } from "@/types";
import type { VocabularyItem } from "@/data/mock/vocabulary";

function choicesFor<T>(items: VocabularyItem[], item: VocabularyItem, value: (word: VocabularyItem) => T): T[] {
  return [item, ...items.filter((candidate) => candidate.id !== item.id).slice(0, 3)].map(value);
}

export function generateVocabularyQuestions(vocabulary: VocabularyItem[]): Question[] {
  const usable = vocabulary.filter((word) => word.hanzi && word.pinyin && word.vietnamese);
  const questions: Question[] = [];
  for (const word of usable) {
    const shared = {
      version: 1,
      hskLevel: Math.max(1, Math.min(6, word.hskLevel)) as Question["hskLevel"],
      difficulty: Math.max(1, Math.min(5, word.hskLevel)) as Question["difficulty"],
      topicId: word.topicId,
      tags: ["từ_vựng", "tự_sinh"],
      chineseText: word.hanzi,
      pinyin: word.pinyin,
      vietnamese: word.vietnamese,
      vocabIds: [word.id],
      generated: true,
      needsReview: word.needsReview,
      explanation: `Đáp án được lấy từ mục từ vựng “${word.hanzi}” trong chủ đề.`,
    };
    questions.push({
      ...shared,
      id: `generated:${word.id}:meaning`, type: "multiple_choice",
      vietnamese: undefined,
      prompt: `“${word.hanzi}” có nghĩa tiếng Việt nào?`,
      options: choicesFor(usable, word, (candidate) => candidate.vietnamese),
      correctAnswer: word.vietnamese,
    });
    questions.push({
      ...shared,
      id: `generated:${word.id}:pinyin`, type: "pinyin_choice",
      pinyin: undefined,
      vietnamese: undefined,
      prompt: `Pinyin nào khớp với “${word.hanzi}”?`,
      options: choicesFor(usable, word, (candidate) => candidate.pinyin),
      correctAnswer: word.pinyin,
    });
    questions.push({
      ...shared,
      id: `generated:${word.id}:listen`, type: "listen_choice",
      prompt: "Nghe phát âm và chọn từ tương ứng.",
      options: choicesFor(usable, word, (candidate) => candidate.hanzi),
      correctAnswer: word.hanzi,
    });
    Array.from(word.hanzi).forEach((character, index) => {
      questions.push({
        ...shared,
        id: `generated:${word.id}:write:${index + 1}`,
        type: "hanzi_write",
        chineseText: character,
        pinyin: undefined,
        vietnamese: undefined,
        prompt: `Luyện thứ tự nét cho ký tự ${index + 1} trong mục từ có nghĩa “${word.vietnamese}”.`,
        correctAnswer: character,
      });
    });
  }

  for (let start = 0; start + 3 < usable.length; start += 4) {
    const group = usable.slice(start, start + 4);
    const pairs = group.map((word, index) => ({
      id: `pair-${index + 1}`, left: word.hanzi, pinyin: word.pinyin, right: word.vietnamese,
    }));
    questions.push({
      id: `generated:${group.map((word) => word.id).join(":")}:matching`,
      version: 1,
      type: "matching",
      hskLevel: Math.max(1, Math.min(6, group[0].hskLevel)) as Question["hskLevel"],
      difficulty: 1,
      topicId: group[0].topicId,
      tags: ["từ_vựng", "tự_sinh"],
      prompt: "Nối từ tiếng Trung với nghĩa tiếng Việt.",
      pairs,
      distractors: group.map((word) => word.vietnamese),
      correctAnswer: Object.fromEntries(pairs.map((pair) => [pair.id, pair.right])),
      vocabIds: group.map((word) => word.id),
      generated: true,
      needsReview: group.some((word) => word.needsReview),
      explanation: "Các cặp được tạo từ dữ liệu từ vựng của chủ đề.",
    });
  }
  return questions;
}

export function generateVocabularyExam(topicId: string, vocabulary: VocabularyItem[]): Exam {
  const questions = generateVocabularyQuestions(vocabulary);
  const levelId: Exam["levelId"] = topicId.startsWith("advanced-") ? "advanced"
    : topicId.startsWith("inter-") ? "intermediate" : "basic";
  return {
    id: `generated-vocab-${topicId}`,
    topicId,
    levelId,
    title: "Luyện từ vựng tự sinh",
    description: "Câu hỏi được tạo trực tiếp từ từ vựng của chủ đề.",
    questions,
    isRandom: true,
  };
}
