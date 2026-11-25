import { AnswerValue, GradeResult, Question } from "@/types";

/** Normalize punctuation and spacing while preserving Chinese and Vietnamese letters. */
export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'，。！？、；：“”‘’「」『』【】（）［］《》…·—]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalize tone marks and common ü spellings for Pinyin comparisons. */
export function normalizePinyin(text: string): string {
  return text
    .toLocaleLowerCase()
    .replace(/u:/g, "v")
    .replace(/[üǖǘǚǜ]/g, "v")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'，。！？、；：“”‘’「」『』【】（）［］《》…·—]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isAnswerRecord(value: AnswerValue): value is Record<string, string> {
  return !Array.isArray(value) && typeof value === "object";
}

function candidates(question: Question): AnswerValue[] {
  return [question.correctAnswer, ...(question.acceptedAnswers ?? [])];
}

function sameText(left: string, right: string): boolean {
  const normalizedLeft = normalizeAnswer(left);
  const normalizedRight = normalizeAnswer(right);
  if (normalizedLeft === normalizedRight) return true;

  // Only use tone-insensitive matching when the expected text is Pinyin/Latin.
  if (!/[\u3400-\u9fff]/.test(right)) {
    return normalizePinyin(left) === normalizePinyin(right);
  }
  return false;
}

function textSimilarity(left: string, right: string): number {
  const a = Array.from(normalizeAnswer(left).replace(/\s/g, ""));
  const b = Array.from(normalizeAnswer(right).replace(/\s/g, ""));
  if (a.length === 0 || b.length === 0) return 0;

  const previous = new Array<number>(b.length + 1).fill(0);
  for (const char of a) {
    let diagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const old = previous[j];
      previous[j] = char === b[j - 1]
        ? diagonal + 1
        : Math.max(previous[j], previous[j - 1]);
      diagonal = old;
    }
  }
  return Math.round((previous[b.length] / b.length) * 100);
}

function partialResult(
  score: number,
  matchedAnswer: AnswerValue | null,
  question: Question
): GradeResult {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  return {
    correct: boundedScore === 100,
    score: boundedScore,
    matchedAnswer,
    feedback:
      boundedScore === 100
        ? "Chính xác!"
        : boundedScore > 0
          ? `Bạn đã làm đúng một phần (${boundedScore}%). ${question.explanation}`
          : question.explanation,
  };
}

function scoreSequence(answer: string[], expected: string[]): number {
  if (expected.length === 0) return 0;
  const matched = answer.reduce(
    (count, token, index) => count + (token === expected[index] ? 1 : 0),
    0
  );
  return Math.round((matched / expected.length) * 100);
}

/** Grade all eight quiz types and return full/partial credit plus feedback. */
export function gradeQuestion(
  question: Question,
  userAnswer: AnswerValue | null | undefined
): GradeResult {
  if (userAnswer === undefined || userAnswer === null) {
    return partialResult(0, question.correctAnswer, question);
  }

  const expectedAnswers = candidates(question);

  if (question.type === "matching") {
    if (!question.pairs || !isAnswerRecord(userAnswer)) {
      return partialResult(0, question.correctAnswer, question);
    }
    const matched = question.pairs.reduce(
      (count, pair) => count + (userAnswer[pair.id] === pair.right ? 1 : 0),
      0
    );
    return partialResult(
      question.pairs.length ? (matched / question.pairs.length) * 100 : 0,
      question.correctAnswer,
      question
    );
  }

  if (question.type === "word_order" || question.type === "listen_word_order") {
    if (typeof userAnswer === "object" && !Array.isArray(userAnswer)) {
      return partialResult(0, question.correctAnswer, question);
    }
    for (const expected of expectedAnswers) {
      if (typeof expected === "object" && !Array.isArray(expected)) continue;
      const expectedText = Array.isArray(expected) ? expected.join("") : expected;
      const answerText = Array.isArray(userAnswer) ? userAnswer.join("") : userAnswer;
      if (sameText(answerText, expectedText)) return partialResult(100, expected, question);
      if (Array.isArray(userAnswer) && Array.isArray(expected) && scoreSequence(userAnswer, expected) === 100) {
        return partialResult(100, expected, question);
      }
    }
    const sequenceAnswer = expectedAnswers.find((answer): answer is string[] => Array.isArray(answer));
    const textAnswer = expectedAnswers.find((answer): answer is string => typeof answer === "string");
    const bestExpected: AnswerValue = sequenceAnswer ?? textAnswer ?? question.correctAnswer;
    if (Array.isArray(userAnswer)) {
      const expectedTokens = Array.isArray(bestExpected)
        ? bestExpected
        : typeof bestExpected === "string"
          ? Array.from(bestExpected.replace(/\s/g, ""))
          : [];
      return partialResult(scoreSequence(userAnswer, expectedTokens), bestExpected, question);
    }
    const expectedText = Array.isArray(bestExpected)
      ? bestExpected.join("")
      : typeof bestExpected === "string"
        ? bestExpected
        : "";
    return partialResult(textSimilarity(userAnswer, expectedText), bestExpected, question);
  }

  if (question.type === "fill_in_blank" || question.type === "short_translate") {
    if (typeof userAnswer !== "string") {
      return partialResult(0, question.correctAnswer, question);
    }
    const textCandidates = expectedAnswers.flatMap((expected) =>
      typeof expected === "string" ? [expected] : Array.isArray(expected) ? expected : []
    );
    for (const expected of textCandidates) {
      if (sameText(userAnswer, expected)) {
        return partialResult(100, expected, question);
      }
    }
    const stringAnswers = textCandidates;
    const bestMatch = stringAnswers.reduce<{ answer: string | null; score: number }>(
      (best, expected) => {
        const score = textSimilarity(userAnswer, expected);
        return score > best.score ? { answer: expected, score } : best;
      },
      { answer: null, score: 0 }
    );
    return partialResult(bestMatch.score, bestMatch.answer, question);
  }

  if (typeof userAnswer !== "string") {
    return partialResult(0, question.correctAnswer, question);
  }
  const matched = expectedAnswers.find(
    (expected) => typeof expected === "string" && sameText(userAnswer, expected)
  );
  return partialResult(matched ? 100 : 0, matched ?? question.correctAnswer, question);
}
