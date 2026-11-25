import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

// Both fonts loaded via <link> to avoid next/font Google Fonts fetch bug on Vercel (Next.js 14.2.x)
// See: https://github.com/vercel/next.js/issues/55682

export const metadata: Metadata = {
  title: "汉语 Practice — Luyện tiếng Trung chuẩn HSK cho người Việt",
  description:
    "Nền tảng thực hành tiếng Trung chuyên sâu dành riêng cho người Việt. Bám sát từ vựng & ngữ pháp HSK 1-6 chính thống, giao diện Á Đông hiện đại.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* Google Fonts — loaded via link to bypass next/font CJK + Vietnamese subset bug on Vercel */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-parchment-50 text-ink font-sans selection:bg-celadon/20 selection:text-celadon-dark">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-8">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
