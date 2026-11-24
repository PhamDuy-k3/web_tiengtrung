"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  TrendingUp,
  Target,
  Flame,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { repository } from "@/services";
import { OverallStats, UserProfile } from "@/types";
import { ScoreHistoryChart } from "@/components/charts/ScoreHistoryChart";
import { TopicAccuracyChart } from "@/components/charts/TopicAccuracyChart";

export default function StatsPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await repository.getStats();
        setStats(s);
        const p = await repository.getProfile();
        setProfile(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-charcoal/60">
        <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto mb-3"></div>
        Đang tổng hợp số liệu thống kê...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-cream-300 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal flex items-center gap-2">
          <BarChart2 className="text-coral" size={28} />
          <span>Báo cáo tiến độ & Thống kê học tập</span>
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/60">
          Theo dõi độ chính xác theo dạng bài, chủ đề và điểm số theo thời gian
        </p>
      </div>

      {/* Overview 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-cream-300 shadow-card text-center space-y-1">
          <div className="text-xs text-charcoal/60 font-semibold">Lượt làm bài</div>
          <div className="text-3xl font-black text-charcoal">
            {stats?.totalAttempts || 0}
          </div>
          <div className="text-[11px] text-charcoal/40">đề đã hoàn thành</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-300 shadow-card text-center space-y-1">
          <div className="text-xs text-charcoal/60 font-semibold">Số câu đã luyện</div>
          <div className="text-3xl font-black text-coral">
            {stats?.totalPracticedQuestions || 0}
          </div>
          <div className="text-[11px] text-charcoal/40">câu hỏi thực hành</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-300 shadow-card text-center space-y-1">
          <div className="text-xs text-charcoal/60 font-semibold">Điểm trung bình</div>
          <div className="text-3xl font-black text-amber-600">
            {stats?.averageScore || 0}%
          </div>
          <div className="text-[11px] text-charcoal/40">tổng các lần thi</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-300 shadow-card text-center space-y-1">
          <div className="text-xs text-charcoal/60 font-semibold">Chuỗi liên tục</div>
          <div className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1">
            <Flame size={24} className="fill-amber-500" />
            <span>{profile?.streak || 1}</span>
          </div>
          <div className="text-[11px] text-charcoal/40">ngày chăm chỉ</div>
        </div>
      </div>

      {/* Chart 1: Điểm số qua các lần làm gần nhất */}
      <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-coral" size={20} />
          <h2 className="font-bold text-lg text-charcoal">
            Biểu đồ điểm số (10 lần làm gần nhất)
          </h2>
        </div>
        <ScoreHistoryChart data={stats?.scoreHistory || []} />
      </div>

      {/* Chart 2: Tỷ lệ đúng theo chủ đề */}
      <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Target className="text-amber-600" size={20} />
          <h2 className="font-bold text-lg text-charcoal">
            Tỷ lệ trả lời đúng theo chủ đề
          </h2>
        </div>
        <TopicAccuracyChart data={stats?.accuracyByTopic || {}} />
      </div>

      {/* Table: Tỷ lệ đúng theo từng dạng câu hỏi */}
      <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-card space-y-4">
        <h2 className="font-bold text-lg text-charcoal">
          Hiệu suất theo 8 dạng bài tập
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-charcoal/50 text-xs uppercase tracking-wider">
                <th className="py-2.5 px-3">Dạng câu hỏi</th>
                <th className="py-2.5 px-3 text-center">Đúng / Tổng</th>
                <th className="py-2.5 px-3 text-right">Tỷ lệ chính xác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 font-medium">
              {stats?.accuracyByQuestionType &&
                Object.keys(stats.accuracyByQuestionType).map((key) => {
                  const item = stats.accuracyByQuestionType[key];
                  const pct =
                    item.total > 0
                      ? Math.round((item.correct / item.total) * 100)
                      : 0;

                  return (
                    <tr key={key} className="hover:bg-cream-50/60">
                      <td className="py-3 px-3 font-bold text-charcoal">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-center text-charcoal/60">
                        {item.correct} / {item.total}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            pct >= 80
                              ? "bg-mint-light text-mint-dark"
                              : pct >= 60
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {(!stats?.accuracyByQuestionType ||
                Object.keys(stats.accuracyByQuestionType).length === 0) && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-charcoal/40 italic">
                    Chưa có bài làm nào để thống kê dạng câu hỏi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
