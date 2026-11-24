"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Dice5,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Trophy,
} from "lucide-react";
import { repository } from "@/services";
import { Level, LevelId, Topic, Exam, LevelProgressInfo } from "@/types";

export default function LevelDetailPage() {
  const params = useParams();
  const levelId = (params.levelId as LevelId) || "basic";

  const [level, setLevel] = useState<Level | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicExams, setTopicExams] = useState<Record<string, Exam[]>>({});
  const [progress, setProgress] = useState<Record<string, { bestScore: number; attempts: number }>>({});
  const [levelProg, setLevelProg] = useState<LevelProgressInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const lvl = await repository.getLevel(levelId);
        setLevel(lvl);

        const tps = await repository.getTopics(levelId);
        setTopics(tps);

        const exMap: Record<string, Exam[]> = {};
        for (const t of tps) {
          exMap[t.id] = await repository.getExams(t.id);
        }
        setTopicExams(exMap);

        const progMap = await repository.getProgress();
        setProgress(progMap);

        const lp = await repository.getLevelProgress(levelId);
        setLevelProg(lp);
      } catch (e) {
        console.error("Lỗi tải trang cấp độ:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [levelId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-charcoal/60">
        <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tải kho đề cấp độ...
      </div>
    );
  }

  if (!level) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy cấp độ này</h2>
        <Link href="/" className="text-coral underline mt-2 inline-block">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top back navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/60 hover:text-coral transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Level Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-coral/10 text-coral border border-coral/20">
              {level.hskSpan}
            </span>
            <span className="text-xs font-bold text-charcoal/50">{level.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-charcoal">
            Cấp độ: {level.name}
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 max-w-2xl leading-relaxed">
            {level.description}
          </p>
        </div>

        {/* Quick Action: Random Exam from this Level */}
        <div className="shrink-0">
          <Link
            href={`/practice/random-exam-${level.id}`}
            className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 shadow-duo-honey active:translate-y-1 transition-all"
          >
            <Dice5 size={20} />
            <span>Luyện đề ngẫu nhiên (12 câu)</span>
          </Link>
        </div>
      </div>

      {/* Level Test Status / Unlock Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-cream-100 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="text-amber-600" size={20} />
            <h2 className="font-bold text-lg text-charcoal">Bài kiểm tra lên cấp</h2>
          </div>
          {levelProg?.hasPassedLevelTest ? (
            <p className="text-sm text-mint-dark font-bold">
              ✓ Bạn đã xuất sắc hoàn thành bài kiểm tra lên cấp của trình độ này!
            </p>
          ) : levelProg?.canTakeLevelTest ? (
            <p className="text-sm text-coral-dark font-bold">
              🎉 Bạn đã làm đủ {levelProg.qualifyingExams}/{levelProg.totalExams} đề đạt từ 60% trở lên! Bài thi lên cấp đã sẵn sàng mở khóa.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-charcoal/70">
              Tiến độ mở khóa: Đã đạt {levelProg?.qualifyingExams || 0}/{Math.ceil((levelProg?.totalExams || 16) * 0.7)} đề yêu cầu (còn thiếu{" "}
              <strong className="text-coral">{levelProg?.examsNeededForTest || 0} đề</strong> nữa).
            </p>
          )}
        </div>

        <Link
          href={`/level-test/${level.id}`}
          className={`px-5 py-3 rounded-2xl font-bold text-sm shrink-0 flex items-center gap-2 transition-all shadow-sm ${
            levelProg?.canTakeLevelTest
              ? "bg-coral hover:bg-coral-dark text-white shadow-duo-coral animate-pulse"
              : "bg-white hover:bg-cream-100 text-charcoal border border-amber-300"
          }`}
        >
          <span>{levelProg?.canTakeLevelTest ? "Làm bài thi lên cấp ngay!" : "Xem đề thi lên cấp"}</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* TOPICS & EXAMS LIST */}
      <div className="space-y-10">
        {topics.map((topic) => {
          const exams = topicExams[topic.id] || [];

          return (
            <div key={topic.id} className="space-y-4">
              {/* Topic Header */}
              <div className="flex items-center gap-3 border-b border-cream-300 pb-2">
                <span className="text-2xl sm:text-3xl">{topic.icon}</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-charcoal">
                    {topic.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-charcoal/60">
                    {topic.description} ({exams.length} đề thi)
                  </p>
                </div>
              </div>

              {/* Exams Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {exams.map((exam, idx) => {
                  const p = progress[exam.id];
                  const hasDone = p && p.attempts > 0;
                  const isHigh = p && p.bestScore >= 80;

                  return (
                    <div
                      key={exam.id}
                      className="bg-white rounded-3xl p-5 border-2 border-cream-300 hover:border-amber-300 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Status Tag */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-charcoal/40">
                            Đề {idx + 1}
                          </span>
                          {hasDone ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                isHigh
                                  ? "bg-mint-light text-mint-dark"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Điểm cao: {p.bestScore}%
                            </span>
                          ) : (
                            <span className="text-charcoal/40 bg-cream-200 px-2 py-0.5 rounded-full">
                              Chưa làm
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-charcoal line-clamp-1">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-charcoal/60 line-clamp-2 leading-relaxed">
                          {exam.description}
                        </p>
                        <div className="text-[11px] text-charcoal/50 font-medium">
                          {exam.questions.length} câu hỏi • Có âm thanh phát âm
                        </div>
                      </div>

                      <div className="pt-4">
                        <Link
                          href={`/practice/${exam.id}`}
                          className="w-full py-2.5 rounded-xl bg-coral/10 hover:bg-coral text-coral hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-coral/30 hover:border-coral"
                        >
                          <span>{hasDone ? "Luyện lại đề" : "Bắt đầu làm bài"}</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
