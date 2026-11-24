import React from "react";
import Link from "next/link";
import { ChineseCloud, ChineseLantern } from "@/components/ui/ChineseDecoration";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cream-100 border-t border-cream-300 pt-12 pb-24 md:pb-12 text-charcoal/70 relative overflow-hidden">
      <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
        <ChineseCloud className="w-32 h-16 text-coral" />
      </div>
      <div className="absolute left-6 bottom-4 opacity-15 pointer-events-none">
        <ChineseLantern className="w-16 h-28 text-coral" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-coral flex items-center justify-center text-white font-chinese font-bold text-lg">
                汉
              </span>
              <span className="text-xl font-black text-charcoal">Hanyu Luyện Tập</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Nền tảng thực hành tiếng Trung thuần bài tập theo phương pháp phản xạ Duolingo dành riêng cho người Việt. Bám sát danh mục từ vựng và ngữ pháp HSK 1 - 6 chính thống.
            </p>
            <div className="text-xs text-charcoal/50">
              © {new Date().getFullYear()} Hanyu Practice Platform. All rights reserved.
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2.5">
            <div className="font-bold text-charcoal text-sm uppercase tracking-wider">
              Khám phá
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-coral transition-colors">
                  Cấp độ & Kho đề
                </Link>
              </li>
              <li>
                <Link href="/placement-test" className="hover:text-coral transition-colors">
                  Bài kiểm tra đầu vào
                </Link>
              </li>
              <li>
                <Link href="/mistakes" className="hover:text-coral transition-colors">
                  Sổ lỗi sai thông minh
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-coral transition-colors">
                  Lịch sử làm bài
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-coral transition-colors">
                  Biểu đồ & Thống kê
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Standards & Sources */}
          <div className="space-y-2.5">
            <div className="font-bold text-charcoal text-sm uppercase tracking-wider">
              Nguồn chính thống
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sources" className="hover:text-coral transition-colors font-semibold text-coral">
                  Xem tài liệu chuẩn tham khảo →
                </Link>
              </li>
              <li>
                <span className="text-xs text-charcoal/60">
                  Khung chuẩn HSK 3.0 / HSK 2.0 (Hanban / CTI)
                </span>
              </li>
              <li>
                <span className="text-xs text-charcoal/60">
                  HSK Standard Course (北京语言大学出版社)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
