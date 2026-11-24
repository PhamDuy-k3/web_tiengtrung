"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Layers,
  Award,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import {
  generateAssessmentRoadmap,
  GenerateRoadmapResponse,
  RoadmapWeek,
  RoadmapLesson,
} from "@/lib/assessmentEngine";
import { useUserStore } from "@/store/useUserStore";

export default function RoadmapPage() {
  const { profile, loadProfile } = useUserStore();

  const [verifiedLevel, setVerifiedLevel] = useState<number>(1);
  const [targetLevel, setTargetLevel] = useState<number>(3);
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [weakPoints, setWeakPoints] = useState<string[]>([]);
  const [weakSkills, setWeakSkills] = useState<string[]>(["grammar", "reading"]);

  const [roadmap, setRoadmap] = useState<GenerateRoadmapResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Load from previous assessment if available
  useEffect(() => {
    loadProfile();
    try {
      const stored = localStorage.getItem("hanyu:assessment_result");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.verified_level === "number") {
          setVerifiedLevel(parsed.verified_level);
          setTargetLevel(Math.min(6, Math.max(parsed.verified_level + 1, 3)));
        }
        if (Array.isArray(parsed.weak_points)) {
          setWeakPoints(parsed.weak_points);
        }
        if (Array.isArray(parsed.weak_skills)) {
          setWeakSkills(parsed.weak_skills);
        }
      }
    } catch {}
  }, [loadProfile]);

  // Generate roadmap on parameter change or initial load
  const handleGenerateRoadmap = () => {
    const res = generateAssessmentRoadmap({
      verified_level: verifiedLevel,
      target_level: targetLevel,
      daily_minutes: dailyMinutes,
      weak_points: weakPoints,
      weak_skills: weakSkills,
    });
    setRoadmap(res);
    try {
      localStorage.setItem("hanyu:saved_roadmap", JSON.stringify(res));
    } catch {}
  };

  useEffect(() => {
    handleGenerateRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedLevel, targetLevel, dailyMinutes]);

  const handleCopyJson = () => {
    if (!roadmap) return;
    navigator.clipboard.writeText(JSON.stringify(roadmap, null, 2));
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
              <h1 className="text-2xl sm:text-3xl font-black text-ink">
                Lộ trình học cá nhân hóa
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                Thiết kế thông minh theo tuần, tập trung bồi đắp lỗ hổng kiến thức và bám sát chuẩn HSK chính thức.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/placement-test"
            className="px-5 py-3 rounded-2xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <RotateCcw size={16} className="text-celadon-dark" />
            <span>Thi xếp lớp lại</span>
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

      {/* ================= Control Parameters Card ================= */}
      <div className="bg-white rounded-3xl p-6 border border-parchment-300 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-parchment-200 pb-3">
          <h2 className="text-base font-black text-ink flex items-center gap-2">
            <Sparkles size={18} className="text-celadon-dark" />
            <span>Tùy chỉnh thông số lộ trình</span>
          </h2>
          <span className="text-xs text-ink-muted">Tự động tối ưu hóa bài học</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Trình độ hiện tại */}
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">
              Trình độ hiện tại:
            </label>
            <select
              value={verifiedLevel}
              onChange={(e) => {
                const val = Number(e.target.value);
                setVerifiedLevel(val);
                if (targetLevel <= val) setTargetLevel(Math.min(6, val + 1));
              }}
              className="w-full bg-parchment-50 border border-parchment-300 text-ink rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-celadon"
            >
              <option value={0}>HSK 0 (Mới bắt đầu / Chưa biết gì)</option>
              <option value={1}>HSK 1 (Nền tảng căn bản)</option>
              <option value={2}>HSK 2 (Sơ cấp giao tiếp)</option>
              <option value={3}>HSK 3 (Trung cấp sơ bộ)</option>
              <option value={4}>HSK 4 (Trung cấp vững vàng)</option>
              <option value={5}>HSK 5 (Cao cấp thương mại)</option>
            </select>
          </div>

          {/* Mục tiêu mong muốn */}
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">
              Mục tiêu chinh phục:
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(Number(e.target.value))}
              className="w-full bg-parchment-50 border border-parchment-300 text-ink rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-celadon"
            >
              {[1, 2, 3, 4, 5, 6]
                .filter((l) => l > verifiedLevel)
                .map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Chinh phục HSK {lvl}
                  </option>
                ))}
            </select>
          </div>

          {/* Thời gian học mỗi ngày */}
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1.5 uppercase tracking-wider">
              Thời gian học mỗi ngày:
            </label>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full bg-parchment-50 border border-parchment-300 text-ink rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-celadon"
            >
              <option value={15}>15 phút / ngày (Nhẹ nhàng)</option>
              <option value={30}>30 phút / ngày (Khuyên dùng)</option>
              <option value={45}>45 phút / ngày (Tăng tốc)</option>
              <option value={60}>60 phút / ngày (Cấp tốc)</option>
            </select>
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
      </div>

      {/* ================= Roadmap Summary Banner ================= */}
      {roadmap && (
        <div className="bg-celadon-50 rounded-3xl p-6 border border-celadon-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-celadon-dark uppercase tracking-wider">
              Tổng quan kế hoạch học tập:
            </span>
            <p className="text-sm sm:text-base font-semibold text-ink leading-relaxed">
              {roadmap.summary}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center px-4 py-2 bg-white rounded-2xl border border-celadon-200">
              <div className="text-[11px] text-ink-muted">Tổng thời gian</div>
              <div className="text-xl font-black text-celadon-dark">{roadmap.total_weeks} Tuần</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= Timeline of Weeks ================= */}
      <div className="space-y-6">
        {roadmap?.weeks.map((week) => (
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
