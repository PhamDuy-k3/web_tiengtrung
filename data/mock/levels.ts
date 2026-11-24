import { Level } from "@/types";

export const mockLevels: Level[] = [
  {
    id: "basic",
    name: "Cơ bản",
    hskSpan: "HSK 1 - 2",
    description: "Nhập môn phát âm, từ vựng sinh hoạt hàng ngày, cấu trúc câu cơ bản và giao tiếp sơ cấp (khoảng 150 - 300 từ tích lũy).",
    badge: "🌱 Mầm non HSK",
    color: "#10B981",
    requiredExamsPct: 70,
    minPassingScorePct: 60,
    levelTestPassingScorePct: 80,
  },
  {
    id: "intermediate",
    name: "Trung cấp",
    hskSpan: "HSK 3 - 4",
    description: "Giao tiếp lưu loát các chủ đề cuộc sống, học tập, công việc, du lịch và nắm vững các liên từ, bổ ngữ kết quả, câu chữ 把/被 (khoảng 600 - 1200 từ tích lũy).",
    badge: "🎋 Trúc xanh HSK",
    color: "#F59E0B",
    requiredExamsPct: 70,
    minPassingScorePct: 60,
    levelTestPassingScorePct: 80,
  },
  {
    id: "advanced",
    name: "Nâng cao",
    hskSpan: "HSK 5 - 6",
    description: "Đọc hiểu báo chí, diễn thuyết, bình luận xã hội, kinh tế, thương mại và hiểu biết sâu sắc về thành ngữ, phong cách viết trang trọng (khoảng 2500 - 5000 từ tích lũy).",
    badge: "🐉 Long vương HSK",
    color: "#EF4444",
    requiredExamsPct: 70,
    minPassingScorePct: 60,
    levelTestPassingScorePct: 80,
  },
];
