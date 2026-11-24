"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import { repository } from "@/services";
import { ExamAttempt } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await repository.getAttempts();
        setAttempts(data);
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
        Đang tải lịch sử làm bài...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-cream-300 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal flex items-center gap-2">
            <Clock className="text-coral" size={28} />
            <span>Lịch sử làm bài</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/60">
            Xem lại chi tiết tất cả các lượt làm bài và thi lên cấp của bạn
          </p>
        </div>
        <span className="text-xs font-bold text-charcoal/50 bg-cream-200 px-3 py-1.5 rounded-full">
          {attempts.length} lượt làm
        </span>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-300 shadow-sm space-y-3">
          <div className="text-4xl">📝</div>
          <h3 className="text-lg font-bold text-charcoal">Bạn chưa làm đề thi nào</h3>
          <p className="text-xs sm:text-sm text-charcoal/60">
            Hãy bắt đầu một đề luyện tập để ghi nhận lịch sử và điểm số!
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-coral text-white font-bold text-xs"
            >
              Chọn đề luyện ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {attempts.map((att) => {
            const isExcellent = att.score >= 80;
            const isPassed = att.score >= 60;

            return (
              <div
                key={att.id}
                className="bg-white rounded-3xl p-5 border-2 border-cream-300 hover:border-amber-300 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        isExcellent
                          ? "bg-mint-light text-mint-dark border-mint"
                          : isPassed
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}
                    >
                      {att.score}%
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-charcoal line-clamp-1">
                        {att.examTitle}
                      </h3>
                      <div className="text-xs text-charcoal/50 flex items-center gap-2 mt-0.5">
                        <span>{formatDate(att.createdAt)}</span>
                        <span>•</span>
                        <span>Thời gian: {formatTime(att.durationSeconds)}</span>
                        <span>•</span>
                        <span>
                          Đúng {att.correctCount}/{att.totalQuestions} câu
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                  <Link
                    href={`/practice/${att.examId}/result/${att.id}`}
                    className="px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal font-bold text-xs flex items-center gap-1.5 transition-colors border border-cream-300"
                  >
                    <span>Xem lại đáp án</span>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href={`/practice/${att.examId}`}
                    title="Luyện lại đề này"
                    className="p-2 rounded-xl bg-coral/10 hover:bg-coral text-coral hover:text-white transition-colors border border-coral/20"
                  >
                    <RotateCcw size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
