"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Clock,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  ChevronRight,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  generateAssessmentRoadmap,
  GenerateRoadmapResponse,
  RoadmapLesson,
} from "@/lib/assessmentEngine";
import { useUserStore } from "@/store/useUserStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { formatDate } from "@/lib/utils";

const ASSESSMENT_STORAGE_KEY = "hanyu:assessment_result";
const SAVED_ROADMAP_STORAGE_KEY = "hanyu:saved_roadmap";

interface StoredAssessment {
  verified_level: number;
  weak_points?: string[];
  weak_skills?: string[];
  completedAt?: string;
}

interface SavedRoadmapRecord {
  roadmap: GenerateRoadmapResponse;
  verifiedLevel: number;
  targetLevel: number;
  dailyMinutes: number;
  weakPoints: string[];
  weakSkills: string[];
  assessmentCompletedAt?: string;
  lockedAt: string;
}

function isSavedRoadmapRecord(value: unknown): value is SavedRoadmapRecord {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.lockedAt === "string" &&
    typeof v.verifiedLevel === "number" &&
    typeof v.targetLevel === "number" &&
    typeof v.dailyMinutes === "number" &&
    !!v.roadmap &&
    typeof v.roadmap === "object"
  );
}

export default function RoadmapPage() {
  const { loadProfile } = useUserStore();

  const [hydrated, setHydrated] = useState(false);
  const [savedRecord, setSavedRecord] = useState<SavedRoadmapRecord | null>(null);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [assessmentCompletedAt, setAssessmentCompletedAt] = useState<string | undefined>();

  // Setup state (only editable when roadmap is not locked yet, or right after retaking placement test)
  const [verifiedLevel, setVerifiedLevel] = useState<number>(0);
  const [targetLevel, setTargetLevel] = useState<number>(3);
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [weakPoints, setWeakPoints] = useState<string[]>([]);
  const [weakSkills, setWeakSkills] = useState<string[]>(["grammar", "reading"]);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();

    let latestAssessment: StoredAssessment | null = null;
    try {
      const rawAssessment = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
      if (rawAssessment) {
        const parsed = JSON.parse(rawAssessment);
        if (parsed && typeof parsed.verified_level === "number") {
          latestAssessment = parsed;
        }
      }
    } catch {}

    let existingRecord: SavedRoadmapRecord | null = null;
    try {
      const rawSaved = localStorage.getItem(SAVED_ROADMAP_STORAGE_KEY);
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (isSavedRoadmapRecord(parsed)) {
          existingRecord = parsed;
        }
      }
    } catch {}

    // If a newer placement test was completed after the locked roadmap, unlock setup with the new assessment
    const hasNewerAssessment =
      !!latestAssessment &&
      (!existingRecord ||
        (!!latestAssessment.completedAt &&
          (!existingRecord.assessmentCompletedAt ||
            latestAssessment.completedAt > existingRecord.assessmentCompletedAt)));

    if (existingRecord && !hasNewerAssessment) {
      setSavedRecord(existingRecord);
      setVerifiedLevel(existingRecord.verifiedLevel);
      setTargetLevel(existingRecord.targetLevel);
      setDailyMinutes(existingRecord.dailyMinutes);
      setWeakPoints(existingRecord.weakPoints);
      setWeakSkills(existingRecord.weakSkills);
      setHasAssessment(!!latestAssessment);
      setAssessmentCompletedAt(existingRecord.assessmentCompletedAt);
    } else if (latestAssessment) {
      const assessed = Math.min(5, Math.max(0, latestAssessment.verified_level));
      setSavedRecord(null);
      setHasAssessment(true);
      setAssessmentCompletedAt(latestAssessment.completedAt);
      setVerifiedLevel(assessed);
      setTargetLevel(Math.min(6, Math.max(assessed + 1, 3)));
      setWeakPoints(Array.isArray(latestAssessment.weak_points) ? latestAssessment.weak_points : []);
      setWeakSkills(
        Array.isArray(latestAssessment.weak_skills) && latestAssessment.weak_skills.length > 0
          ? latestAssessment.weak_skills
          : ["grammar", "reading"]
      );
    } else {
      // No assessment and no locked roadmap yet -> start at HSK 0
      setSavedRecord(null);
      setHasAssessment(false);
      setVerifiedLevel(0);
      setTargetLevel(3);
      setDailyMinutes(30);
    }

    setHydrated(true);
  }, [loadProfile]);

  const previewRoadmap = useMemo(
    () =>
      generateAssessmentRoadmap({
        verified_level: verifiedLevel,
        target_level: targetLevel,
        daily_minutes: dailyMinutes,
        weak_points: weakPoints,
        weak_skills: weakSkills,
      }),
    [verifiedLevel, targetLevel, dailyMinutes, weakPoints, weakSkills]
  );

  const activeRoadmap = savedRecord ? savedRecord.roadmap : previewRoadmap;
  const isLocked = !!savedRecord;

  const handleConfirmAndSave = () => {
    const record: SavedRoadmapRecord = {
      roadmap: previewRoadmap,
      verifiedLevel,
      targetLevel,
      dailyMinutes,
      weakPoints,
      weakSkills,
      assessmentCompletedAt,
      lockedAt: new Date().toISOString(),
    };
    setSavedRecord(record);
    try {
      localStorage.setItem(SAVED_ROADMAP_STORAGE_KEY, JSON.stringify(record));
    } catch {}
  };

  const handleCopyJson = () => {
    if (!activeRoadmap) return;
    navigator.clipboard.writeText(JSON.stringify(activeRoadmap, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLessonBadge = (type: RoadmapLesson["type"]) => {
    switch (type) {
      case "new":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-celadon-100 text-celadon-dark border border-celadon-200">Bài mới</span>;
      case "review":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gilt-light text-gilt-deep border border-gilt-soft">Ôn tập</span>;
      case "test":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-vermillion-light text-vermillion-deep border border-vermillion-soft">Kiểm tra</span>;
      case "remedial":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">Củng cố điểm yếu</span>;
    }
  };

  const targetOptions = [1, 2, 3, 4, 5, 6]
    .filter((l) => l > verifiedLevel)
    .map((lvl) => ({
      value: lvl,
      label: `Chinh phục HSK ${lvl}`,
    }));

  if (!hydrated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-ink-muted">
        <div className="animate-spin w-10 h-10 border-4 border-celadon border-t-transparent rounded-full mx-auto mb-3" />
        Đang tải lộ trình học của bạn...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* ================= Header Hero ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-celadon-100 text-celadon-dark border border-celadon-200">
              <Compass size={28} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-ink">
                  Lộ trình học cá nhân hóa
                </h1>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-celadon-100 text-celadon-dark border border-celadon-200">
                    <Lock size={12} />
                    Đã lưu cố định
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-ink-muted">
                Thiết kế thông minh theo tuần, tập trung bồi đắp lỗ hổng kiến thức và bám sát chuẩn HSK chính thức.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/placement-test"
            className="px-5 py-3 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} className="text-celadon-dark" />
            <span>{isLocked ? "Thi xếp lớp để cập nhật lộ trình" : hasAssessment ? "Thi xếp lớp lại" : "Làm bài thi xếp lớp"}</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyJson}
            className="px-5 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-xs sm:text-sm shadow-soft hover:shadow-md transition-all flex items-center gap-2"
            title="Sao chép lộ trình chuẩn định dạng JSON"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Đã chép JSON" : "Xuất JSON"}</span>
          </button>
        </div>
      </div>

      {/* ================= Locked Summary OR One-time Setup Card ================= */}
      {isLocked && savedRecord ? (
        <div className="bg-white rounded-3xl p-6 border border-parchment-300 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-parchment-200 pb-3">
            <h2 className="text-base font-black text-ink flex items-center gap-2">
              <ShieldCheck size={18} className="text-celadon-dark" />
              <span>Thông số lộ trình đang theo học</span>
            </h2>
            <span className="text-xs text-ink-muted">
              Đã chốt lúc {formatDate(savedRecord.lockedAt)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-parchment-200 bg-parchment-50 p-4 space-y-1">
              <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={12} className="text-celadon-dark" />
                Trình độ hiện tại
              </div>
              <div className="text-lg font-black text-ink">
                {savedRecord.verifiedLevel === 0 ? "HSK 0 (Mới bắt đầu)" : `HSK ${savedRecord.verifiedLevel}`}
              </div>
              <div className="text-xs text-ink-light">
                {savedRecord.assessmentCompletedAt ? "Đã xác thực qua bài kiểm tra xếp lớp" : "Mặc định khi khởi tạo lộ trình"}
              </div>
            </div>

            <div className="rounded-2xl border border-parchment-200 bg-parchment-50 p-4 space-y-1">
              <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                Mục tiêu chinh phục
              </div>
              <div className="text-lg font-black text-celadon-dark">
                HSK {savedRecord.targetLevel}
              </div>
              <div className="text-xs text-ink-light">
                Lộ trình {savedRecord.roadmap.total_weeks} tuần liên tục
              </div>
            </div>

            <div className="rounded-2xl border border-parchment-200 bg-parchment-50 p-4 space-y-1">
              <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                Thời gian học mỗi ngày
              </div>
              <div className="text-lg font-black text-ink">
                {savedRecord.dailyMinutes} phút / ngày
              </div>
              <div className="text-xs text-ink-light">
                Kế hoạch cố định theo mục tiêu
              </div>
            </div>
          </div>

          {savedRecord.weakPoints.length > 0 && (
            <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 text-xs space-y-1.5">
              <div className="font-bold text-purple-900 flex items-center gap-1.5">
                <AlertTriangle size={15} />
                <span>Điểm yếu được ưu tiên củng cố ở tuần 1:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {savedRecord.weakPoints.map((wp, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-white text-purple-800 font-semibold border border-purple-200 text-[11px]"
                  >
                    #{wp}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-parchment-100 border border-parchment-200 px-4 py-3 text-xs text-ink-light">
            <span>
              Lộ trình đã được khóa cố định để bạn theo sát tiến độ. Muốn thay đổi trình độ hoặc lập lộ trình mới, hãy làm bài kiểm tra xếp lớp.
            </span>
            <Link
              href="/placement-test"
              className="shrink-0 font-bold text-celadon-dark hover:underline inline-flex items-center gap-1"
            >
              Thi xếp lớp lại <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border-2 border-celadon-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-parchment-200 pb-3">
            <h2 className="text-base font-black text-ink flex items-center gap-2">
              <Sparkles size={18} className="text-celadon-dark" />
              <span>
                {hasAssessment
                  ? "Thiết lập lộ trình từ kết quả kiểm tra xếp lớp"
                  : "Thiết lập lộ trình học (chọn một lần và lưu cố định)"}
              </span>
            </h2>
            <span className="text-xs font-semibold text-celadon-dark">
              Sau khi lưu sẽ khóa cố định
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Trình độ hiện tại (khóa theo kết quả thi xếp lớp) */}
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">
                Trình độ hiện tại (theo bài test):
              </label>
              <div className="w-full bg-parchment-100 border border-parchment-300 text-ink rounded-2xl px-4 py-2.5 text-sm font-semibold flex items-center justify-between gap-2">
                <span className="truncate">
                  {verifiedLevel === 0 ? "HSK 0 (Mới bắt đầu)" : `HSK ${verifiedLevel} (Đã xác thực)`}
                </span>
                <Lock size={15} className="shrink-0 text-ink-light" />
              </div>
              <p className="mt-1.5 text-[11px] text-ink-light">
                {hasAssessment ? (
                  <>Lấy tự động từ bài thi xếp lớp gần nhất.</>
                ) : (
                  <>
                    Chưa làm bài test?{" "}
                    <Link href="/placement-test" className="font-bold text-celadon-dark underline">
                      Thi xếp lớp ngay
                    </Link>{" "}
                    để xác định đúng trình độ.
                  </>
                )}
              </p>
            </div>

            {/* Mục tiêu mong muốn */}
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">
                Mục tiêu chinh phục:
              </label>
              <CustomSelect
                ariaLabel="Mục tiêu chinh phục"
                value={targetLevel}
                onChange={(val) => setTargetLevel(val)}
                options={targetOptions}
              />
            </div>

            {/* Thời gian học mỗi ngày */}
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">
                Thời gian học mỗi ngày:
              </label>
              <CustomSelect
                ariaLabel="Thời gian học mỗi ngày"
                value={dailyMinutes}
                onChange={(val) => setDailyMinutes(val)}
                options={[
                  { value: 15, label: "15 phút / ngày (Nhẹ nhàng)" },
                  { value: 30, label: "30 phút / ngày (Khuyên dùng)" },
                  { value: 45, label: "45 phút / ngày (Tăng tốc)" },
                  { value: 60, label: "60 phút / ngày (Cấp tốc)" },
                ]}
              />
            </div>
          </div>

          {/* Weak points chips if present */}
          {weakPoints.length > 0 && (
            <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 text-xs space-y-1.5">
              <div className="font-bold text-purple-900 flex items-center gap-1.5">
                <AlertTriangle size={15} />
                <span>Điểm yếu cần củng cố (sẽ được ưu tiên đưa vào tuần 1):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {weakPoints.map((wp, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-white text-purple-800 font-semibold border border-purple-200 text-[11px]"
                  >
                    #{wp}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-parchment-200">
            <p className="text-xs text-ink-light">
              Xem trước bản kế hoạch bên dưới rồi bấm xác nhận. Sau khi lưu, chỉ có thể cập nhật lại sau khi thi xếp lớp lại.
            </p>
            <button
              type="button"
              onClick={handleConfirmAndSave}
              className="px-6 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm shadow-soft hover:shadow-md transition-all inline-flex items-center justify-center gap-2 shrink-0"
            >
              <CheckCircle2 size={17} />
              <span>Xác nhận &amp; Lưu lộ trình</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= Roadmap Summary Banner ================= */}
      {activeRoadmap && (
        <div className="bg-celadon-50 rounded-3xl p-6 border border-celadon-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-celadon-dark uppercase tracking-wider">
              {isLocked ? "Tổng quan kế hoạch học tập:" : "Bản xem trước kế hoạch học tập:"}
            </span>
            <p className="text-sm sm:text-base font-semibold text-ink leading-relaxed">
              {activeRoadmap.summary}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center px-4 py-2 bg-white rounded-2xl border border-celadon-200">
              <div className="text-[11px] text-ink-muted">Tổng thời gian</div>
              <div className="text-xl font-black text-celadon-dark">{activeRoadmap.total_weeks} Tuần</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= Timeline of Weeks ================= */}
      <div className="space-y-6">
        {activeRoadmap?.weeks.map((week) => (
          <div
            key={week.week}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-parchment-300 shadow-soft space-y-5"
          >
            {/* Week Title & Goal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-parchment-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-ink text-white">
                    TUẦN {week.week}
                  </span>
                  <span className="text-xs font-bold text-ink-muted">
                    {week.lessons.length} bài học
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-ink mt-1">
                  Mục tiêu: {week.goal}
                </h3>
              </div>
            </div>

            {/* Lessons List in Week */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {week.lessons.map((lesson, lIdx) => (
                <div
                  key={lesson.id}
                  className="p-4 rounded-2xl border border-parchment-200 hover:border-celadon/50 bg-parchment-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-parchment-200 text-ink font-bold text-xs flex items-center justify-center">
                          {lIdx + 1}
                        </span>
                        {getLessonBadge(lesson.type)}
                      </div>
                      <span className="text-[11px] text-ink-muted font-semibold flex items-center gap-1">
                        <Clock size={12} />
                        {lesson.estimated_minutes} phút
                      </span>
                    </div>

                    {/* Lesson Topic */}
                    <h4 className="font-bold text-sm text-ink leading-snug">
                      {lesson.topic}
                    </h4>

                    {/* Meta info */}
                    <div className="text-xs space-y-1 text-ink-muted">
                      {lesson.new_words > 0 && (
                        <div>
                          📚 <strong>{lesson.new_words} từ mới</strong>
                        </div>
                      )}
                      {lesson.grammar.length > 0 && (
                        <div className="line-clamp-2">
                          📐 <strong>Ngữ pháp:</strong> {lesson.grammar.join(" • ")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start learning button */}
                  <div className="pt-2 border-t border-parchment-200/70 flex items-center justify-between">
                    <span className="text-[11px] text-ink-muted uppercase font-bold">
                      Kỹ năng: {lesson.skills.join(", ")}
                    </span>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 text-xs font-bold text-celadon-dark hover:underline"
                    >
                      <span>Học ngay</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
