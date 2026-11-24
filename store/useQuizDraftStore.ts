"use client";

import { create } from "zustand";

interface QuizDraftState {
  activeExamId: string | null;
  savedAnswers: Record<string, any>;
  elapsedSeconds: number;
  currentQuestionIndex: number;
  setDraftAnswer: (examId: string, questionId: string, answer: any) => void;
  setIndex: (index: number) => void;
  setElapsed: (seconds: number) => void;
  initExam: (examId: string) => void;
  clearDraft: (examId: string) => void;
}

const DRAFT_STORAGE_PREFIX = "hanyu_quiz_draft_";

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
        const parsed = JSON.parse(raw);
        set({
          activeExamId: examId,
          savedAnswers: parsed.savedAnswers || {},
          elapsedSeconds: parsed.elapsedSeconds || 0,
          currentQuestionIndex: parsed.currentQuestionIndex || 0,
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

  setDraftAnswer: (examId: string, questionId: string, answer: any) => {
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
