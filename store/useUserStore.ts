"use client";

import { create } from "zustand";
import { UserProfile, LevelProgressInfo, LevelId } from "@/types";
import { repository } from "@/services";

interface UserStoreState {
  profile: UserProfile | null;
  isHydrated: boolean;
  isLoading: boolean;
  levelProgress: Record<LevelId, LevelProgressInfo | null>;
  loadProfile: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  refreshProgress: (levelId: LevelId) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  profile: null,
  isHydrated: false,
  isLoading: false,
  levelProgress: {
    basic: null,
    intermediate: null,
    advanced: null,
  },

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await repository.getProfile();
      const basicProg = await repository.getLevelProgress("basic");
      const interProg = await repository.getLevelProgress("intermediate");
      const advProg = await repository.getLevelProgress("advanced");

      set({
        profile,
        isHydrated: true,
        isLoading: false,
        levelProgress: {
          basic: basicProg,
          intermediate: interProg,
          advanced: advProg,
        },
      });
    } catch (e) {
      console.error("Lỗi tải thông tin học viên:", e);
      set({ isHydrated: true, isLoading: false });
    }
  },

  updateName: async (name: string) => {
    try {
      const updated = await repository.saveProfile({ name });
      set({ profile: updated });
    } catch (e) {
      console.error("Lỗi cập nhật tên:", e);
    }
  },

  refreshProgress: async (levelId: LevelId) => {
    try {
      const prog = await repository.getLevelProgress(levelId);
      set((state) => ({
        levelProgress: {
          ...state.levelProgress,
          [levelId]: prog,
        },
      }));
    } catch (e) {
      console.error("Lỗi cập nhật tiến độ:", e);
    }
  },
}));
