"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TopicAccuracyChartProps {
  data: Record<string, { topicName: string; correct: number; total: number }>;
}

export const TopicAccuracyChart: React.FC<TopicAccuracyChartProps> = ({ data }) => {
  const chartData = Object.keys(data).map((topicId) => {
    const item = data[topicId];
    const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    return {
      name: item.topicName,
      accuracy: pct,
      correct: item.correct,
      total: item.total,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-charcoal/40 text-sm italic">
        Chưa có thống kê theo chủ đề.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#636E72" }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#636E72" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-2xl shadow-xl border border-cream-300 text-xs space-y-1">
                    <p className="font-bold text-charcoal">{item.name}</p>
                    <p className="text-mint-dark font-bold text-sm">Tỷ lệ đúng: {item.accuracy}%</p>
                    <p className="text-charcoal/50">
                      Đúng {item.correct}/{item.total} câu
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="accuracy" fill="#FFC94A" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
