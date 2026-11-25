import { afterEach, describe, expect, it, vi } from "vitest";
import { useQuizDraftStore } from "@/store/useQuizDraftStore";

function mockStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("quiz draft timing", () => {
  it("persists question durations and elapsed time when resuming a draft", () => {
    const storage = mockStorage();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage);

    useQuizDraftStore.getState().initExam("timed-exam");
    useQuizDraftStore.getState().addQuestionDuration("q-1", 17);
    useQuizDraftStore.getState().setElapsed(42);
    useQuizDraftStore.getState().initExam("timed-exam");

    expect(useQuizDraftStore.getState().questionDurations).toEqual({ "q-1": 17 });
    expect(useQuizDraftStore.getState().elapsedSeconds).toBe(42);
    expect(JSON.parse(storage.getItem("hanyu_quiz_draft_timed-exam") || "{}").questionDurations).toEqual({ "q-1": 17 });
  });
});
