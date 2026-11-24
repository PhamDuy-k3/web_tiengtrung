/**
 * Helper to manage level-based adaptive difficulty, deceptive lookalike characters (形近字),
 * homophones/near-homophones (同音/近音词), confusable grammatical particles (易混虚词),
 * and strictly-themed domain distractors based on official HSK standards.
 */

import { Question } from "@/types";

// ============================================================================
// 1. DECEPTIVE LOOKALIKE CHARACTERS (形近字: Khác 1 nét hoặc bộ thủ)
// ============================================================================
export const LOOKALIKE_CHARACTERS_MAP: Record<string, string[]> = {
  // Trợ từ & ngữ pháp cơ bản đến cao cấp
  的: ["得", "地"],
  得: ["的", "地"],
  地: ["的", "得"],
  把: ["被", "拔", "爸", "吧"],
  被: ["把", "破", "披", "坡"],
  在: ["再", "存", "左"],
  再: ["在", "冉"],
  做: ["作", "坐", "座"],
  作: ["做", "昨", "乍", "炸"],
  买: ["卖"],
  卖: ["买"],
  已: ["己", "巳"],
  己: ["已", "巳"],
  巳: ["已", "己"],
  即: ["既", "卿", "卸"],
  既: ["即", "概"],
  辨: ["辩", "辫", "瓣"],
  辩: ["辨", "辫", "瓣"],
  辫: ["辨", "辩", "瓣"],
  瓣: ["辨", "辩", "辫"],
  需: ["须", "儒"],
  须: ["需", "顺"],
  带: ["戴", "滞"],
  戴: ["带", "载"],
  座: ["坐", "挫", "座"],
  坐: ["座", "佐", "做"],
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
  防: ["妨", "仿", "访"],
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
  休: ["体", "本"],
  体: ["休", "本"],
  日: ["目", "白", "曰"],
  目: ["日", "且"],
  免: ["兔", "龟"],
  兔: ["免"],
  准: ["谁", "难"],
  准时: ["准备", "准确"],
  急: ["极", "及"],
  极: ["急", "级"],
};

// ============================================================================
// 2. HOMOPHONE & NEAR-HOMOPHONE TRAPS (同音/近音词: Cùng âm đọc hoặc âm gần)
// Thường xuất hiện trong đề HSK Trung cấp (HSK 3-4) và Nâng cao (HSK 5-6)
// ============================================================================
export const HOMOPHONE_TRAPS_MAP: Record<string, string[]> = {
  // Trợ từ & phó từ
  在: ["再"],
  再: ["在", "又"],
  坐: ["座", "做", "作"],
  座: ["坐", "作"],
  做: ["作", "坐"],
  作: ["做", "昨"],
  戴: ["带", "袋"],
  带: ["戴", "代"],
  须: ["需"],
  需: ["须"],
  辩: ["辨", "变"],
  辨: ["辩", "变"],
  像: ["象", "相"],
  象: ["像", "相"],
  即: ["既", "及"],
  既: ["即", "季"],
  绝: ["决"],
  决: ["绝"],
  度: ["渡"],
  渡: ["度"],
  权利: ["权力"],
  权力: ["权利"],
  反应: ["反映"],
  反映: ["反应"],
  制定: ["制订"],
  制订: ["制定"],
  截至: ["截止"],
  截止: ["截至"],
  启示: ["启事"],
  启事: ["启示"],
  交代: ["胶带"],
  必须: ["必需"],
  必需: ["必须"],
  化装: ["化妆"],
  化妆: ["化装"],
  申明: ["声明"],
  声明: ["申明"],
  考查: ["考察"],
  考察: ["考查"],
};

// ============================================================================
// 3. SYNTAX & GRAMMAR TRAP PARTICLES (易混虚词: Bẫy cấu trúc ngữ pháp)
// ============================================================================
export const SYNTAX_TRAP_MAP: Record<string, string[]> = {
  // Trợ từ kết cấu 的 / 得 / 地
  的: ["得", "地"],
  得: ["的", "地"],
  地: ["的", "得"],

  // Câu chữ 把 / 被 / 让
  把: ["被", "让", "给", "叫"],
  被: ["把", "让", "受", "叫"],
  让: ["把", "被", "请"],

  // Phó từ thời gian / tần suất
  刚: ["刚才", "刚刚"],
  刚才: ["刚", "正在"],
  已经: ["曾经", "刚才", "马上"],
  曾经: ["已经", "曾经"],
  正在: ["在", "正", "已经"],
  再: ["又", "还"], // Bẫy kinh điển: 再 (chưa xảy ra) vs 又 (đã lặp lại)
  又: ["再", "还"],

  // Liên từ sóng đôi
  不仅: ["虽然", "即使", "尽管"],
  虽然: ["即使", "尽管", "不仅"],
  即使: ["虽然", "无论", "如果"],
  无论: ["不管", "即使", "虽然"],
  从而: ["因而", "进而", "然而"],
  为了: ["因为", "由于", "关于"],

  // Động từ năng nguyện
  会: ["能", "可以"],
  能: ["会", "可以"],
  可以: ["能", "会", "应该"],

  // Bổ ngữ kết quả / xu hướng
  到: ["着", "见", "掉"],
  见: ["到", "着"],
  着: ["了", "过", "到"],
  过: ["了", "着"],
  了: ["过", "着"],
};

// ============================================================================
// 4. THEMED DISTRACTOR POOLS (Kho từ vựng nhiễu chuẩn hóa theo đúng đề tài/topic)
// Tuyệt đối không lấy từ vựng của chủ đề khác làm nhiễu!
// ============================================================================
export const THEMED_MATCHING_POOLS: Record<string, string[]> = {
  // --- Cơ bản (HSK 1-2) ---
  "basic-chao-hoi": [
    "Học sinh", "Bác sĩ", "Luật sư", "Người Trung Quốc", "Người Việt Nam", "Người nước ngoài",
    "Đồng nghiệp", "Bạn học", "Người quen", "Họ và tên", "Quốc tịch", "Tuổi tác"
  ],
  "basic-gia-dinh": [
    "Ông nội", "Bà nội", "Ông ngoại", "Bà ngoại", "Anh trai", "Chị gái", "Em trai", "Em gái",
    "Con trai", "Con gái", "Bố mẹ", "Vợ chồng", "Số đếm", "Bao nhiêu người", "Hai mươi tuổi"
  ],
  "basic-mua-sam": [
    "Bánh bao", "Trà sữa", "Cơm chiên", "Bát mì bò", "Bao nhiêu tiền", "Mắc quá", "Rẻ một chút",
    "Một cân táo", "Hai tệ rưỡi", "Thanh toán", "Tiền mặt", "Nước ngọt", "Cà phê đá", "Cửa hàng tiện lợi"
  ],
  "basic-thoi-gian": [
    "Sáng sớm", "Buổi trưa", "Buổi chiều", "Nửa đêm", "Hôm qua", "Ngày mai", "Ngày kia",
    "Cuối tuần", "Thứ hai tới", "Hai giờ rưỡi", "Mười lăm phút", "Lịch trình", "Năm sau"
  ],

  // --- Trung cấp (HSK 3-4) ---
  "inter-giao-thong": [
    "Tàu hỏa thông thường", "Xe buýt thành phố", "Xe máy", "Xe đạp công cộng", "Xe điện hai bánh",
    "Cổng lên máy bay", "Thẻ lên tàu", "Vé khứ hồi", "Vé một chiều", "Trạm trung chuyển",
    "Hành lý xách tay", "Hành lý ký gửi", "Chuyến bay hoãn giờ", "Tắc đường nghiêm trọng", "Hộ chiếu còn hạn", "Bằng lái xe"
  ],
  "inter-cong-viec": [
    "Hợp đồng lao động", "Đồng nghiệp cùng phòng", "Tăng ca cuối tuần", "Phỏng vấn trực tiếp", "Mức lương cơ bản",
    "Thực tập sinh", "Trợ cấp xăng xe", "Thăng chức trưởng phòng", "Hồ sơ xin việc", "Ký duyệt đề xuất",
    "Kế hoạch kinh doanh", "Khách hàng chiến lược", "Thương thảo hợp đồng", "Báo cáo tiến độ", "Thưởng năng suất"
  ],
  "inter-suc-khoe": [
    "Khám bệnh định kỳ", "Cảm cúm theo mùa", "Uống thuốc đúng liều", "Đau đầu chóng mặt", "Phẫu thuật nội soi",
    "Bảo hiểm y tế", "Sốt cao liên tục", "Xét nghiệm máu", "Nghỉ ốm hưởng lương", "Dị ứng phấn hoa",
    "Phục hồi chức năng", "Đo huyết áp", "Tập thể dục mỗi ngày", "Chế độ ăn kiêng", "Bác sĩ chuyên khoa"
  ],
  "inter-giai-tri": [
    "Phim tài liệu", "Buổi hòa nhạc", "Nhạc thính phòng", "Tết Trung thu sum họp", "Tết Nguyên đán cổ truyền",
    "Bánh trôi nước", "Triển lãm tranh ảnh", "Diễn viên chính", "Đạo diễn xuất sắc", "Kỳ nghỉ hè dài ngày",
    "Sở thích chụp ảnh", "Bảo tàng lịch sử", "Nhạc cụ dân tộc", "Truyền thống lâu đời", "Tác phẩm kinh điển"
  ],

  // --- Nâng cao (HSK 5-6) ---
  "adv-xa-hoi": [
    "Biến đổi khí hậu toàn cầu", "Bảo vệ môi trường sinh thái", "Năng lượng tái tạo", "Dân số già hóa nhanh chóng",
    "Tiến trình đô thị hóa", "Khoảng cách giàu nghèo", "Xử lý rác thải công nghiệp", "Mô hình phát triển bền vững",
    "An ninh lương thực", "Phúc lợi xã hội", "Chính sách an sinh", "Cân bằng sinh thái", "Hiệu ứng nhà kính"
  ],
  "adv-kinh-te": [
    "Lạm phát phi mã", "Bằng sáng chế độc quyền", "Rủi ro tín dụng doanh nghiệp", "Thâm hụt cán cân thương mại",
    "Cổ phiếu niêm yết sàn", "Tỷ suất sinh lời kỳ vọng", "Bão hòa thị trường tiêu dùng", "Rào cản thuế quan ngặt nghèo",
    "Sáp nhập và mua lại (M&A)", "Dòng tiền lưu động tự do", "Biến động tỷ giá hối đoái", "Tài sản thế chấp ngân hàng",
    "Khấu hao tài sản cố định", "Điều tiết kinh tế vĩ mô"
  ],
  "adv-van-hoa": [
    "Dục tốc bất đạt (vội vàng hỏng việc)", "Nhập gia tùy tục (theo phong tục sở tại)", "Khổ tận cam lai (hết khổ đến sướng)",
    "Tự lực cánh sinh (tự mình phấn đấu)", "Gia hòa vạn sự hưng (nhà êm việc thuận)", "Uống nước nhớ nguồn (tri ân tiền nhân)",
    "Bán tín bán nghi (nửa tin nửa ngờ)", "Họa phúc khôn lường (trong họa có phúc)", "Biện chứng pháp triết học",
    "Thế lưỡng nan khó xử", "Quy luật phát triển tự nhiên", "Đạo lý nhân sinh sâu sắc"
  ],
};

// ============================================================================
// 5. DIFFICULTY CONFIGURATION
// ============================================================================
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
      badgeColor: "bg-celadon-100 text-celadon-dark border-celadon-200",
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
      matchingDistractorsCount: 5,
      badgeLabel: "Trung cấp: Ẩn Pinyin • Bẫy từ đồng âm & Cú pháp ngữ pháp",
      badgeColor: "bg-gilt-light text-gilt-deep border-gilt-soft",
      instructionTip: "Pinyin đã ẩn. Đáp án nhiễu cùng trường từ vựng chuyên sâu và bẫy chữ đồng âm/cú pháp.",
    };
  }

  // Advanced (HSK 5-6)
  return {
    showPinyinByDefault: false,
    allowPinyinToggle: false,
    allowTypingMode: true,
    defaultToTypingMode: true,
    distractorTilesCount: 6,
    matchingDistractorsCount: 7,
    badgeLabel: "Nâng cao: Bẫy thuật ngữ chuyên sâu • Chữ hình gần âm • Gõ phím",
    badgeColor: "bg-vermillion-light text-vermillion-deep border-vermillion-soft",
    instructionTip: "Thử thách đỉnh cao: Các đáp án nhiễu bám sát cùng chủ đề học thuật, bẫy chữ hình gần nghĩa gần và tự gõ phím.",
  };
}

// ============================================================================
// 6. SMART DISTRACTOR GENERATORS (Đúng quy chuẩn tiếng Trung & Đúng chủ đề)
// ============================================================================

/**
 * Lấy danh sách đáp án nhiễu thông minh cho câu nối từ (Matching Question).
 * ĐẢM BẢO: Các đáp án nhiễu phải CÙNG ĐỀ TÀI / TRƯỜNG TỪ VỰNG với câu hỏi,
 * không lấy bừa bãi sang các chủ đề khác!
 */
export function getSmartMatchingDistractors(
  question: Question,
  existingRights: Set<string>,
  targetCount: number
): string[] {
  const result: string[] = [];

  // 1. Ưu tiên các distractors đã được soạn sẵn thủ công trong question (nếu có)
  if (question.distractors && question.distractors.length > 0) {
    for (const d of question.distractors) {
      const clean = d.trim();
      if (!existingRights.has(clean) && !result.includes(clean)) {
        result.push(clean);
        if (result.length >= targetCount) return result;
      }
    }
  }

  // 2. Lấy từ pool cùng chủ đề (topicId)
  let themePool = THEMED_MATCHING_POOLS[question.topicId];

  // Nếu không khớp trực tiếp topicId, thử tìm theo từ khóa trong topicId hoặc tags
  if (!themePool || themePool.length === 0) {
    const matchedKey = Object.keys(THEMED_MATCHING_POOLS).find((k) =>
      question.topicId?.includes(k.replace(/^(basic|inter|adv)-/, "")) ||
      question.tags?.some((t) => k.includes(t))
    );
    if (matchedKey) {
      themePool = THEMED_MATCHING_POOLS[matchedKey];
    }
  }

  // Fallback theo level nếu vẫn không tìm thấy
  if (!themePool || themePool.length === 0) {
    if (question.hskLevel <= 2) {
      themePool = THEMED_MATCHING_POOLS["basic-mua-sam"];
    } else if (question.hskLevel <= 4) {
      themePool = THEMED_MATCHING_POOLS["inter-cong-viec"];
    } else {
      themePool = THEMED_MATCHING_POOLS["adv-kinh-te"];
    }
  }

  // Shuffle pool để mỗi lần làm đề có các đáp án nhiễu ngẫu nhiên khác nhau
  const shuffled = [...themePool].sort(() => Math.random() - 0.5);

  for (const item of shuffled) {
    const clean = item.trim();
    if (!existingRights.has(clean) && !result.includes(clean)) {
      result.push(clean);
      if (result.length >= targetCount) break;
    }
  }

  return result;
}

/**
 * Lấy danh sách viên gạch nhiễu thông minh cho Word Order / Listen Word Order:
 * - Ưu tiên 1: Chữ đồng âm / gần âm (同音/近音词) dựa trên chính từ trong câu (VD: 坐 ➔ 座; 戴 ➔ 带; 须 ➔ 需)
 * - Ưu tiên 2: Bẫy cú pháp ngữ pháp (的/得/地, 把/被, 刚/刚才, 再/又...)
 * - Ưu tiên 3: Chữ hình gần giống nhau (形近字: 拨/拔, 辨/辩, 买/卖...)
 */
export function getSmartTileDistractors(
  question: Question,
  correctTiles: string[],
  targetCount: number
): string[] {
  const existingSet = new Set(correctTiles.map((t) => t.trim()));
  const result: string[] = [];

  // Helper để thêm vào result nếu chưa có
  const addCandidate = (cand: string) => {
    const clean = cand.trim();
    if (clean && !existingSet.has(clean) && !result.includes(clean)) {
      result.push(clean);
    }
  };

  // 1. Ưu tiên distractorTiles được định nghĩa sẵn
  if (question.distractorTiles && question.distractorTiles.length > 0) {
    for (const d of question.distractorTiles) {
      addCandidate(d);
      if (result.length >= targetCount) return result;
    }
  }

  // 2. Quét qua từng từ/chữ trong correctTiles để tìm bẫy đồng âm & cú pháp ngữ pháp
  for (const tile of correctTiles) {
    // 2.1 Tra cứu bẫy ngữ pháp (Syntax traps)
    const syntaxTraps = SYNTAX_TRAP_MAP[tile.trim()];
    if (syntaxTraps) {
      for (const st of syntaxTraps) {
        addCandidate(st);
        if (result.length >= targetCount) return result;
      }
    }

    // 2.2 Tra cứu bẫy đồng âm (Homophone traps)
    const homophones = HOMOPHONE_TRAPS_MAP[tile.trim()];
    if (homophones) {
      for (const hp of homophones) {
        addCandidate(hp);
        if (result.length >= targetCount) return result;
      }
    }

    // 2.3 Tra cứu từng ký tự trong tile cho Lookalikes (Hình gần giống)
    for (const char of tile) {
      const lkList = LOOKALIKE_CHARACTERS_MAP[char];
      if (lkList) {
        for (const lk of lkList) {
          addCandidate(lk);
          if (result.length >= targetCount) return result;
        }
      }
      const stList = SYNTAX_TRAP_MAP[char];
      if (stList) {
        for (const st of stList) {
          addCandidate(st);
          if (result.length >= targetCount) return result;
        }
      }
      const hpList = HOMOPHONE_TRAPS_MAP[char];
      if (hpList) {
        for (const hp of hpList) {
          addCandidate(hp);
          if (result.length >= targetCount) return result;
        }
      }
    }
  }

  // 3. Nếu chưa đủ targetCount, bổ sung từ vựng bẫy theo cấp độ HSK chuẩn
  if (result.length < targetCount) {
    let fallbackLevelTiles: string[] = [];
    if (question.hskLevel <= 2) {
      fallbackLevelTiles = ["吗", "呢", "很", "不", "没", "在", "个", "了", "的", "那", "哪", "谁"];
    } else if (question.hskLevel <= 4) {
      fallbackLevelTiles = [
        "地", "得", "被", "把", "刚", "刚才", "已经", "又", "再", "虽然", "但是", "越",
        "为了", "戴", "带", "坐", "座", "已", "己", "买", "卖"
      ];
    } else {
      fallbackLevelTiles = [
        "从而", "进而", "固然", "势必", "极其", "未免", "辨", "辩", "需", "须", "象", "像",
        "决", "绝", "度", "渡", "防", "妨", "券", "卷", "拨", "拔"
      ];
    }

    const shuffled = fallbackLevelTiles.sort(() => Math.random() - 0.5);
    for (const fb of shuffled) {
      addCandidate(fb);
      if (result.length >= targetCount) break;
    }
  }

  return result.slice(0, targetCount);
}

/**
 * Backward compatibility helper
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
