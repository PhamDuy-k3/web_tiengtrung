"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ArrowRight, X, Sparkles } from "lucide-react";

const SESSION_KEY = "hanyu:support_banner_seen";

export const SupportWelcomeBanner: React.FC = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Never interrupt active exams, placement tests, bot runner, or the support page itself.
    if (
      pathname === "/support" ||
      pathname === "/bot" ||
      pathname === "/placement-test" ||
      pathname.startsWith("/practice/") ||
      pathname.startsWith("/level-test/")
    ) {
      return;
    }

    // Do not show again on page reload (F5) within the same browser/tab session.
    const navEntries = performance.getEntriesByType?.("navigation") as
      | PerformanceNavigationTiming[]
      | undefined;
    const isReload = navEntries?.[0]?.type === "reload";

    try {
      const alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
      if (alreadySeen || isReload) return;

      const timer = window.setTimeout(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
        setVisible(true);
      }, 450);
      return () => window.clearTimeout(timer);
    } catch {
      // Ignore storage errors in restricted WebViews
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Mời xem góc ủng hộ dự án"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/35 backdrop-blur-[2px] animate-fadeIn"
      onClick={() => setVisible(false)}
    >
      <div
        className="bg-parchment-50 border-2 border-parchment-300 rounded-3xl max-w-md w-full p-6 shadow-lifted space-y-4 relative animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Đóng thông báo"
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-parchment-200 hover:bg-parchment-300 flex items-center justify-center text-ink-light transition-colors"
        >
          <X size={16} />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vermillion-light border border-vermillion-soft text-vermillion-deep text-xs font-black">
          <Heart size={13} className="fill-vermillion text-vermillion" />
          <span>Góc ủng hộ tác giả</span>
        </div>

        <div className="space-y-1.5 pr-6">
          <h2 className="text-xl font-black text-ink leading-snug">
            Chào bạn đến với 汉语 Practice!
          </h2>
          <p className="text-sm text-ink-light leading-relaxed">
            Web luyện tiếng Trung HSK hoạt động{" "}
            <strong className="text-ink">miễn phí 100%</strong>. Nếu thấy hữu ích, mời bạn ghé qua trang{" "}
            <strong className="text-celadon-dark">Đồ dùng &amp; Tiện ích gợi ý</strong> để tham khảo và ủng hộ mình duy trì website nhé!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Link
            href="/support"
            onClick={() => setVisible(false)}
            className="flex-1 px-4 py-3 rounded-2xl bg-celadon hover:bg-celadon-600 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-soft transition-all"
          >
            <Sparkles size={15} />
            <span>Xem góc ủng hộ</span>
            <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="px-4 py-3 rounded-2xl bg-parchment-200 hover:bg-parchment-300 text-ink font-bold text-sm transition-colors"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
};
