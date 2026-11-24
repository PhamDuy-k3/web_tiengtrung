"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShieldCheck, BarChart2, User, Clock } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  // Hide bottom nav inside active exam practice to give full screen focus
  if (pathname.startsWith("/practice/") && !pathname.includes("/result/")) {
    return null;
  }
  if (pathname.startsWith("/level-test/")) {
    return null;
  }
  if (pathname === "/placement-test") {
    return null;
  }

  const items = [
    { href: "/", label: "Học", icon: BookOpen },
    { href: "/mistakes", label: "Sổ lỗi sai", icon: ShieldCheck },
    { href: "/history", label: "Lịch sử", icon: Clock },
    { href: "/stats", label: "Thống kê", icon: BarChart2 },
    { href: "/profile", label: "Hồ sơ", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? "text-coral font-bold scale-105"
                  : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
