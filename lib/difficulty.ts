/**
 * Helper to manage level-based adaptive difficulty, deceptive lookalike characters (形近字),
 * homophones/near-homophones (同音/近音字), and level-specific distractor generation.
 */

// Deceptive lookalike characters (chữ hình gần giống nhau nhưng viết khác 1 nét hoặc bộ thủ)
export const LOOKALIKE_CHARACTERS_MAP: Record<string, string[]> = {
  // Trợ từ & ngữ pháp
  的: ["得", "地"],
  得: ["的", "地"],
  地: ["的", "得"],
  把: ["被", "拔", "爸"],
  被: ["把", "破", "披"],
  在: ["再", "存"],
  再: ["在", "冉"],
  做: ["作", "坐", "座"],
  作: ["做", "昨", "乍"],
  买: ["卖"],
  卖: ["买"],
  已: ["己", "巳"],
  己: ["已", "巳"],
  巳: ["已", "己"],
  即: ["既", "卿"],
  既: ["即", "概"],
  辨: ["辩", "辫", "瓣"],
  辩: ["辨", "辫", "瓣"],
  辫: ["辨", "辩", "瓣"],
  瓣: ["辨", "辩", "辫"],
  需: ["须", "儒"],
  须: ["需", "顺"],
  带: ["戴", "滞"],
  戴: ["带", "载"],
  座: ["坐", "挫"],
  坐: ["座", "佐"],
  末: ["未", "本"],
  未: ["末", "朱"],
  拔: ["拨", "发"],
  拨: ["拔", "波"],
  决: ["绝", "快"],
  绝: ["决", "断"],
  治: ["冶", "油"],
  冶: ["治", "谷"],
  厉: ["历", "励"],
  历: ["厉", "励"],
  励: ["厉", "历"],
  象: ["像", "相"],
  像: ["象", "相"],
  赢: ["羸", "嬴"],
  羸: ["赢", "嬴"],
  券: ["卷", "拳"],
  卷: ["券", "圈"],
  度: ["渡", "席"],
  渡: ["度", "渡"],
  防: ["妨", "仿"],
  妨: ["防", "仿"],
  仿: ["防", "妨", "访"],
  哪: ["那", "谁"],
  那: ["哪", "这"],
  喝: ["渴", "唱"],
  渴: ["喝"],
  进: ["近", "尽"],
  近: ["进", "远"],
  尽: ["进", "近"],
  晴: ["睛", "请", "清", "情"],
  睛: ["晴", "请", "清", "情"],
  请: ["晴", "睛", "清", "情"],
  清: ["晴", "睛", "请", "情"],
  情: ["晴", "睛", "请", "清"],
  休: ["体", "休"],
  体: ["休", "本"],
  日: ["目", "白", "曰"],
  目: ["日", "且"],
  免: ["兔", "龟"],
  兔: ["免"],
};

// Common deceptive distractors per HSK level
export const LEVEL_DISTRACTOR_POOLS: Record<
  number,
  {
    tiles: string[];
    matching: string[];
  }
> = {
  // HSK 1
  1: {
    tiles: ["吗", "是", "在", "了", "的", "谁", "哪", "那", "不", "没", "很", "个", "日", "目", "休", "体"],
    matching: [
      "Bác sĩ", "Gia đình", "Trường học", "Cảm ơn", "Quả táo", "Buổi tối", "Nước ngọt", "Tạm biệt",
      "Xe đạp", "Bánh bao", "Mặt trời", "Quyển sách", "Số mười", "Bạn học", "Bệnh viện"
    ],
  },
  // HSK 2
  2: {
    tiles: ["过", "得", "比", "从", "到", "着", "把", "要", "想", "都", "再", "正在", "买", "卖", "进", "近", "喝", "渴"],
    matching: [
      "Phòng khách", "Thời tiết", "Bên phải", "Chạy bộ", "Đắt quá", "Siêu thị", "Đôi giày", "Cửa hàng",
      "Vé xem phim", "Màu đen", "Cây cầu", "Sân bay", "Thuốc uống", "Xe buýt", "Nhà ga"
    ],
  },
  // HSK 3
  3: {
    tiles: ["虽然", "但是", "已经", "被", "把", "为了", "关于", "一边", "越", "极了", "得", "地", "做", "作", "再", "在", "带", "戴", "坐", "座"],
    matching: [
      "Vé máy bay", "Hướng dẫn viên", "Tắc đường", "Bảo hiểm", "Thư viện", "Phong cảnh", "Thang máy", "Kinh nghiệm",
      "Khách sạn", "Bệnh viện", "Hành lý", "Hộ chiếu", "Nhiệt độ", "Đồng hồ", "Thực đơn", "Tài xế", "Hàng xóm"
    ],
  },
  // HSK 4
  4: {
    tiles: ["不仅", "而且", "即使", "也", "无论", "都", "从而", "其实", "究竟", "千万", "把", "被", "戴", "带", "坐", "座", "已", "己", "末", "未", "拨", "拔"],
    matching: [
      "Đồng nghiệp", "Tăng ca", "Báo cáo", "Kinh điển", "Phỏng vấn", "Hợp đồng", "Thư giãn", "Tập thể dục",
      "Quyền lợi", "Phê duyệt", "Lương bổng", "Thăng tiến", "Giao tiếp", "Kỹ năng", "Hội nghị", "Khách hàng", "Thị trường"
    ],
  },
  // HSK 5
  5: {
    tiles: ["旨在", "鉴于", "显而易见", "从而", "极其", "以至", "索性", "不妨", "毋庸", "辨", "辩", "即", "既", "需", "须", "决", "绝", "象", "像", "度", "渡", "防", "妨"],
    matching: [
      "Lạm phát", "Bằng sáng chế", "Rủi ro", "Môi trường", "Phát triển", "Thuế quan", "Cổ phiếu", "Trách nhiệm",
      "Thương thuyết", "Bất khả kháng", "Lợi nhuận", "Cạnh tranh", "Khấu hao", "Dung hòa", "Chính sách", "Chuyển giao", "Cung ứng"
    ],
  },
  // HSK 6
  6: {
    tiles: ["潜移默化", "精益求精", "循序渐进", "终究", "固然", "势必", "藉此", "未免", "赢", "羸", "拔", "拨", "券", "卷", "历", "厉", "辨", "辩", "瓣", "治", "冶"],
    matching: [
      "Sức mạnh mềm", "Thuật toán", "Dung hợp", "Độc quyền", "Chiến lược", "Bất khả kháng", "Dân số già", "Bản quyền",
      "Tự lực tự cường", "Nhập gia tùy tục", "Cân bằng sinh thái", "Khai thác quá độ", "Chuỗi cung ứng", "Điều tiết vĩ mô", "Biện chứng pháp", "Thế lưỡng nan"
    ],
  },
};

/**
 * Returns level-specific difficulty settings for quiz rendering:
 * - showPinyinByDefault: boolean
 * - allowPinyinToggle: boolean
 * - allowTypingMode: boolean (user can choose to type directly rather than clicking tiles)
 * - defaultToTypingMode: boolean
 * - distractorTilesCount: number of distractors to inject into word order
 * - matchingDistractorsCount: number of distractors to inject into matching
 * - badgeLabel: string
 */
export interface LevelDifficultyConfig {
  showPinyinByDefault: boolean;
  allowPinyinToggle: boolean;
  allowTypingMode: boolean;
  defaultToTypingMode: boolean;
  distractorTilesCount: number;
  matchingDistractorsCount: number;
  badgeLabel: string;
  badgeColor: string;
  instructionTip: string;
}

export function getLevelDifficultyConfig(hskLevel: number): LevelDifficultyConfig {
  if (hskLevel <= 2) {
    return {
      showPinyinByDefault: true,
      allowPinyinToggle: false,
      allowTypingMode: false,
      defaultToTypingMode: false,
      distractorTilesCount: 3,
      matchingDistractorsCount: 3,
      badgeLabel: "Cơ bản: Có Pinyin trợ giúp",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      instructionTip: "Xếp câu bằng các viên gạch, có Pinyin hỗ trợ nhận diện phát âm.",
    };
  }

  if (hskLevel <= 4) {
    return {
      showPinyinByDefault: false,
      allowPinyinToggle: true,
      allowTypingMode: true,
      defaultToTypingMode: false,
      distractorTilesCount: 5,
      matchingDistractorsCount: 6,
      badgeLabel: "Trung cấp: Ẩn Pinyin • Thử thách Hán tự & Bẫy ngữ pháp",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-300",
      instructionTip: "Pinyin đã ẩn để rèn trí nhớ mặt chữ. Hỗ trợ tự gõ câu hoặc dùng viên gạch có chứa từ gây nhiễu.",
    };
  }

  // Advanced (HSK 5-6)
  return {
    showPinyinByDefault: false,
    allowPinyinToggle: false,
    allowTypingMode: true,
    defaultToTypingMode: true, // Defaults to typing mode so user actively recalls words
    distractorTilesCount: 6,
    matchingDistractorsCount: 8, // 5 left + 8 distractors = 13 right choices!
    badgeLabel: "Nâng cao: Chuyên sâu • Bẫy chữ hình gần nghĩa gần • Gõ tay",
    badgeColor: "bg-red-50 text-red-900 border-red-300",
    instructionTip: "Thử thách cực hạn: Chế độ tự gõ bàn phím (hoặc chọn viên gạch chứa bẫy chữ viết giống nhau 1 nét). Cột nối có tới 10-13 lựa chọn.",
  };
}

/**
 * Finds lookalike or deceptive distractor characters for a given list of correct words
 */
export function getLookalikeDistractors(words: string[]): string[] {
  const result: string[] = [];
  for (const word of words) {
    for (const char of word) {
      const lookalikes = LOOKALIKE_CHARACTERS_MAP[char];
      if (lookalikes) {
        for (const lk of lookalikes) {
          if (!words.includes(lk) && !result.includes(lk)) {
            result.push(lk);
          }
        }
      }
    }
  }
  return result;
}
