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
  QrCode,
  Copy,
  Check,
  X,
  Smartphone,
} from "lucide-react";
import {
  AFFILIATE_PRODUCTS,
  type AffiliateCategory,
  type AffiliateProduct,
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
  const [deviceType, setDeviceType] = useState<"desktop" | "ios" | "android">(
    "desktop"
  );
  const [activeQrProduct, setActiveQrProduct] =
    useState<AffiliateProduct | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      if (/Android/i.test(ua)) setDeviceType("android");
      else if (/iPhone|iPad|iPod/i.test(ua)) setDeviceType("ios");
      else setDeviceType("desktop");
    }
  }, []);

  useEffect(() => {
    if (!activeQrProduct) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveQrProduct(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeQrProduct]);

  const isMobileDevice = deviceType !== "desktop";

  const getProductHref = (item: AffiliateProduct): string => {
    if (deviceType === "android" && item.platform === "TikTok Shop") {
      const stripped = item.affiliateUrl.replace(/^https?:\/\//, "");
      return `intent://${stripped}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
        item.affiliateUrl
      )};end`;
    }
    return item.affiliateUrl;
  };

  const handleAffiliateClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: AffiliateProduct
  ) => {
    // On mobile (iOS & Android), let the native <a href> click proceed WITHOUT
    // e.preventDefault() or target="_blank" so iOS Universal Links / Android Intent work cleanly.
    if (isMobileDevice) return;

    // On desktop browsers, TikTok Shop short links redirect to apps.apple.com.
    // Open a clean QR Code + Copy Link modal so users can scan with their phone.
    if (item.platform === "TikTok Shop") {
      e.preventDefault();
      setCopied(false);
      setQrFailed(false);
      setActiveQrProduct(item);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
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
          Đồ dùng góc học tập &amp; Tiện ích gợi ý.
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

              <div className="flex items-center gap-2 shrink-0">
                {isMobileDevice && item.platform === "TikTok Shop" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCopied(false);
                      setQrFailed(false);
                      setActiveQrProduct(item);
                    }}
                    title="Copy link hoặc quét QR"
                    aria-label="Copy link hoặc quét QR"
                    className="p-2.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink transition-colors"
                  >
                    <QrCode size={16} />
                  </button>
                )}
                <a
                  href={getProductHref(item)}
                  target={isMobileDevice ? undefined : "_blank"}
                  rel="noopener noreferrer sponsored"
                  onClick={(e) => handleAffiliateClick(e, item)}
                  className="px-4 py-2.5 rounded-xl bg-ink hover:bg-ink-dark text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-soft transition-all shrink-0"
                >
                  {!isMobileDevice && item.platform === "TikTok Shop" ? (
                    <>
                      <QrCode size={15} />
                      <span>Quét mở TikTok Shop</span>
                    </>
                  ) : (
                    <>
                      <span>Mở trên {item.platform}</span>
                      <ExternalLink size={14} />
                    </>
                  )}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop QR Code Modal for TikTok Shop */}
      {activeQrProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45 backdrop-blur-xs"
          onClick={() => setActiveQrProduct(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 border border-parchment-300 shadow-lifted space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveQrProduct(null)}
              aria-label="Đóng"
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-parchment-100 hover:bg-parchment-200 flex items-center justify-center text-ink-light"
            >
              <X size={16} />
            </button>

            <div className="space-y-1.5 pr-8">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-ink text-white text-[11px] font-bold">
                <Smartphone size={12} />
                TikTok Shop (App điện thoại)
              </span>
              <h3 className="text-lg font-black text-ink leading-snug">
                {activeQrProduct.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-ink-light leading-relaxed">
              TikTok Shop chỉ hỗ trợ xem giỏ hàng và đặt mua trên ứng dụng điện thoại. Hãy quét mã QR dưới đây bằng{" "}
              <strong className="text-ink">Camera điện thoại</strong> hoặc{" "}
              <strong className="text-ink">app TikTok</strong> để mở thẳng sản phẩm:
            </p>

            {/* QR Box */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-parchment-50 border border-parchment-300">
              {!qrFailed ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      activeQrProduct.affiliateUrl
                    )}`}
                    alt={`Mã QR mở ${activeQrProduct.title} trên TikTok Shop`}
                    width={200}
                    height={200}
                    onError={() => setQrFailed(true)}
                    className="rounded-xl bg-white p-2 border border-parchment-200"
                  />
                </>
              ) : (
                <div className="py-6 text-center text-xs text-ink-muted">
                  Không tải được ảnh QR. Bạn vui lòng sao chép link bên dưới để mở trên điện thoại.
                </div>
              )}
            </div>

            {/* Copy link bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={activeQrProduct.affiliateUrl}
                aria-label="Liên kết TikTok Shop"
                className="flex-1 px-3 py-2 rounded-xl bg-parchment-100 border border-parchment-300 text-xs font-mono text-ink-light truncate"
              />
              <button
                type="button"
                onClick={() => handleCopyUrl(activeQrProduct.affiliateUrl)}
                className="px-3.5 py-2 rounded-xl bg-celadon hover:bg-celadon-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Đã copy" : "Copy link"}</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <a
                href={activeQrProduct.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink underline underline-offset-2"
              >
                <span>Vẫn mở trực tiếp trong tab mới</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
