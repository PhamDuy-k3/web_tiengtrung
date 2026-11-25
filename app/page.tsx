"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  ArrowRight,
  BookMarked,
  Compass,
  CheckCircle2,
  Lock,
  Trophy,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { repository } from "@/services";
import { Level, LevelProgressInfo, MistakeEntry } from "@/types";

// ── Decorative Hanzi in background ──────────────────────────────
const BgHanzi = ({ char, className }: { char: string; className?: string }) => (
  <div
    aria-hidden
    className={`absolute font-chinese font-black select-none pointer-events-none ${className}`}
  >
    {char}
  </div>
);

// ── Stat Chip ───────────────────────────────────────────────────
const StatChip = ({
  icon,
  value,
  label,
  colorClass,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  colorClass: string;
}) => (
  <div className={`flex flex-col items-center px-5 py-4 rounded-2xl ${colorClass}`}>
    <div className="mb-1">{icon}</div>
    <div className="text-2xl font-black leading-none">{value}</div>
    <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mt-0.5">{label}</div>
  </div>
);

// ── Level colour configs ─────────────────────────────────────────
interface LevelTheme {
  accent:    string;
  bgAccent:  string;
  border:    string;
  btnBg:     string;
  badgeBg:   string;
  barFill:   string;
  char:      string;
  charColor: string;
  glow:      string;
}

const LEVEL_THEME: Record<string, LevelTheme> = {
  basic: {
    accent:    "text-celadon",
    bgAccent:  "bg-celadon-100",
    border:    "border-celadon-200 hover:border-celadon",
    btnBg:     "bg-gradient-to-r from-celadon to-celadon-500 hover:from-celadon-500 hover:to-celadon-600",
    badgeBg:   "bg-celadon-100 text-celadon-dark border-celadon-200",
    barFill:   "from-celadon-200 to-celadon",
    char:      "语",
    charColor: "text-celadon/10",
    glow:      "shadow-glow-green",
  },
  intermediate: {
    accent:    "text-gilt-deep",
    bgAccent:  "bg-gilt-light",
    border:    "border-parchment-300 hover:border-gilt",
    btnBg:     "bg-gradient-to-r from-gilt to-gilt-dark hover:from-gilt-dark hover:to-gilt-deep",
    badgeBg:   "bg-gilt-light text-gilt-deep border-gilt-soft",
    barFill:   "from-gilt-soft to-gilt",
    char:      "言",
    charColor: "text-gilt/10",
    glow:      "shadow-glow-gold",
  },
  advanced: {
    accent:    "text-vermillion",
    bgAccent:  "bg-vermillion-light",
    border:    "border-parchment-300 hover:border-vermillion",
    btnBg:     "bg-gradient-to-r from-vermillion to-vermillion-dark hover:from-vermillion-dark hover:to-vermillion-deep",
    badgeBg:   "bg-vermillion-light text-vermillion-deep border-vermillion-soft",
    barFill:   "from-vermillion-soft to-vermillion",
    char:      "文",
    charColor: "text-vermillion/10",
    glow:      "shadow-glow-red",
  },
} as Record<string, (typeof LEVEL_THEME)["basic"]>;

// ══════════════════════════════════════════════════════════════════
export default function HomePage() {
  const { profile, isHydrated, loadProfile } = useUserStore();
  const [levels, setLevels]     = useState<Level[]>([]);
  const [levelProgresses, setLevelProgresses] = useState<Record<string, LevelProgressInfo>>({});
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [dueSrsCount, setDueSrsCount] = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadProfile();
    async function fetch() {
      try {
        const lvls = await repository.getLevels();
        setLevels(lvls);
        const progs: Record<string, LevelProgressInfo> = {};
        for (const l of lvls) progs[l.id] = await repository.getLevelProgress(l.id);
        setLevelProgresses(progs);
        setMistakes(await repository.getMistakes());
        setDueSrsCount((await repository.getDueSrsItems()).length);
      } finally { setLoading(false); }
    }
    fetch();
  }, [loadProfile]);

  const badMistakes = mistakes.filter((m) => !m.isMastered).length;
  const userName    = isHydrated && profile?.name ? profile.name : "Học viên";
  const streak      = isHydrated ? profile?.streak || 1 : 1;
  const xp          = isHydrated ? profile?.totalXp || 0 : 0;

  // ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 relative overflow-hidden">

      {/* ── Background decorative Hanzi ── */}
      <BgHanzi char="学" className="right-0 -top-6 text-[220px] text-ink/[0.025] hidden lg:block" />
      <BgHanzi char="习" className="left-0 top-96 text-[160px] text-celadon/[0.05] hidden lg:block" />

      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-parchment-100 via-parchment-50 to-celadon-50 border border-parchment-300 shadow-soft p-8 sm:p-10">

          {/* Dot grid texture */}
          <div className="absolute inset-0 bg-pattern-dots opacity-40" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Left: greeting */}
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-celadon" />
                <span className="text-xs font-bold text-celadon-dark uppercase tracking-widest">
                  Chào mừng trở lại
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-ink leading-tight">
                {userName}，
                <br />
                <span className="text-gradient-green">加油学习！</span>
                <span className="ml-2 text-2xl">👋</span>
              </h1>
              <p className="text-sm sm:text-base text-ink-light leading-relaxed">
                Luyện 15 phút mỗi ngày, phản xạ chữ Hán như tiếng mẹ đẻ.
                Chọn cấp bên dưới hoặc làm bài kiểm tra xếp lớp đầu vào.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/review"
                  className="btn-primary text-sm py-2.5 px-5 rounded-xl flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Hôm nay cần ôn {dueSrsCount} mục
                </Link>
                <Link
                  href="/placement-test"
                  className="btn-ghost text-sm py-2.5 px-5 rounded-xl flex items-center gap-2"
                >
                  <Compass size={16} />
                  Kiểm tra trình độ HSK
                </Link>
                <Link
                  href="/roadmap"
                  className="btn-ghost text-sm py-2.5 px-5 rounded-xl flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Lộ trình học theo tuần
                </Link>
              </div>
            </div>

            {/* Right: stat chips */}
            <div className="flex items-center gap-3 shrink-0">
              <StatChip
                icon={<Flame size={22} className="fill-gilt text-gilt" />}
                value={streak}
                label="Ngày streak"
                colorClass="bg-gilt-light border border-gilt-soft text-gilt-deep"
              />
              <StatChip
                icon={<Zap size={20} className="text-celadon fill-celadon-200" />}
                value={xp}
                label="XP"
                colorClass="bg-celadon-50 border border-celadon-200 text-celadon-dark"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          QUICK-ACTION CARDS
      ════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Mistakes card */}
        <div className="card p-6 flex items-start gap-5 group hover:shadow-medium transition-shadow duration-200">
          <div className="w-12 h-12 rounded-2xl bg-vermillion-light flex items-center justify-center shrink-0 border border-vermillion-soft text-vermillion">
            <BookMarked size={24} />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-base text-ink">Sổ tay câu hay sai</h2>
              {badMistakes > 0 && (
                <span className="badge badge-red shrink-0">{badMistakes} cần ôn</span>
              )}
            </div>
            <p className="text-xs text-ink-light leading-relaxed">
              {badMistakes > 0
                ? `${badMistakes} câu được ghi nhận. Luyện lại để chuyển sang "Đã thuộc".`
                : "Tuyệt vời! Không có câu sai nào trong sổ."}
            </p>
            <Link
              href="/mistakes"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-vermillion hover:text-vermillion-dark transition-colors mt-1"
            >
              Ôn luyện ngay
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Placement test card */}
        <div className="card p-6 flex items-start gap-5 bg-gradient-to-br from-gilt-light/40 to-parchment-50 border border-gilt-soft hover:shadow-medium transition-shadow duration-200">
          <div className="w-12 h-12 rounded-2xl bg-gilt-light flex items-center justify-center shrink-0 border border-gilt-soft text-gilt-deep">
            <Compass size={24} />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-base text-ink">Kiểm tra trình độ đầu vào</h2>
              <span className="badge badge-gold">Tùy chọn</span>
            </div>
            <p className="text-xs text-ink-light leading-relaxed">
              Làm đề 30 câu tổng hợp HSK 1-6 (30 phút) để xếp vào đúng cấp học ngay từ đầu.
            </p>
            <Link
              href="/placement-test"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-gilt-deep hover:text-gilt-dark transition-colors mt-1"
            >
              Bắt đầu thi phân loại
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          LEVEL CARDS
      ════════════════════════════════════════════════════════════ */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-ink">Chọn cấp độ luyện tập</h2>
            <p className="text-xs text-ink-light mt-1">
              Hoàn thành ≥ 70% số đề đạt ≥ 60% để mở khóa bài kiểm tra lên cấp
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="card p-6 space-y-4">
                  <div className="skeleton h-5 w-20 rounded-lg" />
                  <div className="skeleton h-8 w-32 rounded-lg" />
                  <div className="skeleton h-16 rounded-xl" />
                  <div className="skeleton h-10 rounded-xl" />
                </div>
              ))
            : levels.map((lvl) => {
                const prog = levelProgresses[lvl.id] || {
                  totalExams: 16, completedExams: 0, qualifyingExams: 0,
                  percentCompleted: 0, canTakeLevelTest: false,
                  examsNeededForTest: 12, hasPassedLevelTest: false,
                };
                const isUnlocked = isHydrated
                  ? (profile?.unlockedLevels.includes(lvl.id) ?? lvl.id === "basic")
                  : lvl.id === "basic";
                const th = LEVEL_THEME[lvl.id] || LEVEL_THEME["basic"];

                return (
                  <div
                    key={lvl.id}
                    className={`card border-2 p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${th.border} ${
                      isUnlocked ? "bg-parchment-50" : "bg-parchment-100/60 opacity-80"
                    }`}
                  >
                    {/* BIG decorative char */}
                    <div
                      aria-hidden
                      className={`absolute right-4 bottom-4 font-chinese text-8xl font-black ${th.charColor} select-none pointer-events-none`}
                    >
                      {th.char}
                    </div>

                    <div className="space-y-5 relative z-10">
                      {/* Top row: badge + status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`badge border ${th.badgeBg} text-xs`}>{lvl.hskSpan}</span>
                        {prog.hasPassedLevelTest ? (
                          <span className="flex items-center gap-1 badge badge-green">
                            <CheckCircle2 size={12} /> Đã qua cấp
                          </span>
                        ) : !isUnlocked ? (
                          <span className="flex items-center gap-1 badge badge-ink">
                            <Lock size={12} /> Khóa
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-ink/40">{lvl.badge}</span>
                        )}
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className={`text-2xl font-black ${th.accent}`}>{lvl.name}</h3>
                        <p className="text-xs text-ink-light mt-1 leading-relaxed line-clamp-3">
                          {lvl.description}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-ink-light">
                          <span>Tiến độ</span>
                          <span className={`font-bold ${th.accent}`}>
                            {prog.completedExams}/{prog.totalExams} đề ({prog.percentCompleted}%)
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className={`progress-fill bg-gradient-to-r ${th.barFill}`}
                            style={{ width: `${prog.percentCompleted}%` }}
                          />
                        </div>
                      </div>

                      {/* Level test status */}
                      <div className={`rounded-xl p-3.5 ${th.bgAccent} border border-current/10 text-xs space-y-1`}>
                        <div className={`flex items-center gap-1.5 font-bold ${th.accent}`}>
                          <Trophy size={13} />
                          <span>Bài kiểm tra lên cấp</span>
                        </div>
                        {prog.hasPassedLevelTest ? (
                          <p className="text-celadon-dark font-medium">✓ Đã thi đạt. Chúc mừng!</p>
                        ) : prog.canTakeLevelTest ? (
                          <p className={`${th.accent} font-bold`}>⚡ Đủ điều kiện! Có thể thi ngay.</p>
                        ) : (
                          <p className="text-ink-light">
                            Cần thêm <strong className="text-ink">{prog.examsNeededForTest} đề</strong> đạt ≥ 60% để mở khóa.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="pt-5 space-y-2.5 relative z-10">
                      <Link
                        href={`/levels/${lvl.id}`}
                        className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all ${th.btnBg} hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0`}
                      >
                        {isUnlocked ? "Vào luyện đề" : "Xem danh sách"}
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        href={`/level-test/${lvl.id}`}
                        className={`flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors border ${
                          prog.canTakeLevelTest
                            ? `${th.bgAccent} border-current/20 ${th.accent} font-bold`
                            : "bg-transparent border-parchment-300 text-ink-light hover:bg-parchment-200"
                        }`}
                      >
                        {!isUnlocked
                          ? "Thi vượt cấp để mở khóa →"
                          : prog.canTakeLevelTest
                          ? "⚡ Làm bài kiểm tra lên cấp"
                          : "Xem trước bài kiểm tra lên cấp"}
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          DISCLAIMER FOOTER STRIP
      ════════════════════════════════════════════════════════════ */}
      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-wisteria-light border border-wisteria-soft text-xs text-wisteria-dark">
        <AlertCircle size={15} className="shrink-0 mt-0.5" />
        <span>
          Toàn bộ câu hỏi được biên soạn theo chuẩn từ vựng & ngữ pháp HSK chính thống (Hanban / CTI). Không sao chép nguyên văn từ sách hay đề thi có bản quyền.{" "}
          <Link href="/sources" className="font-bold underline hover:no-underline">
            Xem nguồn tham khảo
          </Link>
        </span>
      </div>

    </div>
  );
}
