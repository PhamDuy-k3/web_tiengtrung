"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MascotWithBubble } from "./MascotWithBubble";

const GREETED_DATE_KEY = "hanyu:mascot:greeted_date";

function getLocalTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const DailyGreetingMascot: React.FC = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const isSuppressedRoute =
    pathname.startsWith("/practice/") ||
    pathname.startsWith("/level-test/") ||
    pathname === "/placement-test" ||
    pathname.startsWith("/learn/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const today = getLocalTodayKey();
      const lastGreeted = localStorage.getItem(GREETED_DATE_KEY);
      if (lastGreeted !== today) {
        setVisible(true);
      }
    } catch {
      // Ignore storage failures
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(GREETED_DATE_KEY, getLocalTodayKey());
    } catch {
      // Ignore
    }
  };

  if (!visible || isSuppressedRoute) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lời chào từ Han Han"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45 backdrop-blur-sm animate-fadeIn"
      onClick={handleDismiss}
    >
      <div
        className="animate-scale-in flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <MascotWithBubble
          action="wave"
          tone="celadon"
          size="lg"
          message="Chào bạn ngày mới! Han Han đã sẵn sàng cùng bạn luyện tiếng Trung hôm nay rồi nè!"
          onClose={handleDismiss}
          closeLabel="Đóng lời chào"
        />
      </div>
    </div>
  );
};
