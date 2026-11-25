/**
 * Assessment & Roadmap Engine for Hanyu Practice
 * Strictly adheres to HSK specifications and user JSON contract:
 * - MODE = "generate_test"
 * - MODE = "evaluate_test"
 * - MODE = "generate_roadmap"
 */

export interface AssessmentQuestion {
  id: number;
  level: number;
  skill: "vocab" | "grammar" | "reading";
  question: string;
  pinyin?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: "A" | "B" | "C" | "D";
  explanation: string;
  topicTag?: string;
}

export interface GenerateTestResponse {
  test_id: string;
  questions: AssessmentQuestion[];
}

export interface EvaluateTestResponse {
  verified_level: number;
  score_by_level: Record<string, string>;
  strengths: string[];
  weak_points: string[];
  weak_skills: ("vocab" | "grammar" | "reading")[];
  message: string;
}

export interface RoadmapLesson {
  id: string;
  type: "new" | "review" | "test" | "remedial";
  topic: string;
  new_words: number;
  grammar: string[];
  skills: string[];
  estimated_minutes: number;
}

export interface RoadmapWeek {
  week: number;
  goal: string;
  lessons: RoadmapLesson[];
}

export interface GenerateRoadmapResponse {
  summary: string;
  from_level: number;
  to_level: number;
  total_weeks: number;
  weeks: RoadmapWeek[];
}

// ============================================================================
// QUESTION BANK CHUẨN THEO HSK 1 ĐẾN HSK 6
// ============================================================================
const ASSESSMENT_BANK: AssessmentQuestion[] = [
  // --- HSK 1 ---
  {
    id: 101,
    level: 1,
    skill: "vocab",
    question: "请问，您贵姓？",
    pinyin: "Qǐngwèn, nín guìxìng?",
    options: {
      A: "我叫李明 (Wǒ jiào Lǐ Míng)",
      B: "我姓王 (Wǒ xìng Wáng)",
      C: "我是学生 (Wǒ shì xuésheng)",
      D: "再见 (Zàijiàn)",
    },
    answer: "B",
    explanation: "Câu hỏi '您贵姓？' hỏi về họ một cách trang trọng, câu trả lời chuẩn là '我姓 + Họ'.",
    topicTag: "Chào hỏi & Họ tên (HSK 1)",
  },
  {
    id: 102,
    level: 1,
    skill: "grammar",
    question: "桌子上___三本书。",
    pinyin: "Zhuōzi shang ___ sān běn shū.",
    options: {
      A: "在 (zài)",
      B: "有 (yǒu)",
      C: "是 (shì)",
      D: "看 (kàn)",
    },
    answer: "B",
    explanation: "Cấu trúc câu tồn hiện: Nơi chốn + 有 + Số lượng từ + Danh từ (Trên bàn có ba quyển sách).",
    topicTag: "Câu chữ 有 biểu thị tồn tại (HSK 1)",
  },
  {
    id: 103,
    level: 1,
    skill: "reading",
    question: "明天是星期天，我不去学校。我明天去学校吗？",
    pinyin: "Míngtiān shì xīngqītiān, wǒ bú qù xuéxiào. Wǒ míngtiān qù xuéxiào ma?",
    options: {
      A: "不去 (Bú qù)",
      B: "去 (Qù)",
      C: "想去 (Xiǎng qù)",
      D: "不知道 (Bù zhīdào)",
    },
    answer: "A",
    explanation: "Đoạn văn nêu rõ '我不去学校' (tôi không đến trường).",
    topicTag: "Đọc hiểu thời gian & sinh hoạt (HSK 1)",
  },

  // --- HSK 2 ---
  {
    id: 201,
    level: 2,
    skill: "vocab",
    question: "这件衣服太贵了，能不能___一点儿？",
    pinyin: "Zhè jiàn yīfu tài guì le, néng bu néng ___ yìdiǎnr?",
    options: {
      A: "便宜 (piányi)",
      B: "高 (gāo)",
      C: "远 (yuǎn)",
      D: "快 (kuài)",
    },
    answer: "A",
    explanation: "Ngược nghĩa với '贵' (đắt) là '便宜' (rẻ). Cả câu: Bộ quần áo này đắt quá, có thể rẻ hơn chút không?",
    topicTag: "Từ vựng mua sắm & tính từ trái nghĩa (HSK 2)",
  },
  {
    id: 202,
    level: 2,
    skill: "grammar",
    question: "今天的天气___昨天冷一点儿。",
    pinyin: "Jīntiān de tiānqì ___ zuótiān lěng yìdiǎnr.",
    options: {
      A: "比 (bǐ)",
      B: "跟 (gēn)",
      C: "像 (xiàng)",
      D: "和 (hé)",
    },
    answer: "A",
    explanation: "Cấu trúc so sánh hơn: A + 比 + B + Tính từ + 一点儿 (Hôm nay trời lạnh hơn hôm qua một chút).",
    topicTag: "Câu so sánh chữ 比 (HSK 2)",
  },
  {
    id: 203,
    level: 2,
    skill: "reading",
    question: "小王去外地出差了，下周一才回来。问：小王现在在哪里？",
    pinyin: "Xiǎo Wáng qù wàidì chūchāi le, xià zhōuyī cái huílái. Wèn: Xiǎo Wáng xiànzài zài nǎlǐ?",
    options: {
      A: "在家里 (Zài jiālǐ)",
      B: "在外地 (Zài wàidì)",
      C: "在学校 (Zài xuéxiào)",
      D: "在北京 (Zài Běijīng)",
    },
    answer: "B",
    explanation: "Câu văn nêu '去外地出差了' (đã đi công tác nơi khác), nên hiện tại đang ở nơi khác (外地).",
    topicTag: "Đọc hiểu thông tin công việc & địa điểm (HSK 2)",
  },

  // --- HSK 3 ---
  {
    id: 301,
    level: 3,
    skill: "vocab",
    question: "因为路上堵车，所以我上班___了二十分钟。",
    options: {
      A: "迟到 (chídào)",
      B: "离开 (líkāi)",
      C: "结束 (jiéshù)",
      D: "满意 (mǎnyì)",
    },
    answer: "A",
    explanation: "Vì tắc đường nên đi làm bị muộn/trễ: 迟到 (chídào - đến muộn).",
    topicTag: "Từ vựng giao thông & công sở (HSK 3)",
  },
  {
    id: 302,
    level: 3,
    skill: "grammar",
    question: "请你把桌子上的书___到书架上去。",
    options: {
      A: "放 (fàng)",
      B: "跑 (pǎo)",
      C: "看 (kàn)",
      D: "听 (tīng)",
    },
    answer: "A",
    explanation: "Cấu trúc câu chữ 把 biểu thị xử lý và di chuyển vị trí: 把 + Tân ngữ + 放 + 到...去.",
    topicTag: "Cú pháp câu chữ 把 (HSK 3)",
  },
  {
    id: 303,
    level: 3,
    skill: "reading",
    question: "虽然这份工作薪水不是很高，但他学到了很多实用的经验。问：他对这份工作满意的是什么？",
    options: {
      A: "薪水高",
      B: "工作轻松",
      C: "学到实用经验",
      D: "离家很近",
    },
    answer: "C",
    explanation: "Đoạn văn nêu rõ điểm tích cực là: 学到了很多实用的经验 (học được nhiều kinh nghiệm thực tế).",
    topicTag: "Đọc hiểu cấu trúc 虽然...但是 (HSK 3)",
  },

  // --- HSK 4 ---
  {
    id: 401,
    level: 4,
    skill: "vocab",
    question: "经过双方认真讨论，两家公司终于签订了正式的___。",
    options: {
      A: "合同 (hétong)",
      B: "杂志 (zázhì)",
      C: "表格 (biǎogé)",
      D: "发票 (fāpiào)",
    },
    answer: "A",
    explanation: "签订合同 (qiāndìng hétong): ký kết hợp đồng kinh tế/thương mại.",
    topicTag: "Từ vựng hợp đồng & thương mại (HSK 4)",
  },
  {
    id: 402,
    level: 4,
    skill: "grammar",
    question: "自行车被弟弟___坏了，现在不能骑了。",
    options: {
      A: "弄 (nòng)",
      B: "放 (fàng)",
      C: "借 (jiè)",
      D: "等 (děng)",
    },
    answer: "A",
    explanation: "Cấu trúc câu chữ 被: Chủ ngữ + 被 + Tác nhân + 弄坏 (làm cho hỏng).",
    topicTag: "Cú pháp câu bị động chữ 被 (HSK 4)",
  },
  {
    id: 403,
    level: 4,
    skill: "reading",
    question: "成功往往不是一蹴而就的，它需要长期的坚持和不断的积累。问：作者认为成功需要什么？",
    options: {
      A: "运气和天赋",
      B: "长期坚持与积累",
      C: "别人的同情",
      D: "快速达成目标",
    },
    answer: "B",
    explanation: "Tác giả chỉ ra: 需要长期的坚持和不断的积累 (cần sự kiên trì lâu dài và tích lũy không ngừng).",
    topicTag: "Đọc hiểu nghị luận & nhân sinh (HSK 4)",
  },

  // --- HSK 5 ---
  {
    id: 501,
    level: 5,
    skill: "vocab",
    question: "为了防止市场出现恶性竞争，政府部门出台了多项监管___。",
    options: {
      A: "措施 (cuòshī)",
      B: "态度 (tàidu)",
      C: "愿望 (yuànwàng)",
      D: "借口 (jièkǒu)",
    },
    answer: "A",
    explanation: "出台监管措施 (chūtái jiānguǎn cuòshī): ban hành các biện pháp giám sát quản lý.",
    topicTag: "Thuật ngữ chính sách & quản lý vĩ mô (HSK 5)",
  },
  {
    id: 502,
    level: 5,
    skill: "grammar",
    question: "这项技术___提高了生产效率，___大幅降低了能源消耗。",
    options: {
      A: "不仅……而且……",
      B: "哪怕……也……",
      C: "与其……不如……",
      D: "虽然……但是……",
    },
    answer: "A",
    explanation: "Cặp liên từ tăng tiến: 不仅……而且…… (không những... mà còn...).",
    topicTag: "Liên từ tăng tiến phức hợp (HSK 5)",
  },
  {
    id: 503,
    level: 5,
    skill: "reading",
    question: "随着数字经济的发展，知识产权保护已成为衡量一个国家创新活力的关键指标。问：这段话主要讨论什么？",
    options: {
      A: "数字经济对传统产业的冲击",
      B: "知识产权保护对创新活力的重要性",
      C: "如何降低技术研发成本",
      D: "跨国贸易的关税壁垒",
    },
    answer: "B",
    explanation: "Trọng tâm: 知识产权保护已成为衡量创新活力的关键指标.",
    topicTag: "Đọc hiểu kinh tế số & sở hữu trí tuệ (HSK 5)",
  },

  // --- HSK 6 ---
  {
    id: 601,
    level: 6,
    skill: "vocab",
    question: "这篇学术论文逻辑严密，论证有力，堪称该研究领域的___之作。",
    options: {
      A: "脍炙人口",
      B: "登峰造极",
      C: "画蛇添足",
      D: "滥竽充数",
    },
    answer: "B",
    explanation: "登峰造极 (dēng fēng zào jí): đạt đến đỉnh cao tuyệt đỉnh của nghệ thuật hoặc học thuật.",
    topicTag: "Thành ngữ 4 chữ học thuật (HSK 6)",
  },
  {
    id: 602,
    level: 6,
    skill: "grammar",
    question: "我们固然赞同引入新机制，___盲目照搬外国模式势必会水土不服。",
    options: {
      A: "但 (dàn)",
      B: "因而 (yīn'ér)",
      C: "索性 (suǒxìng)",
      D: "毋庸 (wúyōng)",
    },
    answer: "A",
    explanation: "Cấu trúc nhượng bộ tương phản: 固然……但/然而…… (tuy rằng... nhưng...).",
    topicTag: "Cấu trúc nhượng bộ chính luận (HSK 6)",
  },
  {
    id: 603,
    level: 6,
    skill: "reading",
    question: "生态系统的复杂性决定了人类的干预必须遵循客观规律，切忌急功近利。这段话告诫我们：",
    options: {
      A: "应尊重自然规律，不可盲目急于求成",
      B: "科技可以彻底重塑生态环境",
      C: "经济利益必须优先于环境保护",
      D: "任何人为干预都是不可行的",
    },
    answer: "A",
    explanation: "Nội dung: 必须遵循客观规律，切忌急功近利 (phải thuận theo quy luật khách quan, chớ hám lợi trước mắt).",
    topicTag: "Tư tưởng triết luận sinh thái (HSK 6)",
  },
];

// ============================================================================
// MODE 1: GENERATE TEST
// ============================================================================
export function generateAssessmentTest(params?: {
  questions_per_level?: number;
  max_level?: number;
  script?: "giản thể" | "phồn thể";
  hsk_system?: string;
}): GenerateTestResponse {
  const questionsPerLevel = params?.questions_per_level || 3;
  const maxLevel = Math.min(Math.max(params?.max_level || 4, 1), 6);

  const selectedQuestions: AssessmentQuestion[] = [];
  let currentId = 1;

  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    const levelQuestions = ASSESSMENT_BANK.filter((q) => q.level === lvl);
    // Shuffle and pick questionsPerLevel
    const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, questionsPerLevel);

    for (const q of chosen) {
      const entries = Object.entries(q.options) as [("A" | "B" | "C" | "D"), string][];
      const correctText = q.options[q.answer];
      const shuffledValues = entries.map(([, val]) => val).sort(() => Math.random() - 0.5);
      const keys = ["A", "B", "C", "D"] as const;
      const newOptions = {
        A: shuffledValues[0],
        B: shuffledValues[1],
        C: shuffledValues[2],
        D: shuffledValues[3],
      };
      const newAnswerIndex = shuffledValues.indexOf(correctText);
      const newAnswer = keys[newAnswerIndex >= 0 ? newAnswerIndex : 0];
      selectedQuestions.push({
        ...q,
        id: currentId++,
        options: newOptions,
        answer: newAnswer,
      });
    }
  }

  return {
    test_id: `test_hsk_${Date.now()}_lv1_${maxLevel}`,
    questions: selectedQuestions,
  };
}

// ============================================================================
// MODE 2: EVALUATE TEST
// ============================================================================
export function evaluateAssessmentTest(
  testQuestions: AssessmentQuestion[],
  userAnswers: Record<number | string, string>
): EvaluateTestResponse {
  // Group by level
  const levelStats: Record<number, { correct: number; total: number; questions: AssessmentQuestion[] }> = {};

  for (const q of testQuestions) {
    if (!levelStats[q.level]) {
      levelStats[q.level] = { correct: 0, total: 0, questions: [] };
    }
    levelStats[q.level].total += 1;
    levelStats[q.level].questions.push(q);

    const userAns = String(userAnswers[q.id] || "").trim().toUpperCase();
    if (userAns === q.answer.toUpperCase()) {
      levelStats[q.level].correct += 1;
    }
  }

  const scoreByLevel: Record<string, string> = {};
  const strengths: string[] = [];
  const weakPoints: string[] = [];
  const weakSkillsSet = new Set<"vocab" | "grammar" | "reading">();

  const sortedLevels = Object.keys(levelStats)
    .map(Number)
    .sort((a, b) => a - b);

  let verifiedLevel = 0;
  let canAdvance = true;

  for (const lvl of sortedLevels) {
    const stat = levelStats[lvl];
    scoreByLevel[String(lvl)] = `${stat.correct}/${stat.total}`;

    // Đạt khi đúng từ 2/3 số câu trở lên
    const isLevelPassed = stat.total > 0 && stat.correct / stat.total >= 2 / 3;

    if (isLevelPassed && canAdvance) {
      verifiedLevel = lvl;
      strengths.push(`Nắm vững kiến thức trọng tâm HSK ${lvl} (${stat.correct}/${stat.total} câu)`);
    } else {
      canAdvance = false; // Trình độ = cấp cao nhất đạt VÀ đã đạt tất cả các cấp thấp hơn
    }

    // Phân tích các câu làm sai để tìm weak_points và weak_skills
    for (const q of stat.questions) {
      const userAns = String(userAnswers[q.id] || "").trim().toUpperCase();
      if (userAns !== q.answer.toUpperCase()) {
        weakSkillsSet.add(q.skill);
        if (q.topicTag && !weakPoints.includes(q.topicTag)) {
          weakPoints.push(q.topicTag);
        }
      }
    }
  }

  if (verifiedLevel === 0 && strengths.length === 0) {
    strengths.push("Đang ở giai đoạn bắt đầu làm quen với phát âm & chữ Hán");
  }

  // Thông báo kết quả
  let message = "";
  if (verifiedLevel === 0) {
    message = "Bạn đang ở trình độ Mới bắt đầu (HSK 0). Hãy khởi đầu từ phát âm Pinyin chuẩn để xây dựng nền tảng vững chắc!";
  } else {
    message = `Chúc mừng bạn! Trình độ xác nhận của bạn hiện tại là HSK ${verifiedLevel}. Bạn đã nắm vững các chủ điểm quan trọng của cấp độ này và sẵn sàng bứt phá lên cấp tiếp theo.`;
  }

  return {
    verified_level: verifiedLevel,
    score_by_level: scoreByLevel,
    strengths,
    weak_points: weakPoints.slice(0, 6),
    weak_skills: Array.from(weakSkillsSet),
    message,
  };
}

// ============================================================================
// MODE 3: GENERATE ROADMAP
// ============================================================================
export function generateAssessmentRoadmap(params: {
  verified_level: number;
  target_level?: number;
  daily_minutes?: number;
  weak_points?: string[];
  weak_skills?: string[];
}): GenerateRoadmapResponse {
  const verified = Math.max(0, params.verified_level);
  const target = Math.max(verified + 1, params.target_level || verified + 1);
  const dailyMins = params.daily_minutes || 30;
  const weakPoints = params.weak_points || [];
  const weakSkills = params.weak_skills || ["vocab", "grammar"];

  const weeks: RoadmapWeek[] = [];
  let currentWeek = 1;

  // 1. NẾU VERIFIED = 0: Tuần 1 bắt buộc dạy phát âm Pinyin & thanh điệu
  if (verified === 0) {
    weeks.push({
      week: currentWeek++,
      goal: "Làm chủ bảng phiên âm Pinyin, 4 thanh điệu chuẩn xác và 20 chữ Hán tượng hình căn bản",
      lessons: [
        {
          id: `w1_l1`,
          type: "new",
          topic: "Bảng thanh mẫu (Phụ âm) & Vận mẫu đơn (a, o, e, i, u, ü)",
          new_words: 6,
          grammar: ["Quy tắc ghi dấu thanh điệu", "Quy tắc biến điệu chữ 不"],
          skills: ["listening", "speaking"],
          estimated_minutes: dailyMins,
        },
        {
          id: `w1_l2`,
          type: "new",
          topic: "Phân biệt các âm khó người Việt hay nhầm (zh/j, ch/q, sh/x)",
          new_words: 8,
          grammar: ["Quy tắc phát âm âm mặt lưỡi vs âm đầu lưỡi sau"],
          skills: ["listening", "speaking"],
          estimated_minutes: dailyMins,
        },
        {
          id: `w1_l3`,
          type: "new",
          topic: "8 Nét cơ bản và quy tắc bút thuận viết chữ Hán",
          new_words: 8,
          grammar: ["Quy tắc từ trên xuống dưới, từ trái sang phải"],
          skills: ["writing", "reading"],
          estimated_minutes: dailyMins,
        },
        {
          id: `w1_l4`,
          type: "review",
          topic: "Ôn tập tổng hợp ghép âm Pinyin & Phản xạ nhận diện chữ Hán",
          new_words: 0,
          grammar: ["Biến điệu thanh 3 (2 thanh 3 đi liền nhau)"],
          skills: ["listening", "reading"],
          estimated_minutes: dailyMins,
        },
        {
          id: `w1_l5`,
          type: "test",
          topic: "Kiểm tra đánh giá phát âm & 20 chữ Hán nền tảng",
          new_words: 0,
          grammar: ["Tổng hợp ngữ âm căn bản"],
          skills: ["test"],
          estimated_minutes: dailyMins,
        },
      ],
    });
  }

  // 2. NẾU CÓ ĐIỂM YẾU CỤ THỂ (weak_points): Gom thành bài củng cố ("remedial") ở tuần tiếp theo
  if (weakPoints.length > 0) {
    weeks.push({
      week: currentWeek++,
      goal: `Củng cố dứt điểm ${weakPoints.length} lỗ hổng kiến thức đã phát hiện trong bài kiểm tra`,
      lessons: [
        ...weakPoints.slice(0, 3).map((wp, idx) => ({
          id: `w${currentWeek - 1}_l${idx + 1}`,
          type: "remedial" as const,
          topic: `Chuyên đề củng cố: ${wp}`,
          new_words: 5,
          grammar: [`Khắc phục lỗi sai thường gặp: ${wp}`],
          skills: weakSkills.length > 0 ? weakSkills : ["grammar", "reading"],
          estimated_minutes: dailyMins,
        })),
        {
          id: `w${currentWeek - 1}_l4`,
          type: "review" as const,
          topic: "Luyện tập phản xạ câu hỏi hay sai từ Sổ lỗi sai",
          new_words: 0,
          grammar: ["Tổng hợp khắc phục bẫy ngữ pháp"],
          skills: ["reading", "grammar"],
          estimated_minutes: dailyMins,
        },
        {
          id: `w${currentWeek - 1}_l5`,
          type: "test" as const,
          topic: "Bài kiểm tra nhanh xác nhận đã làm chủ các điểm yếu",
          new_words: 0,
          grammar: ["Đánh giá khả năng sửa lỗi"],
          skills: ["test"],
          estimated_minutes: dailyMins,
        },
      ],
    });
  }

  // 3. NỘI DUNG LỘ TRÌNH CHÍNH TỪ LEVEL KẾ TIẾP ĐẾN TARGET LEVEL
  const startLevel = verified === 0 ? 1 : verified + 1;

  for (let lvl = startLevel; lvl <= target; lvl++) {
    // Mỗi cấp độ phân bổ từ 2 đến 3 tuần tùy theo mục tiêu
    const weekCountForLevel = lvl <= 2 ? 2 : 3;

    for (let wIndex = 1; wIndex <= weekCountForLevel; wIndex++) {
      const isFinalWeekOfLevel = wIndex === weekCountForLevel;

      let weekGoal = "";
      let lessonList: RoadmapLesson[] = [];

      if (lvl === 1) {
        weekGoal = `Chinh phục 150 từ vựng cốt lõi & các mẫu câu giao tiếp cơ bản HSK 1 (Giai đoạn ${wIndex}/${weekCountForLevel})`;
        lessonList = [
          {
            id: `w${currentWeek}_l1`,
            type: "new",
            topic: "Chào hỏi, xưng hô và giới thiệu bản thân (我, 你, 他, 叫, 是)",
            new_words: 10,
            grammar: ["Cấu trúc câu phán đoán: A 是 B", "Đại từ nhân xưng"],
            skills: ["reading", "speaking"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l2`,
            type: "new",
            topic: "Số đếm, tuổi tác và người trong gia đình (爸爸, 妈妈, 家, 口)",
            new_words: 10,
            grammar: ["Câu chữ 有 biểu thị sở hữu", "Lượng từ 个 và 口"],
            skills: ["vocab", "reading"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l3`,
            type: "new",
            topic: "Hỏi giá cả, mua sắm hoa quả và đồ uống (多少钱, 苹果, 水, 块)",
            new_words: 12,
            grammar: ["Câu hỏi nghi vấn chữ 多少", "Số từ + Lượng từ + Danh từ"],
            skills: ["vocab", "listening"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l4`,
            type: isFinalWeekOfLevel ? "review" : "new",
            topic: isFinalWeekOfLevel
              ? "Hệ thống hóa toàn bộ từ vựng & ngữ pháp trọng tâm HSK 1"
              : "Hỏi giờ giấc, ngày tháng và hoạt động trong ngày (点, 分, 星期, 去)",
            new_words: isFinalWeekOfLevel ? 0 : 10,
            grammar: isFinalWeekOfLevel ? ["Tổng kết trợ từ 的, 吗, 呢"] : ["Trật tự thời gian trước hành động"],
            skills: ["reading", "grammar"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l5`,
            type: isFinalWeekOfLevel ? "test" : "review",
            topic: isFinalWeekOfLevel
              ? "BÀI KIỂM TRA TỔNG KẾT MỞ KHÓA HSK 1 (Mock Exam HSK 1)"
              : "Luyện đề đọc hiểu và bài tập trắc nghiệm củng cố tuần",
            new_words: 0,
            grammar: ["Đánh giá tổng hợp toàn diện"],
            skills: ["test"],
            estimated_minutes: dailyMins,
          },
        ];
      } else if (lvl === 2) {
        weekGoal = `Nắm vững 300 từ tích lũy & các cấu trúc so sánh, bổ ngữ HSK 2 (Giai đoạn ${wIndex}/${weekCountForLevel})`;
        lessonList = [
          {
            id: `w${currentWeek}_l1`,
            type: "new",
            topic: "Thời tiết, du lịch và miêu tả ngoại cảnh (晴, 阴, 冷, 热)",
            new_words: 12,
            grammar: ["Câu so sánh chữ 比: A 比 B + Tính từ", "Phó từ mức độ 最, 非常"],
            skills: ["grammar", "reading"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l2`,
            type: "new",
            topic: "Phương tiện đi lại, hỏi đường và khoảng cách (离, 远, 近, 坐)",
            new_words: 12,
            grammar: ["Kết cấu giới từ: 从...到...", "A 离 B + Khoảng cách"],
            skills: ["vocab", "listening"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l3`,
            type: "new",
            topic: "Sức khỏe, khám bệnh và thói quen sinh hoạt (生病, 药, 跑步, 休息)",
            new_words: 12,
            grammar: ["Trợ từ động thái 过 biểu thị trải nghiệm", "Động từ năng nguyện 可以, 应该"],
            skills: ["reading", "speaking"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l4`,
            type: isFinalWeekOfLevel ? "review" : "new",
            topic: isFinalWeekOfLevel
              ? "Tổng ôn toàn diện 150 từ mới & 8 mẫu câu chủ đạo HSK 2"
              : "Sở thích, mua sắm và thể thao giải trí (游泳, 唱歌, 踢足球)",
            new_words: isFinalWeekOfLevel ? 0 : 10,
            grammar: ["Cấu trúc câu hỏi chính phản"],
            skills: ["grammar", "vocab"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l5`,
            type: isFinalWeekOfLevel ? "test" : "review",
            topic: isFinalWeekOfLevel
              ? "BÀI THI TỔNG KẾT CẤP ĐỘ HSK 2 (Level Test HSK 2)"
              : "Luyện bài tập nối từ và sắp xếp câu phản xạ HSK 2",
            new_words: 0,
            grammar: ["Đánh giá tổng kết"],
            skills: ["test"],
            estimated_minutes: dailyMins,
          },
        ];
      } else if (lvl === 3) {
        weekGoal = `Bứt phá 600 từ vựng & làm chủ câu chữ 把, câu chữ 被, bổ ngữ trạng thái HSK 3 (Tuần ${wIndex}/${weekCountForLevel})`;
        lessonList = [
          {
            id: `w${currentWeek}_l1`,
            type: "new",
            topic: "Công việc công sở, phỏng vấn và thăng tiến (同事, 面试, 经理, 经验)",
            new_words: 14,
            grammar: ["Cú pháp câu xử lý chữ 把", "Bổ ngữ kết quả: 到, 见, 完"],
            skills: ["grammar", "reading"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l2`,
            type: "new",
            topic: "Giao thông đô thị, đặt vé và tình huống hoãn chuyến (航班, 延误, 护照, 租车)",
            new_words: 14,
            grammar: ["Câu bị động chữ 被", "Cấu trúc liên từ: 虽然……但是……"],
            skills: ["listening", "vocab"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l3`,
            type: "new",
            topic: "Miêu tả cảm xúc, tính cách và các hoạt động xã hội (热情, 严格, 认真, 满意)",
            new_words: 12,
            grammar: ["Phân biệt 3 trợ từ kết cấu 的, 得, 地", "Cấu trúc 越……越……"],
            skills: ["grammar", "writing"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l4`,
            type: isFinalWeekOfLevel ? "review" : "new",
            topic: isFinalWeekOfLevel
              ? "Chiến thuật bẫy từ đồng âm & cú pháp câu phức HSK 3"
              : "Môi trường sống, thuê nhà và tiện ích sinh hoạt (环境, 房租, 电梯, 方便)",
            new_words: isFinalWeekOfLevel ? 0 : 12,
            grammar: ["Bổ ngữ khả năng: V + 得/不 + Kết quả"],
            skills: ["reading", "grammar"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l5`,
            type: isFinalWeekOfLevel ? "test" : "review",
            topic: isFinalWeekOfLevel
              ? "BÀI KIỂM TRA CHỨNG NHẬN HOÀN THÀNH HSK 3 (Level-Up Exam HSK 3)"
              : "Luyện đề thực hành sắp xếp trật tự từ & nghe hiểu HSK 3",
            new_words: 0,
            grammar: ["Kiểm tra đánh giá"],
            skills: ["test"],
            estimated_minutes: dailyMins,
          },
        ];
      } else {
        // HSK 4, 5, 6
        weekGoal = `Chinh phục chuẩn HSK ${lvl}: Ngữ pháp nâng cao, thuật ngữ chuyên đề & văn phong chính luận (Tuần ${wIndex}/${weekCountForLevel})`;
        lessonList = [
          {
            id: `w${currentWeek}_l1`,
            type: "new",
            topic: `Chuyên đề thuật ngữ & từ vựng học thuật HSK ${lvl}`,
            new_words: 15,
            grammar: ["Cấu trúc liên từ phức hợp: 不仅……而且……", "Cấu trúc nhượng bộ"],
            skills: ["reading", "vocab"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l2`,
            type: "new",
            topic: `Phân biệt các cặp từ gần nghĩa & từ đồng âm chuyên sâu HSK ${lvl}`,
            new_words: 15,
            grammar: ["Bẫy chữ hình gần nghĩa gần (形近字 / 近义词)"],
            skills: ["grammar", "writing"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l3`,
            type: "new",
            topic: `Đọc hiểu văn bản dài, tin tức báo chí & phân tích lập luận HSK ${lvl}`,
            new_words: 15,
            grammar: ["Thành ngữ 4 chữ thông dụng", "Cấu trúc văn viết chính luận"],
            skills: ["reading", "comprehension"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l4`,
            type: "review",
            topic: `Chiến thuật làm bài thi HSK ${lvl} đạt điểm cao`,
            new_words: 0,
            grammar: ["Tổng hợp ngữ pháp toàn cấp độ"],
            skills: ["reading", "grammar"],
            estimated_minutes: dailyMins,
          },
          {
            id: `w${currentWeek}_l5`,
            type: isFinalWeekOfLevel ? "test" : "review",
            topic: isFinalWeekOfLevel
              ? `BÀI THI TỔNG KẾT TỐI CAO ĐẠT CHUẨN HSK ${lvl}`
              : `Luyện đề thi mô phỏng HSK ${lvl} dưới áp lực thời gian`,
            new_words: 0,
            grammar: ["Tổng kết"],
            skills: ["test"],
            estimated_minutes: dailyMins,
          },
        ];
      }

      weeks.push({
        week: currentWeek++,
        goal: weekGoal,
        lessons: lessonList,
      });
    }
  }

  const summary = `Lộ trình học cá nhân hóa từ HSK ${verified} lên HSK ${target} được thiết kế gồm ${weeks.length} tuần học với cường độ ${dailyMins} phút mỗi ngày. Lộ trình tối ưu hóa việc củng cố các điểm yếu ngữ pháp và tăng cường phản xạ từ vựng bám sát chuẩn thi chính thức.`;

  return {
    summary,
    from_level: verified,
    to_level: target,
    total_weeks: weeks.length,
    weeks,
  };
}
