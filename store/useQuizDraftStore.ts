"use client";

import { create } from "zustand";
import { AnswerValue } from "@/types";

interface QuizDraftState {
  activeExamId: string | null;
  savedAnswers: Record<string, AnswerValue>;
  elapsedSeconds: number;
  questionDurations: Record<string, number>;
  currentQuestionIndex: number;
  setDraftAnswer: (examId: string, questionId: string, answer: AnswerValue) => void;
  setIndex: (index: number) => void;
  setElapsed: (seconds: number) => void;
  addQuestionDuration: (questionId: string, seconds: number) => void;
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
  questionDurations: {},
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
        const rawDurations = draft.questionDurations;
        const questionDurations: Record<string, number> = {};
        if (rawDurations && typeof rawDurations === "object" && !Array.isArray(rawDurations)) {
          for (const [id, seconds] of Object.entries(rawDurations)) {
            if (typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0) questionDurations[id] = Math.round(seconds);
          }
        }
        set({
          activeExamId: examId,
          savedAnswers: answers,
          elapsedSeconds: typeof draft.elapsedSeconds === "number" ? draft.elapsedSeconds : 0,
          questionDurations,
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
      questionDurations: {},
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
              questionDurations: state.questionDurations,
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
              questionDurations: state.questionDurations,
              currentQuestionIndex: index,
            })
          );
        } catch {}
      }
      return { currentQuestionIndex: index };
    });
  },

  setElapsed: (seconds: number) => {
    set((state) => {
      const elapsedSeconds = Math.max(0, Math.floor(seconds));
      if (state.activeExamId && typeof window !== "undefined") {
        try {
          localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${state.activeExamId}`, JSON.stringify({
            savedAnswers: state.savedAnswers,
            elapsedSeconds,
            questionDurations: state.questionDurations,
            currentQuestionIndex: state.currentQuestionIndex,
          }));
        } catch {}
      }
      return { elapsedSeconds };
    });
  },

  addQuestionDuration: (questionId: string, seconds: number) => {
    set((state) => {
      if (!Number.isFinite(seconds) || seconds <= 0) return state;
      const questionDurations = {
        ...state.questionDurations,
        [questionId]: (state.questionDurations[questionId] ?? 0) + Math.round(seconds),
      };
      if (state.activeExamId && typeof window !== "undefined") {
        try {
          localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${state.activeExamId}`, JSON.stringify({
            savedAnswers: state.savedAnswers,
            elapsedSeconds: state.elapsedSeconds,
            questionDurations,
            currentQuestionIndex: state.currentQuestionIndex,
          }));
        } catch {}
      }
      return { questionDurations };
    });
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
      questionDurations: {},
      currentQuestionIndex: 0,
    });
  },
}));
