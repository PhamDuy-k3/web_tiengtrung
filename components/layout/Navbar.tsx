"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Sparkles, BookOpen, User, BarChart2, ShieldCheck } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { profile, isHydrated, loadProfile } = useUserStore();

  useEffect(() => {
    if (!isHydrated) {
      loadProfile();
    }
  }, [isHydrated, loadProfile]);

  const navLinks = [
    { href: "/", label: "Học tập", icon: BookOpen },
    { href: "/mistakes", label: "Sổ lỗi sai", icon: ShieldCheck },
    { href: "/stats", label: "Thống kê", icon: BarChart2 },
    { href: "/sources", label: "Nguồn chuẩn", icon: null },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-coral flex items-center justify-center text-white font-chinese text-2xl font-black shadow-duo-coral group-hover:scale-105 transition-transform">
            汉
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-charcoal flex items-center gap-1.5">
              <span>Hanyu</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-honey/30 text-amber-900 font-bold">
                Duolingo
              </span>
            </div>
            <div className="text-xs text-charcoal/50 font-medium hidden sm:block">
              Luyện tiếng Trung chuẩn HSK
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-cream-100 p-1.5 rounded-2xl border border-cream-200">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white text-coral shadow-sm"
                    : "text-charcoal/70 hover:text-charcoal hover:bg-cream-200/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Stats & Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Counter */}
          <div
            title={`Chuỗi ngày học liên tục: ${profile?.streak || 1} ngày`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm shadow-sm"
          >
            <Flame size={18} className="text-amber-500 fill-amber-500 animate-bounce" />
            <span>{isHydrated ? profile?.streak || 1 : 1}</span>
          </div>

          {/* XP Counter */}
          <div
            title={`Tổng điểm kinh nghiệm: ${profile?.totalXp || 0} XP`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-coral/10 border border-coral/20 text-coral font-bold text-sm shadow-sm"
          >
            <Sparkles size={16} className="text-coral" />
            <span>{isHydrated ? profile?.totalXp || 0 : 0} XP</span>
          </div>

          {/* Profile Avatar / Link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-cream-200/80 border border-transparent hover:border-cream-300 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-coral to-honey flex items-center justify-center text-white font-bold shadow-sm">
              <User size={18} />
            </div>
            <span className="hidden lg:block text-sm font-bold text-charcoal truncate max-w-[120px]">
              {isHydrated ? profile?.name || "Học viên" : "Học viên"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
