"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Lock,
  Award,
  Zap,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { repository } from "@/services";
import { Level, LevelProgressInfo, MistakeEntry } from "@/types";
import { ChineseCloud, ChineseLantern, ChinesePlumBlossom } from "@/components/ui/ChineseDecoration";

export default function HomePage() {
  const { profile, isHydrated, loadProfile } = useUserStore();
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelProgresses, setLevelProgresses] = useState<Record<string, LevelProgressInfo>>({});
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    async function fetchData() {
      try {
        const lvls = await repository.getLevels();
        setLevels(lvls);

        const progs: Record<string, LevelProgressInfo> = {};
        for (const l of lvls) {
          progs[l.id] = await repository.getLevelProgress(l.id);
        }
        setLevelProgresses(progs);

        const m = await repository.getMistakes();
        setMistakes(m);
      } catch (err) {
        console.error("Lỗi tải trang chủ:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [loadProfile]);

  const activeMistakesCount = mistakes.filter((m) => !m.isMastered).length;
  const userName = isHydrated && profile?.name ? profile.name : "Học viên";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 relative">
      {/* Decorative Traditional SVGs in background */}
      <div className="absolute top-0 right-4 opacity-20 pointer-events-none hidden lg:block">
        <ChineseCloud className="w-40 h-20 text-coral" />
      </div>
      <div className="absolute top-48 left-0 opacity-15 pointer-events-none hidden lg:block">
        <ChineseLantern className="w-16 h-28 text-amber-600" />
      </div>

      {/* Greeting Banner */}
      <section className="bg-gradient-to-r from-cream-50 via-white to-amber-50/50 rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <ChinesePlumBlossom className="w-6 h-6 text-coral" />
            <span className="text-xs font-bold text-coral uppercase tracking-wider">
              Khởi động ngày mới cùng Hanyu
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-charcoal">
            Chào mừng bạn, {userName}! 👋
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 max-w-xl">
            Luyện tập 15 phút mỗi ngày theo phản xạ tự nhiên. Chọn cấp độ bên dưới hoặc làm bài kiểm tra để xếp đúng trình độ!
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur p-4 rounded-2xl border border-cream-300 shadow-sm shrink-0">
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-2xl">
              <Flame size={24} className="fill-amber-500" />
              <span>{isHydrated ? profile?.streak || 1 : 1}</span>
            </div>
            <div className="text-[11px] font-bold text-charcoal/50 uppercase">Ngày streak</div>
          </div>
          <div className="w-[1px] h-10 bg-cream-300"></div>
          <div className="text-center px-2">
            <div className="flex items-center justify-center gap-1 text-coral font-black text-2xl">
              <Sparkles size={22} />
              <span>{isHydrated ? profile?.totalXp || 50 : 50}</span>
            </div>
            <div className="text-[11px] font-bold text-charcoal/50 uppercase">Kinh nghiệm XP</div>
          </div>
        </div>
      </section>

      {/* Action Banners Grid: Ôn từ sai + Kiểm tra xếp lớp */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card: Ôn từ sai hôm nay */}
        <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-card flex items-start gap-4 hover:shadow-card-hover transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center shrink-0 border border-coral/20">
            <ShieldAlert size={26} />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-charcoal">Sổ tay câu hay sai</h2>
              {activeMistakesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-coral/15 text-coral-deep text-xs font-bold">
                  {activeMistakesCount} câu cần ôn
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-charcoal/70">
              {activeMistakesCount > 0
                ? `Hệ thống ghi nhận ${activeMistakesCount} câu bạn từng làm sai. Hãy luyện lại để chuyển sang "Đã thuộc"!`
                : "Tuyệt vời! Hiện tại bạn không có câu nào bị tích lũy trong sổ sai."}
            </p>
            <div className="pt-2">
              <Link
                href="/mistakes"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-coral hover:text-coral-dark"
              >
                <span>Vào ôn luyện ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Card: Kiểm tra xếp lớp đầu vào */}
        <div className="bg-gradient-to-br from-amber-50 to-cream-50 rounded-3xl p-6 border border-amber-200/80 shadow-card flex items-start gap-4 hover:shadow-card-hover transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-honey/20 text-amber-800 flex items-center justify-center shrink-0 border border-honey/40">
            <Compass size={26} />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-charcoal">Kiểm tra trình độ đầu vào</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                Tùy chọn
              </span>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/70">
              Làm đề tổng hợp 30 câu (HSK 1 - 6) trong 30 phút để kiểm tra trình độ và mở khóa thẳng vào cấp học tương ứng.
            </p>
            <div className="pt-2">
              <Link
                href="/placement-test"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 hover:text-amber-900"
              >
                <span>Bắt đầu thi phân loại</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 LEVEL CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-charcoal">Chọn cấp độ luyện tập</h2>
            <p className="text-xs sm:text-sm text-charcoal/60">
              Hoàn thành tối thiểu 70% số đề đạt từ 60% trở lên để mở khóa Bài kiểm tra lên cấp
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((lvl) => {
            const prog = levelProgresses[lvl.id] || {
              totalExams: 16,
              completedExams: 0,
              qualifyingExams: 0,
              percentCompleted: 0,
              canTakeLevelTest: false,
              examsNeededForTest: 12,
              hasPassedLevelTest: false,
            };

            const isUnlocked = isHydrated
              ? profile?.unlockedLevels.includes(lvl.id) ?? lvl.id === "basic"
              : lvl.id === "basic";

            // Theme colors per level
            const themeConfigs: Record<
              string,
              {
                badgeBg: string;
                badgeText: string;
                cardBorder: string;
                progressBar: string;
                btnClass: string;
              }
            > = {
              basic: {
                badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
                badgeText: "text-emerald-700",
                cardBorder: "hover:border-emerald-400",
                progressBar: "bg-emerald-500",
                btnClass: "bg-emerald-600 hover:bg-emerald-700 shadow-duo-mint text-white",
              },
              intermediate: {
                badgeBg: "bg-amber-50 border-amber-200 text-amber-900",
                badgeText: "text-amber-700",
                cardBorder: "hover:border-amber-400",
                progressBar: "bg-amber-500",
                btnClass: "bg-amber-500 hover:bg-amber-600 shadow-duo-honey text-white",
              },
              advanced: {
                badgeBg: "bg-red-50 border-red-200 text-red-900",
                badgeText: "text-red-700",
                cardBorder: "hover:border-coral",
                progressBar: "bg-coral",
                btnClass: "bg-coral hover:bg-coral-dark shadow-duo-coral text-white",
              },
            };

            const currentTheme = themeConfigs[lvl.id] || themeConfigs.basic;

            return (
              <div
                key={lvl.id}
                className={`bg-white rounded-3xl p-6 border-2 transition-all duration-200 flex flex-col justify-between shadow-card ${
                  isUnlocked
                    ? `${currentTheme.cardBorder} hover:shadow-card-hover`
                    : "border-cream-300 opacity-85 bg-cream-50/50"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badge & Lock indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${currentTheme.badgeBg}`}
                    >
                      {lvl.hskSpan}
                    </span>

                    {prog.hasPassedLevelTest ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-mint-dark bg-mint-light px-2.5 py-1 rounded-full border border-mint">
                        <CheckCircle2 size={14} />
                        Đã qua cấp
                      </span>
                    ) : !isUnlocked ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-charcoal/50 bg-cream-200 px-2.5 py-1 rounded-full">
                        <Lock size={14} />
                        Khóa
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-charcoal/60">
                        {lvl.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-2xl font-black text-charcoal flex items-center gap-2">
                      <span>{lvl.name}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal/70 mt-1 leading-relaxed line-clamp-3">
                      {lvl.description}
                    </p>
                  </div>

                  {/* Progress Bar & Circular Stats */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-charcoal/70">
                      <span>Tiến độ hoàn thành:</span>
                      <span>{prog.completedExams}/{prog.totalExams} đề ({prog.percentCompleted}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-cream-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${currentTheme.progressBar}`}
                        style={{ width: `${prog.percentCompleted}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Level-test requirement notification */}
                  <div className="p-3 bg-cream-100 rounded-2xl border border-cream-200 text-xs space-y-1">
                    <div className="font-bold text-charcoal flex items-center gap-1.5">
                      <Award size={15} className="text-amber-600" />
                      <span>Bài kiểm tra lên cấp:</span>
                    </div>
                    {prog.hasPassedLevelTest ? (
                      <p className="text-mint-dark font-medium">
                        Chúc mừng! Bạn đã thi đạt bài lên cấp của trình độ này.
                      </p>
                    ) : prog.canTakeLevelTest ? (
                      <p className="text-coral-dark font-bold">
                        Đã đủ điều kiện! Bạn có thể làm bài thi lên cấp ngay bây giờ.
                      </p>
                    ) : (
                      <p className="text-charcoal/60">
                        Cần thêm <strong className="text-charcoal">{prog.examsNeededForTest} đề</strong> đạt ≥ 60% để mở khóa bài thi lên cấp.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 space-y-2.5">
                  <Link
                    href={`/levels/${lvl.id}`}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 transition-transform active:translate-y-1 ${currentTheme.btnClass}`}
                  >
                    <span>{isUnlocked ? "Vào luyện đề" : "Xem danh sách đề"}</span>
                    <ArrowRight size={18} />
                  </Link>

                  {/* Level Test Button */}
                  <Link
                    href={`/level-test/${lvl.id}`}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-center block transition-colors border ${
                      prog.canTakeLevelTest || !isUnlocked
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-cream-100 text-charcoal/60 border-cream-200 hover:text-charcoal"
                    }`}
                  >
                    {!isUnlocked
                      ? "Thi vượt cấp để mở khóa ngay →"
                      : prog.canTakeLevelTest
                      ? "⚡ Làm bài kiểm tra lên cấp ngay!"
                      : "Thử sức trước bài kiểm tra lên cấp"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
