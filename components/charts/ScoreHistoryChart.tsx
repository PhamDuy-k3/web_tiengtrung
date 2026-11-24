"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ScoreHistoryChartProps {
  data: { date: string; score: number; examTitle: string }[];
}

export const ScoreHistoryChart: React.FC<ScoreHistoryChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-charcoal/40 text-sm italic">
        Chưa có dữ liệu bài làm. Hãy hoàn thành một vài đề để xem biểu đồ điểm số!
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#636E72" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#636E72" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-2xl shadow-xl border border-cream-300 text-xs space-y-1">
                    <p className="font-bold text-charcoal">{item.examTitle}</p>
                    <p className="text-coral font-bold text-sm">Điểm: {item.score}%</p>
                    <p className="text-charcoal/50">Ngày: {item.date}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#EF5B5B"
            strokeWidth={3}
            dot={{ fill: "#EF5B5B", r: 5 }}
            activeDot={{ r: 8, fill: "#D94141" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
