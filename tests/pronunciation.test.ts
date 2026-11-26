import { describe, expect, it } from "vitest";
import {
  evaluatePronunciation,
  splitPinyinSyllables,
} from "@/lib/pronunciation";

describe("pronunciation evaluation", () => {
  it("splits merged and spaced Chinese pinyin into per-character syllables", () => {
    expect(splitPinyinSyllables("nǐ hǎo")).toEqual(["nǐ", "hǎo"]);
    expect(splitPinyinSyllables("Zhōngguó")).toEqual(["Zhōng", "guó"]);
    expect(splitPinyinSyllables("piányi")).toEqual(["pián", "yi"]);
  });

  it("scores 100% when target and spoken Chinese match ignoring punctuation", () => {
    const result = evaluatePronunciation({
      targetText: "你好，谢谢！",
      targetPinyin: "nǐ hǎo xiè xie",
      spokenText: "你好谢谢",
    });

    expect(result.score).toBe(100);
    expect(result.matchedCount).toBe(4);
    expect(result.totalChars).toBe(4);
    expect(result.wrongItems).toHaveLength(0);
    expect(result.charDetails.every((item) => item.status === "correct")).toBe(true);
  });

  it("detects same-syllable tone errors and returns Vietnamese tone guidance", () => {
    const result = evaluatePronunciation({
      targetText: "我想买水果",
      targetPinyin: "wǒ xiǎng mǎi shuǐ guǒ",
      spokenText: "我想卖水果",
    });

    expect(result.score).toBe(90);
    expect(result.wrongItems).toHaveLength(1);
    expect(result.wrongItems[0].targetChar).toBe("买");
    expect(result.wrongItems[0].spokenChar).toBe("卖");
    expect(result.wrongItems[0].status).toBe("tone_error");
    expect(result.wrongItems[0].issueSummary).toContain("thanh điệu");
    expect(result.wrongItems[0].howToPronounce).toContain("Thanh 3");
  });

  it("highlights wrong consonant substitutions and missing/extra characters", () => {
    const wrongConsonant = evaluatePronunciation({
      targetText: "今天很热",
      targetPinyin: "jīn tiān hěn rè",
      spokenText: "今天很乐",
    });

    expect(wrongConsonant.score).toBe(75);
    expect(wrongConsonant.wrongItems).toHaveLength(1);
    expect(wrongConsonant.wrongItems[0].targetChar).toBe("热");
    expect(wrongConsonant.wrongItems[0].status).toBe("wrong");
    expect(wrongConsonant.wrongItems[0].howToPronounce).toContain("uốn cong đầu lưỡi");

    const missingAndExtra = evaluatePronunciation({
      targetText: "我是学生",
      targetPinyin: "wǒ shì xué sheng",
      spokenText: "我是好学",
    });

    expect(missingAndExtra.score).toBeLessThan(100);
    expect(missingAndExtra.wrongItems.some((item) => item.targetChar === "生" || item.targetChar === "学")).toBe(true);
  });
});
