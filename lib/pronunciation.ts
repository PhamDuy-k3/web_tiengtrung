import { mockVocabulary } from "@/data/mock";

export type CharPronunciationStatus = "correct" | "tone_error" | "wrong" | "missing";

export interface CharPronunciationDetail {
  index: number;
  targetChar: string;
  targetPinyin?: string;
  spokenChar?: string;
  spokenPinyin?: string;
  status: CharPronunciationStatus;
  issueSummary?: string;
  howToPronounce?: string;
}

export interface PronunciationEvaluation {
  score: number;
  targetText: string;
  spokenText: string;
  matchedCount: number;
  totalChars: number;
  charDetails: CharPronunciationDetail[];
  extraChars: string[];
  overallFeedback: string;
  wrongItems: CharPronunciationDetail[];
}

const TONE_CHAR_MAP: Record<string, { base: string; tone: 1 | 2 | 3 | 4 }> = {
  ā: { base: "a", tone: 1 }, á: { base: "a", tone: 2 }, ǎ: { base: "a", tone: 3 }, à: { base: "a", tone: 4 },
  ē: { base: "e", tone: 1 }, é: { base: "e", tone: 2 }, ě: { base: "e", tone: 3 }, è: { base: "e", tone: 4 },
  ī: { base: "i", tone: 1 }, í: { base: "i", tone: 2 }, ǐ: { base: "i", tone: 3 }, ì: { base: "i", tone: 4 },
  ō: { base: "o", tone: 1 }, ó: { base: "o", tone: 2 }, ǒ: { base: "o", tone: 3 }, ò: { base: "o", tone: 4 },
  ū: { base: "u", tone: 1 }, ú: { base: "u", tone: 2 }, ǔ: { base: "u", tone: 3 }, ù: { base: "u", tone: 4 },
  ǖ: { base: "ü", tone: 1 }, ǘ: { base: "ü", tone: 2 }, ǚ: { base: "ü", tone: 3 }, ǜ: { base: "ü", tone: 4 },
};

const CORE_HANZI_PINYIN: Record<string, string> = {
  我: "wǒ", 你: "nǐ", 您: "nín", 他: "tā", 她: "tā", 们: "men",
  的: "de", 是: "shì", 不: "bù", 没: "méi", 有: "yǒu", 在: "zài",
  好: "hǎo", 很: "hěn", 太: "tài", 也: "yě", 都: "dōu", 就: "jiù",
  这: "zhè", 那: "nà", 哪: "nǎ", 谁: "shéi", 什: "shén", 么: "me",
  吗: "ma", 呢: "ne", 了: "le", 过: "guò", 着: "zhe", 得: "de",
  一: "yī", 二: "èr", 三: "sān", 四: "sì", 五: "wǔ", 六: "liù",
  七: "qī", 八: "bā", 九: "jiǔ", 十: "shí", 百: "bǎi", 两: "liǎng",
  人: "rén", 口: "kǒu", 个: "gè", 家: "jiā", 爸爸: "bàba", 爸: "bà", 妈: "mā",
  大: "dà", 小: "xiǎo", 多: "duō", 少: "shǎo", 几: "jǐ", 岁: "suì",
  去: "qù", 来: "lái", 回: "huí", 到: "dào", 看: "kàn", 听: "tīng",
  说: "shuō", 读: "dú", 写: "xiě", 吃: "chī", 喝: "hē", 买: "mǎi", 卖: "mài",
  做: "zuò", 坐: "zuò", 住: "zhù", 叫: "jiào", 姓: "xìng", 请: "qǐng", 问: "wèn",
  对: "duì", 起: "qǐ", 谢: "xiè", 再: "zài", 见: "jiàn",
  天: "tiān", 年: "nián", 月: "yuè", 日: "rì", 点: "diǎn", 分: "fēn",
  水: "shuǐ", 茶: "chá", 钱: "qián", 块: "kuài", 书: "shū", 菜: "cài",
  热: "rè", 冷: "lěng", 忙: "máng", 高: "gāo", 兴: "xìng", 贵: "guì",
  想: "xiǎng", 要: "yào", 会: "huì", 能: "néng", 爱: "ài", 喜: "xǐ", 欢: "huan",
  把: "bǎ", 被: "bèi", 比: "bǐ", 从: "cóng", 给: "gěi", 和: "hé",
  中: "zhōng", 国: "guó", 汉: "hàn", 语: "yǔ", 学: "xué", 习: "xí",
  知: "zhī", 道: "dào", 西: "xī", 山: "shān", 女: "nǚ", 儿: "ér",
};

export function stripChinesePunctuation(text: string): string {
  return text.replace(/[\s，。！？、；：“”‘’（）【】《》,.!?;:'"()\-—…·]/g, "");
}

export function stripToneMarks(pinyin: string): string {
  let out = "";
  for (const ch of pinyin.toLowerCase()) {
    const mapped = TONE_CHAR_MAP[ch];
    out += mapped ? mapped.base : ch;
  }
  return out.replace(/[1-5]/g, "");
}

export function detectPinyinTone(pinyin: string): 1 | 2 | 3 | 4 | 5 {
  for (const ch of pinyin.toLowerCase()) {
    const mapped = TONE_CHAR_MAP[ch];
    if (mapped) return mapped.tone;
  }
  const numMatch = pinyin.match(/([1-5])$/);
  if (numMatch) {
    return Number(numMatch[1]) as 1 | 2 | 3 | 4 | 5;
  }
  return 5;
}

export function getToneName(tone: 1 | 2 | 3 | 4 | 5): string {
  switch (tone) {
    case 1: return "Thanh 1 (ngang cao)";
    case 2: return "Thanh 2 (đi lên)";
    case 3: return "Thanh 3 (xuống rồi lên)";
    case 4: return "Thanh 4 (xuống dứt khoát)";
    case 5: return "Thanh nhẹ";
  }
}

/**
 * Splits merged or spaced pinyin (e.g., "Zhōngguó", "nǐ hǎo", "piányi") into syllables.
 */
export function splitPinyinSyllables(rawPinyin: string): string[] {
  if (!rawPinyin) return [];
  const cleaned = rawPinyin
    .replace(/[，。！？、；：“”‘’（）,.!?;:'"()\-]/g, " ")
    .trim();
  if (!cleaned) return [];

  const V = "aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜv";
  const syllableRegex = new RegExp(
    `(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?[${V}]+(?:ng|n|r)?(?![${V}])`,
    "gi"
  );

  const syllables: string[] = [];
  for (const chunk of cleaned.split(/\s+/)) {
    const matches = chunk.match(syllableRegex);
    if (matches && matches.length > 0) {
      syllables.push(...matches);
    } else if (chunk) {
      syllables.push(chunk);
    }
  }
  return syllables;
}

let cachedCharPinyinMap: Map<string, string> | null = null;

function getCharPinyinMap(): Map<string, string> {
  if (cachedCharPinyinMap) return cachedCharPinyinMap;
  const map = new Map<string, string>();

  for (const [char, py] of Object.entries(CORE_HANZI_PINYIN)) {
    if (char.length === 1) map.set(char, py);
  }

  for (const item of mockVocabulary) {
    const chars = Array.from(stripChinesePunctuation(item.hanzi));
    const syllables = splitPinyinSyllables(item.pinyin);
    if (chars.length === syllables.length) {
      chars.forEach((ch, idx) => {
        if (!map.has(ch)) map.set(ch, syllables[idx].toLowerCase());
      });
    }

    const exChars = Array.from(stripChinesePunctuation(item.exampleZh));
    const exSyllables = splitPinyinSyllables(item.examplePinyin);
    if (exChars.length === exSyllables.length) {
      exChars.forEach((ch, idx) => {
        if (!map.has(ch)) map.set(ch, exSyllables[idx].toLowerCase());
      });
    }
  }

  cachedCharPinyinMap = map;
  return map;
}

export function lookupCharPinyin(char: string): string | undefined {
  return getCharPinyinMap().get(char);
}

function getPhoneticArticulationTip(pinyin?: string): string {
  if (!pinyin) return "Nghe chậm 0.75x rồi đọc theo từng âm tiết rõ ràng.";
  const lower = stripToneMarks(pinyin.trim());
  const tone = detectPinyinTone(pinyin);
  const tips: string[] = [];

  if (tone === 1) tips.push("Thanh 1: giữ giọng cao, ngang và kéo dài đều hơi.");
  else if (tone === 2) tips.push("Thanh 2: kéo giọng đi thẳng từ quãng trung lên cao dứt khoát.");
  else if (tone === 3) tips.push("Thanh 3: hạ giọng xuống trầm trước rồi mới nhấc nhẹ lên cuối âm.");
  else if (tone === 4) tips.push("Thanh 4: đọc cao rồi rơi mạnh, ngắn và dứt khoát xuống thấp.");
  else tips.push("Thanh nhẹ: đọc thật ngắn, nhẹ và lướt theo âm trước.");

  if (/^(zh|ch|sh|r)/.test(lower)) {
    const aspirated = lower.startsWith("ch") ? " và bật hơi mạnh ra ngoài" : "";
    tips.push(`Âm đầu '${lower.slice(0, lower.startsWith("r") ? 1 : 2)}': uốn cong đầu lưỡi chạm vòm cứng${aspirated}.`);
  } else if (/^(j|q|x)/.test(lower)) {
    const aspirated = lower.startsWith("q") ? " và bật hơi rõ" : "";
    tips.push(`Âm đầu '${lower[0]}': áp mặt lưỡi sát ngạc cứng, đầu lưỡi thả lỏng${aspirated}.`);
  } else if (/^(z|c|s)/.test(lower)) {
    const aspirated = lower.startsWith("c") ? " và bật hơi mạnh giống 'tx'" : "";
    tips.push(`Âm đầu '${lower[0]}': đặt đầu lưỡi chạm nhẹ mặt sau răng cửa${aspirated}.`);
  } else if (/^(p|t|k)/.test(lower)) {
    tips.push(`Âm bật hơi '${lower[0]}': phải đẩy một luồng hơi mạnh ra ngoài (phân biệt với b/d/g không bật hơi).`);
  } else if (/^(b|d|g)/.test(lower)) {
    tips.push(`Âm '${lower[0]}': giữ hơi trong miệng, KHÔNG bật hơi mạnh ra ngoài.`);
  }

  if (lower.includes("ü") || /^(j|q|x|y)u/.test(lower)) {
    tips.push("Âm 'ü': chu tròn môi như đọc 'u' nhưng vị trí lưỡi phát âm chữ 'i'.");
  } else if (lower.endsWith("ng")) {
    tips.push("Vần '-ng': âm mũi sau, ngân nhẹ ở cuống họng và khép âm gọn.");
  }

  return tips.join(" ");
}

function getTargetCharPinyinList(targetChars: string[], targetPinyin?: string): Array<string | undefined> {
  if (targetPinyin) {
    const syllables = splitPinyinSyllables(targetPinyin);
    if (syllables.length === targetChars.length) {
      return syllables;
    }
  }
  return targetChars.map((ch) => lookupCharPinyin(ch));
}

export function evaluatePronunciation(params: {
  targetText: string;
  targetPinyin?: string;
  spokenText: string;
}): PronunciationEvaluation {
  const cleanTarget = stripChinesePunctuation(params.targetText);
  const cleanSpoken = stripChinesePunctuation(params.spokenText);
  const targetChars = Array.from(cleanTarget);
  const spokenChars = Array.from(cleanSpoken);
  const targetPinyins = getTargetCharPinyinList(targetChars, params.targetPinyin);

  if (targetChars.length === 0) {
    return {
      score: 0,
      targetText: params.targetText,
      spokenText: params.spokenText,
      matchedCount: 0,
      totalChars: 0,
      charDetails: [],
      extraChars: [],
      overallFeedback: "Không có nội dung đề bài hợp lệ.",
      wrongItems: [],
    };
  }

  const m = targetChars.length;
  const n = spokenChars.length;

  // DP alignment (Levenshtein with partial-tone credit)
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  const isSameBaseSyllable = (i: number, j: number): boolean => {
    const tPy = targetPinyins[i];
    const sPy = lookupCharPinyin(spokenChars[j]);
    if (!tPy || !sPy) return false;
    return stripToneMarks(tPy) === stripToneMarks(sPy);
  };

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const tCh = targetChars[i - 1];
      const sCh = spokenChars[j - 1];
      const subCost = tCh === sCh ? 0 : isSameBaseSyllable(i - 1, j - 1) ? 0.6 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,          // delete (missing target char)
        dp[i][j - 1] + 1,          // insert (extra spoken char)
        dp[i - 1][j - 1] + subCost // match or substitute
      );
    }
  }

  // Backtrack alignment
  const aligned: CharPronunciationDetail[] = [];
  const extraChars: string[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const tCh = targetChars[i - 1];
      const sCh = spokenChars[j - 1];
      const sameBase = tCh !== sCh && isSameBaseSyllable(i - 1, j - 1);
      const subCost = tCh === sCh ? 0 : sameBase ? 0.6 : 1;

      if (Math.abs(dp[i][j] - (dp[i - 1][j - 1] + subCost)) < 1e-6) {
        const targetPy = targetPinyins[i - 1];
        const spokenPy = lookupCharPinyin(sCh);
        if (tCh === sCh) {
          aligned.push({
            index: i - 1,
            targetChar: tCh,
            targetPinyin: targetPy,
            spokenChar: sCh,
            spokenPinyin: spokenPy,
            status: "correct",
          });
        } else if (sameBase) {
          const tTone = targetPy ? getToneName(detectPinyinTone(targetPy)) : "";
          const sTone = spokenPy ? getToneName(detectPinyinTone(spokenPy)) : "";
          aligned.push({
            index: i - 1,
            targetChar: tCh,
            targetPinyin: targetPy,
            spokenChar: sCh,
            spokenPinyin: spokenPy,
            status: "tone_error",
            issueSummary: `Đọc nhầm thanh điệu: nghe thành 「${sCh}」 (${spokenPy ?? "?"} · ${sTone}) thay vì 「${tCh}」 (${targetPy ?? "?"} · ${tTone}).`,
            howToPronounce: getPhoneticArticulationTip(targetPy),
          });
        } else {
          aligned.push({
            index: i - 1,
            targetChar: tCh,
            targetPinyin: targetPy,
            spokenChar: sCh,
            spokenPinyin: spokenPy,
            status: "wrong",
            issueSummary: `Phát âm chưa khớp: hệ thống nghe thành 「${sCh}」${spokenPy ? ` (${spokenPy})` : ""} thay vì 「${tCh}」${targetPy ? ` (${targetPy})` : ""}.`,
            howToPronounce: getPhoneticArticulationTip(targetPy),
          });
        }
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && Math.abs(dp[i][j] - (dp[i - 1][j] + 1)) < 1e-6) {
      const tCh = targetChars[i - 1];
      const targetPy = targetPinyins[i - 1];
      aligned.push({
        index: i - 1,
        targetChar: tCh,
        targetPinyin: targetPy,
        status: "missing",
        issueSummary: `Bị thiếu hoặc đọc quá lướt chữ 「${tCh}」${targetPy ? ` (${targetPy})` : ""}.`,
        howToPronounce: getPhoneticArticulationTip(targetPy),
      });
      i--;
    } else if (j > 0) {
      extraChars.push(spokenChars[j - 1]);
      j--;
    }
  }

  aligned.reverse();
  extraChars.reverse();

  let points = 0;
  let matchedCount = 0;
  for (const item of aligned) {
    if (item.status === "correct") {
      points += 1;
      matchedCount += 1;
    } else if (item.status === "tone_error") {
      points += 0.5;
    }
  }

  const extraPenalty = extraChars.length * 0.25;
  const rawPct = Math.round(((points - extraPenalty) / m) * 100);
  const score = Math.max(0, Math.min(100, rawPct));
  const wrongItems = aligned.filter((item) => item.status !== "correct");

  let overallFeedback = "";
  if (!cleanSpoken) {
    overallFeedback = "Chưa ghi nhận được giọng nói tiếng Trung. Hãy bấm micro và đọc to, rõ từng âm tiết.";
  } else if (score === 100) {
    overallFeedback = "Phát âm chuẩn xác 100%! Thanh điệu và âm tiết rất rõ ràng.";
  } else if (score >= 80) {
    overallFeedback = `Khá tốt (${score}%)! Chỉ còn ${wrongItems.length} chữ cần chỉnh lại thanh điệu hoặc âm đầu cho tròn vành hơn.`;
  } else if (score >= 50) {
    overallFeedback = `Đạt ${score}%. Hãy nghe chậm 0.75x và tập trung sửa các chữ đánh dấu đỏ bên dưới.`;
  } else {
    overallFeedback = `Mới khớp ${score}%. Hãy nghe mẫu tốc độ chậm (0.75x) từng chữ rồi đọc lại rõ thanh điệu nhé.`;
  }

  return {
    score,
    targetText: params.targetText,
    spokenText: params.spokenText,
    matchedCount,
    totalChars: m,
    charDetails: aligned,
    extraChars,
    overallFeedback,
    wrongItems,
  };
}
