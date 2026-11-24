import { Topic } from "@/types";

export const mockTopics: Topic[] = [
  // --- Cơ bản (HSK 1-2) ---
  {
    id: "basic-chao-hoi",
    levelId: "basic",
    name: "Chào hỏi & Làm quen",
    icon: "👋",
    description: "Chào hỏi, hỏi tên tuổi, quốc tịch, nghề nghiệp và câu hỏi nghi vấn cơ bản 吗 / 呢 / 什么.",
    examCount: 4,
  },
  {
    id: "basic-gia-dinh",
    levelId: "basic",
    name: "Gia đình & Số đếm",
    icon: "👨‍👩‍👧‍👦",
    description: "Thành viên gia đình, đếm số, lượng từ 个 / 口 / 岁, câu chữ 有 / 没有.",
    examCount: 4,
  },
  {
    id: "basic-mua-sam",
    levelId: "basic",
    name: "Mua sắm & Ăn uống",
    icon: "🥟",
    description: "Hỏi giá, tiền tệ (块/元), gọi món ăn, đồ uống và sở thích 想 / 喜欢 / 要.",
    examCount: 4,
  },
  {
    id: "basic-thoi-gian",
    levelId: "basic",
    name: "Thời gian & Sinh hoạt",
    icon: "⏰",
    description: "Giờ giấc, thứ ngày tháng, lịch trình một ngày, phương hướng và vị trí 在.",
    examCount: 4,
  },

  // --- Trung cấp (HSK 3-4) ---
  {
    id: "inter-giao-thong",
    levelId: "intermediate",
    name: "Giao thông & Du lịch",
    icon: "🚅",
    description: "Phương tiện đi lại, hỏi đường, đặt vé tàu máy bay, hỏi kinh nghiệm 过 / 已经 / 从...到...",
    examCount: 4,
  },
  {
    id: "inter-cong-viec",
    levelId: "intermediate",
    name: "Công việc & Phỏng vấn",
    icon: "💼",
    description: "Môi trường công sở, xin việc, phỏng vấn, năng lực và câu chữ 把 / 被.",
    examCount: 4,
  },
  {
    id: "inter-suc-khoe",
    levelId: "intermediate",
    name: "Sức khỏe & Đời sống",
    icon: "🩺",
    description: "Khám bệnh, cảm sốt, lối sống lành mạnh, thói quen tập thể dục và bổ ngữ khả năng.",
    examCount: 4,
  },
  {
    id: "inter-giai-tri",
    levelId: "intermediate",
    name: "Sở thích & Văn hóa",
    icon: "🎨",
    description: "Âm nhạc, phim ảnh, lễ hội truyền thống Tết Trung Thu, Tết Nguyên Đán, so sánh 比.",
    examCount: 4,
  },

  // --- Nâng cao (HSK 5-6) ---
  {
    id: "adv-xa-hoi",
    levelId: "advanced",
    name: "Xã hội & Môi trường",
    icon: "🌍",
    description: "Phát triển bền vững, công nghệ số, bảo vệ môi trường, văn phong nghị luận chính luận.",
    examCount: 4,
  },
  {
    id: "adv-kinh-te",
    levelId: "advanced",
    name: "Kinh tế & Thương mại",
    icon: "📈",
    description: "Ký kết hợp đồng, đàm phán thương mại quốc tế, thị trường tài chính và quản trị doanh nghiệp.",
    examCount: 4,
  },
  {
    id: "adv-van-hoa",
    levelId: "advanced",
    name: "Triết lý & Thành ngữ",
    icon: "📜",
    description: "Thành ngữ 4 chữ kinh điển, văn học, ngụ ngôn, tư tưởng triết học Nho gia và Đạo gia.",
    examCount: 4,
  },
];
