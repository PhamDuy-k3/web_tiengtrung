import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-parchment-100 border-t border-parchment-300 pt-12 pb-24 md:pb-12 relative overflow-hidden">
      {/* Decorative background characters */}
      <div
        aria-hidden
        className="absolute right-8 top-8 font-chinese text-9xl font-black text-ink/[0.025] select-none pointer-events-none"
      >
        漢
      </div>
      <div
        aria-hidden
        className="absolute left-6 bottom-6 font-chinese text-7xl font-black text-celadon/[0.07] select-none pointer-events-none"
      >
        語
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-celadon to-celadon-600 flex items-center justify-center shadow-soft">
                <span className="font-chinese text-white font-black text-lg">汉</span>
              </div>
              <div>
                <div className="text-base font-black text-ink tracking-tight">汉语 Practice</div>
                <div className="text-[11px] text-ink-light font-semibold uppercase tracking-widest">HSK Standard</div>
              </div>
            </div>
            <p className="text-sm text-ink-light leading-relaxed max-w-xs">
              Nền tảng thực hành tiếng Trung thuần bài tập dành riêng cho người Việt. Bám sát chuẩn từ vựng & ngữ pháp HSK 1-6 chính thống của Hanban / CTI.
            </p>
            {/* Accent bar */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-6 h-1 rounded-full bg-celadon"></span>
              <span className="w-3 h-1 rounded-full bg-gilt"></span>
              <span className="w-2 h-1 rounded-full bg-vermillion"></span>
            </div>
            <p className="text-xs text-ink/40 font-medium">© {year} 汉语 Practice Platform</p>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <div className="text-xs font-black text-ink uppercase tracking-widest">Khám phá</div>
            <ul className="space-y-2 text-sm text-ink-light">
              {[
                { href: "/",               label: "Cấp độ & Kho đề"       },
                { href: "/placement-test", label: "Kiểm tra đầu vào"      },
                { href: "/mistakes",       label: "Sổ lỗi sai thông minh" },
                { href: "/history",        label: "Lịch sử làm bài"       },
                { href: "/stats",          label: "Biểu đồ & Thống kê"    },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-celadon transition-colors hover:translate-x-0.5 inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards */}
          <div className="space-y-3">
            <div className="text-xs font-black text-ink uppercase tracking-widest">Nguồn chính thống</div>
            <ul className="space-y-2 text-sm text-ink-light">
              <li>
                <Link href="/sources" className="text-celadon font-semibold hover:text-celadon-dark transition-colors">
                  Xem tài liệu tham khảo →
                </Link>
              </li>
              <li className="text-xs leading-relaxed">Khung chuẩn HSK 3.0 / HSK 2.0 (Hanban / CTI)</li>
              <li className="text-xs leading-relaxed">HSK Standard Course (北京语言大学出版社)</li>
              <li className="text-xs leading-relaxed">Developing Chinese (外语教学与研究出版社)</li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};
