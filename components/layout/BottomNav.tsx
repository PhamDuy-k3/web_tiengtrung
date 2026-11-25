"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShieldCheck, BarChart2, User, Clock, Compass, MessageCircle } from "lucide-react";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/practice/") && !pathname.includes("/result/")) return null;
  if (pathname.startsWith("/level-test/")) return null;
  if (pathname === "/placement-test") return null;

  const items = [
    { href: "/",         label: "Học",      icon: BookOpen   },
    { href: "/roadmap",  label: "Lộ trình", icon: Compass    },
    // { href: "/chat",     label: "Trò chuyện", icon: MessageCircle },
    { href: "/mistakes", label: "Sổ lỗi",   icon: ShieldCheck },
    { href: "/stats",    label: "Thống kê", icon: BarChart2  },
    { href: "/profile",  label: "Hồ sơ",    icon: User       },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-parchment-50/96 backdrop-blur-xl border-t border-parchment-300">
      <div className="flex items-stretch h-16">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive ? "text-celadon" : "text-ink-light hover:text-ink"
              }`}
            >
              {/* Active highlight dot */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-celadon" />
              )}
              <Icon
                size={20}
                className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"}
              />
              <span className={`text-[10px] font-semibold tracking-wide leading-none ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
