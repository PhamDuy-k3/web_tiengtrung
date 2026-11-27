"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  Heart,
  Sparkles,
  Tag,
  ArrowLeft,
  Info,
} from "lucide-react";
import {
  AFFILIATE_PRODUCTS,
  type AffiliateCategory,
} from "@/data/affiliateLinks";

const CATEGORY_TABS: Array<{ id: AffiliateCategory; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "tech", label: "Công nghệ & Phụ kiện" },
  { id: "desk", label: "Góc học tập & Sức khỏe" },
  { id: "chinese", label: "Học tiếng Trung" },
];

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<AffiliateCategory>("all");
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMobileDevice(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }
  }, []);

  const handleAffiliateClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string
  ) => {
    if (!isMobileDevice) return;
    // On mobile browsers (iOS Safari / Android Chrome), target="_blank" often
    // traps short links inside a browser tab instead of triggering Universal/App Links.
    // Top-level navigation allows the OS to hand off vt.tiktok.com directly to the TikTok app.
    e.preventDefault();
    window.location.assign(url);
  };

  const visibleProducts = useMemo(() => {
    return AFFILIATE_PRODUCTS.filter((item) => {
      if (!item.enabled) return false;
      if (selectedCategory === "all") return true;
      return item.category === selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-light hover:text-celadon transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-soft space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vermillion-light border border-vermillion-soft text-vermillion-deep text-xs font-black uppercase tracking-wider">
          <Heart size={14} className="fill-vermillion text-vermillion" />
          <span>Ủng hộ dự án miễn phí</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-ink leading-tight">
          Đồ dùng góc học tập &amp; Tiện ích gợi ý
        </h1>

        <p className="text-sm sm:text-base text-ink-light leading-relaxed max-w-3xl">
          Website luyện thi HSK hoạt động hoàn toàn miễn phí và không chèn quảng cáo gây xao nhãng.
          Dưới đây là tổng hợp các món phụ kiện công nghệ, đồ dùng góc học tập và tài liệu hữu ích hằng ngày — nếu bạn có nhu cầu mua sắm, đặt qua link bên dưới cũng là cách ủng hộ tác giả duy trì website.
        </p>

        <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 flex items-start gap-2.5 text-xs sm:text-sm text-ink-light">
          <Info size={18} className="text-celadon shrink-0 mt-0.5" />
          <span>
            <strong className="text-ink">Minh bạch:</strong> Các sản phẩm bên dưới gắn liên kết TikTok Shop Affiliate của tác giả. Giá bạn mua không hề thay đổi, nhưng mỗi đơn hàng qua link sẽ giúp mình có thêm kinh phí duy trì website miễn phí.
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_TABS.map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                active
                  ? "bg-celadon text-white border-celadon shadow-soft"
                  : "bg-white text-ink-light border-parchment-300 hover:border-celadon-200 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleProducts.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-parchment-300 shadow-soft flex flex-col justify-between gap-5 hover:border-celadon-200 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-celadon-50 border border-celadon-200 text-celadon-dark text-[11px] font-bold">
                  <BookOpen size={12} />
                  {item.tagLabel}
                </span>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gilt-light border border-gilt-soft text-gilt-deep text-[11px] font-bold">
                      <Sparkles size={11} />
                      {item.badge}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-ink text-white text-[11px] font-bold">
                    {item.platform}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black text-ink leading-snug">
                  {item.title}
                </h2>
                <p className="text-xs font-semibold text-ink-muted mt-0.5">
                  {item.subtitle}
                </p>
              </div>

              <p className="text-sm text-ink-light leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-parchment-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Tag size={14} className="text-gilt-deep" />
                <span>{item.priceHint || "Xem giá ưu đãi"}</span>
              </div>

              <a
                href={item.affiliateUrl}
                target={isMobileDevice ? undefined : "_blank"}
                rel="noopener noreferrer sponsored"
                onClick={(e) => handleAffiliateClick(e, item.affiliateUrl)}
                className="px-4 py-2.5 rounded-xl bg-ink hover:bg-ink-dark text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-soft transition-all shrink-0"
              >
                <span>Mở trên {item.platform}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
