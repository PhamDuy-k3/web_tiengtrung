"use client";

import { create } from "zustand";
import { AnswerValue } from "@/types";

interface QuizDraftState {
  activeExamId: string | null;
  savedAnswers: Record<string, AnswerValue>;
  elapsedSeconds: number;
  currentQuestionIndex: number;
  setDraftAnswer: (examId: string, questionId: string, answer: AnswerValue) => void;
  setIndex: (index: number) => void;
  setElapsed: (seconds: number) => void;
  initExam: (examId: string) => void;
  clearDraft: (examId: string) => void;
}

const DRAFT_STORAGE_PREFIX = "hanyu_quiz_draft_";

function isAnswerValue(value: unknown): value is AnswerValue {
  if (typeof value === "string") return true;
  if (Array.isArray(value)) return value.every((item) => typeof item === "string");
  return typeof value === "object" && value !== null &&
    Object.values(value).every((item) => typeof item === "string");
}

export const useQuizDraftStore = create<QuizDraftState>((set, get) => ({
  activeExamId: null,
  savedAnswers: {},
  elapsedSeconds: 0,
  currentQuestionIndex: 0,

  initExam: (examId: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${examId}`);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") throw new Error("Invalid quiz draft");
        const draft = parsed as Record<string, unknown>;
        const rawAnswers = draft.savedAnswers;
        const answers: Record<string, AnswerValue> = {};
        if (rawAnswers && typeof rawAnswers === "object" && !Array.isArray(rawAnswers)) {
          for (const [id, answer] of Object.entries(rawAnswers)) {
            if (isAnswerValue(answer)) answers[id] = answer;
          }
        }
        set({
          activeExamId: examId,
          savedAnswers: answers,
          elapsedSeconds: typeof draft.elapsedSeconds === "number" ? draft.elapsedSeconds : 0,
          currentQuestionIndex: typeof draft.currentQuestionIndex === "number" ? draft.currentQuestionIndex : 0,
        });
        return;
      }
    } catch {
      // Ignore
    }
    set({
      activeExamId: examId,
      savedAnswers: {},
      elapsedSeconds: 0,
      currentQuestionIndex: 0,
    });
  },

  setDraftAnswer: (examId: string, questionId: string, answer: AnswerValue) => {
    set((state) => {
      const updated = {
        ...state.savedAnswers,
        [questionId]: answer,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `${DRAFT_STORAGE_PREFIX}${examId}`,
            JSON.stringify({
              savedAnswers: updated,
              elapsedSeconds: state.elapsedSeconds,
              currentQuestionIndex: state.currentQuestionIndex,
            })
          );
        } catch {
          // ignore
        }
      }
      return { savedAnswers: updated, activeExamId: examId };
    });
  },

  setIndex: (index: number) => {
    set((state) => {
      if (state.activeExamId && typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `${DRAFT_STORAGE_PREFIX}${state.activeExamId}`,
            JSON.stringify({
              savedAnswers: state.savedAnswers,
              elapsedSeconds: state.elapsedSeconds,
              currentQuestionIndex: index,
            })
          );
        } catch {}
      }
      return { currentQuestionIndex: index };
    });
  },

  setElapsed: (seconds: number) => {
    set({ elapsedSeconds: seconds });
  },

  clearDraft: (examId: string) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${examId}`);
      } catch {}
    }
    set({
      activeExamId: null,
      savedAnswers: {},
      elapsedSeconds: 0,
      currentQuestionIndex: 0,
    });
  },
}));
