"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Zap, User, BookOpen, ShieldCheck, BarChart2, Menu, X, Compass, MessageCircle } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { profile, isHydrated, loadProfile } = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) loadProfile();
  }, [isHydrated, loadProfile]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: "/",         label: "Học tập",    icon: BookOpen   },
    { href: "/roadmap",  label: "Lộ trình",   icon: Compass    },
    // { href: "/chat",     label: "Trò chuyện", icon: MessageCircle },
    { href: "/mistakes", label: "Sổ lỗi sai", icon: ShieldCheck },
    { href: "/stats",    label: "Thống kê",   icon: BarChart2  },
    { href: "/sources",  label: "Nguồn tham khảo", icon: null  },
  ];

  return (
    <>
      <header className="sticky top-0 z-40">
        {/* Top bar: parchment nền, cạnh dưới ornament line */}
        <div className="bg-parchment-50/95 backdrop-blur-xl border-b border-parchment-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

            {/* ── LOGO ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              {/* Logo mark: vuông tròn góc, nền celadon, chữ Hán trắng */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-celadon to-celadon-600 flex items-center justify-center shadow-soft group-hover:shadow-glow-green transition-all duration-200 group-hover:scale-105">
                <span className="font-chinese text-white text-xl font-black leading-none">汉</span>
                {/* Small dot accent */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gilt border-2 border-parchment-50"></span>
              </div>
              <div className="leading-tight">
                <div className="text-lg font-black tracking-tight text-ink flex items-baseline gap-1.5">
                  <span>汉语</span>
                  <span className="text-ink text-sm font-bold opacity-40 tracking-wide">PRACTICE</span>
                </div>
                <div className="text-[11px] text-ink-light font-semibold tracking-wider uppercase hidden sm:block">
                  Luyện tiếng Trung chuẩn HSK
                </div>
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? "text-celadon bg-celadon-100"
                        : "text-ink-light hover:text-ink hover:bg-parchment-200/80"
                    }`}
                  >
                    {item.label}
                    {/* Active underline */}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-celadon" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── RIGHT SLOT: stats + avatar + mobile menu ── */}
            <div className="flex items-center gap-2">
              {/* Streak pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gilt-light border border-gilt-soft text-gilt-deep font-bold text-sm">
                <Flame size={16} className="fill-gilt text-gilt" />
                <span>{isHydrated ? profile?.streak || 1 : 1}</span>
              </div>

              {/* XP pill – hidden on small */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-celadon-50 border border-celadon-200 text-celadon-600 font-bold text-sm">
                <Zap size={15} className="fill-celadon-300 text-celadon" />
                <span>{isHydrated ? profile?.totalXp || 0 : 0} XP</span>
              </div>

              {/* Avatar */}
              <Link
                href="/profile"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-celadon to-celadon-600 flex items-center justify-center text-white shadow-soft hover:shadow-glow-green transition-all"
              >
                <User size={17} />
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden w-9 h-9 rounded-xl bg-parchment-200 flex items-center justify-center text-ink-light hover:bg-parchment-300 transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Mở menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN MENU ── */}
        {mobileOpen && (
          <div className="md:hidden absolute inset-x-0 top-16 bg-parchment-50/98 backdrop-blur-xl border-b border-parchment-300 shadow-lifted z-50 animate-fade-up">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-celadon-100 text-celadon"
                        : "text-ink-light hover:bg-parchment-200 hover:text-ink"
                    }`}
                  >
                    {Icon && <Icon size={18} />}
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-celadon" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
