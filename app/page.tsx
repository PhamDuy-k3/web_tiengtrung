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
import { repository, REQUIRED_EXAMS_FOR_LEVEL_TEST } from "@/services";
import { DailyMissionProgress, Level, LevelProgressInfo, MistakeEntry } from "@/types";

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
  <div className={`flex flex-col items-center justify-center text-center px-4 py-3.5 sm:px-5 sm:py-4 md:min-w-[106px] rounded-2xl ${colorClass}`}>
    <div className="mb-1">{icon}</div>
    <div className="text-2xl font-black leading-none">{value}</div>
    <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mt-1">{label}</div>
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
  const [dailyMissions, setDailyMissions] = useState<DailyMissionProgress | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadProfile();
    const refreshDailyMissions = () => {
      repository.getDailyMissionProgress()
        .then(setDailyMissions)
        .catch((error: unknown) => console.error("Lỗi tải nhiệm vụ ngày:", error));
    };
    window.addEventListener("focus", refreshDailyMissions);
    async function fetch() {
      try {
        const lvls = await repository.getLevels();
        setLevels(lvls);
        const progs: Record<string, LevelProgressInfo> = {};
        for (const l of lvls) progs[l.id] = await repository.getLevelProgress(l.id);
        setLevelProgresses(progs);
        setMistakes(await repository.getMistakes());
        setDueSrsCount((await repository.getDueSrsItems()).length);
        setDailyMissions(await repository.getDailyMissionProgress());
      } finally { setLoading(false); }
    }
    fetch();
    return () => window.removeEventListener("focus", refreshDailyMissions);
  }, [loadProfile]);

  const badMistakes = mistakes.filter((m) => !m.isMastered).length;
  const userName    = isHydrated && profile?.name ? profile.name : "Học viên";
  const streak      = isHydrated ? profile?.streak || 1 : 1;
  const xp          = isHydrated ? profile?.totalXp || 0 : 0;

  // ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-10 space-y-8 sm:space-y-10 relative overflow-hidden">

      {/* ── Background decorative Hanzi ── */}
      <BgHanzi char="学" className="right-0 -top-6 text-[220px] text-ink/[0.025] hidden lg:block" />
      <BgHanzi char="习" className="left-0 top-96 text-[160px] text-celadon/[0.05] hidden lg:block" />

      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-parchment-100 via-parchment-50 to-celadon-50 border border-parchment-300 shadow-soft p-5 sm:p-8 lg:p-10">

          {/* Dot grid texture */}
          <div className="absolute inset-0 bg-pattern-dots opacity-40" />

          <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 md:gap-8">
            {/* Left: greeting */}
            <div className="space-y-3 w-full md:max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-celadon" />
                <span className="text-xs font-bold text-celadon-dark uppercase tracking-widest">
                  Chào mừng trở lại
                </span>
              </div>
              <h1 className="text-[28px] sm:text-4xl font-black text-ink leading-tight">
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
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <Link
                  href="/review"
                  className="btn-primary w-full sm:w-auto justify-center text-sm py-3 sm:py-2.5 px-5 rounded-xl flex items-center gap-2"
                >
                  <RotateCcw size={16} className="shrink-0" />
                  <span>Hôm nay cần ôn {dueSrsCount} mục</span>
                </Link>
                <div className="grid grid-cols-2 gap-2.5 sm:contents">
                  <Link
                    href="/placement-test"
                    className="btn-ghost w-full sm:w-auto justify-center text-center text-xs sm:text-sm py-2.5 px-2.5 sm:px-5 rounded-xl flex items-center gap-1.5 sm:gap-2 bg-white/70 sm:bg-transparent"
                  >
                    <Compass size={15} className="shrink-0" />
                    <span className="leading-tight">Kiểm tra trình độ HSK</span>
                  </Link>
                  <Link
                    href="/roadmap"
                    className="btn-ghost w-full sm:w-auto justify-center text-center text-xs sm:text-sm py-2.5 px-2.5 sm:px-5 rounded-xl flex items-center gap-1.5 sm:gap-2 bg-white/70 sm:bg-transparent"
                  >
                    <Calendar size={15} className="shrink-0" />
                    <span className="leading-tight">Lộ trình học theo tuần</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: stat chips */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:flex md:items-center md:shrink-0">
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

      <section className="space-y-4" aria-labelledby="daily-missions-heading">
        <div>
          <h2 id="daily-missions-heading" className="text-xl font-black text-ink">Nhiệm vụ hôm nay</h2>
          <p className="text-xs text-ink-light mt-1">Hoàn thành để duy trì streak và nhận XP thưởng một lần mỗi ngày.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DailyMissionCard
            title="Ôn 10 mục SRS"
            progress={dailyMissions?.reviewsCompleted ?? 0}
            target={10}
            reward={20}
            claimed={dailyMissions?.reviewRewardClaimed ?? false}
            href="/review"
            action="Vào phiên ôn"
          />
          <DailyMissionCard
            title="Hoàn thành 1 đề"
            progress={dailyMissions?.examsCompleted ?? 0}
            target={1}
            reward={15}
            claimed={dailyMissions?.examRewardClaimed ?? false}
            href="/practice/random-exam-basic?mode=quick"
            action="Làm đề nhanh"
          />
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
              Hoàn thành ≥ {REQUIRED_EXAMS_FOR_LEVEL_TEST} đề đạt ≥ 60% để mở khóa bài kiểm tra lên cấp
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
                  examsNeededForTest: REQUIRED_EXAMS_FOR_LEVEL_TEST, hasPassedLevelTest: false,
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
                      {isUnlocked ? (
                        <>
                          <Link
                            href={`/levels/${lvl.id}`}
                            className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all ${th.btnBg} hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0`}
                          >
                            Vào luyện đề
                            <ArrowRight size={16} />
                          </Link>
                          {prog.canTakeLevelTest || prog.hasPassedLevelTest ? (
                            <Link
                              href={`/level-test/${lvl.id}`}
                              className={`flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors border ${th.bgAccent} border-current/20 ${th.accent}`}
                            >
                              {prog.hasPassedLevelTest
                                ? "Làm lại bài kiểm tra lên cấp"
                                : "⚡ Làm bài kiểm tra lên cấp"}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-semibold border bg-parchment-100 border-parchment-300 text-ink-light/70 cursor-not-allowed"
                            >
                              <Lock size={13} />
                              <span>Cần thêm {prog.examsNeededForTest} đề đạt ≥ 60% để thi</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-bold bg-parchment-200 text-ink-light border border-parchment-300 cursor-not-allowed"
                          >
                            <Lock size={15} />
                            <span>Đang khóa</span>
                          </button>
                          <div className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-semibold border bg-parchment-100/80 border-parchment-300 text-ink-light">
                            <Lock size={12} className="shrink-0" />
                            <span>
                              {lvl.id === "intermediate"
                                ? "Đạt ≥ 80% thi lên cấp Cơ bản để mở"
                                : "Đạt ≥ 80% thi lên cấp Trung cấp để mở"}
                            </span>
                          </div>
                        </>
                      )}
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

function DailyMissionCard({
  title,
  progress,
  target,
  reward,
  claimed,
  href,
  action,
}: {
  title: string;
  progress: number;
  target: number;
  reward: number;
  claimed: boolean;
  href: string;
  action: string;
}) {
  const completed = progress >= target;
  const shownProgress = Math.min(progress, target);
  return (
    <article className="rounded-2xl border border-parchment-300 bg-white p-5 shadow-soft space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-ink">{title}</h3>
          <p className="mt-1 text-xs text-ink-muted">{shownProgress}/{target} · Thưởng {reward} XP{claimed ? " · Đã nhận" : ""}</p>
        </div>
        {completed ? <CheckCircle2 size={21} className="text-celadon shrink-0" /> : <Sparkles size={20} className="text-gilt-deep shrink-0" />}
      </div>
      <div className="h-2 rounded-full bg-parchment-200 overflow-hidden" role="progressbar" aria-valuenow={shownProgress} aria-valuemin={0} aria-valuemax={target} aria-label={`${title}: ${shownProgress}/${target}`}>
        <div className="h-full rounded-full bg-celadon transition-all" style={{ width: `${(shownProgress / target) * 100}%` }} />
      </div>
      <Link href={href} className="inline-flex items-center gap-1.5 text-xs font-bold text-celadon-dark hover:text-celadon">
        {completed ? "Xem tiến độ" : action}<ArrowRight size={14} />
      </Link>
    </article>
  );
}
