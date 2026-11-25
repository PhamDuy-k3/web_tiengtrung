import type { GrammarLessonSource } from "@/types/grammar";

export const grammarLessons: GrammarLessonSource[] = [
  {
    id: "so-sanh-bi",
    title: "So sánh với 比",
    hskLevel: 2,
    structure: "A + 比 + B + tính từ",
    explanation: "Đặt 比 giữa hai đối tượng; tính từ nêu điểm khác biệt đứng sau đối tượng được so sánh.",
    commonMistakes: [
      "Người học tiếng Việt thường đặt từ chỉ ‘hơn’ sau tính từ; trong cấu trúc này 比 đứng trước đối tượng so sánh.",
      "Không thêm 很 trước tính từ trong mẫu câu so sánh cơ bản này.",
    ],
    sourceQuestionIds: ["b-gd-3-10"],
    externalExamples: [{
      chinese: "我觉得数学比历史难多了",
      pinyin: "Wǒ juéde shùxué bǐ lìshǐ nánduō le",
      vietnamese: "Tôi thấy môn Toán khó hơn môn Lịch sử nhiều.",
      sourceTitle: "HSK Standard Course 3 Workbook, Lesson 10, dialogue 2",
      sourceUrl: "https://cdn.baulchino.com/hsk-books/HSK-3-Workbook.pdf",
    }],
  },
  {
    id: "hoi-tuoi-duo-da-le",
    title: "Hỏi tuổi với 多大 và 了",
    hskLevel: 1,
    structure: "Chủ ngữ + 今年 + 多大 + 了？",
    explanation: "多大 dùng để hỏi tuổi; 了 ở cuối câu là thành phần của mẫu câu hỏi tuổi trong ví dụ này.",
    commonMistakes: [
      "Không chuyển 了 lên trước cụm hỏi 多大.",
      "多大 thường dùng khi hỏi người lớn hoặc bạn bè; với trẻ nhỏ, kho dữ liệu có ghi chú dùng 几岁.",
    ],
    sourceQuestionIds: ["b-gd-2-2", "b-gd-2-9", "b-gd-2-5"],
    exampleTranslations: {
      "b-gd-2-2": "Bạn năm nay bao nhiêu tuổi?",
      "b-gd-2-9": "Cách hỏi tuổi người lớn tuổi một cách kính trọng.",
      "b-gd-2-5": "Con trai tôi năm nay năm tuổi.",
    },
  },
];
