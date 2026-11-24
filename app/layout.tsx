import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

// Nunito works fine with next/font
const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "汉语 Practice — Luyện tiếng Trung chuẩn HSK cho người Việt",
  description: "Nền tảng thực hành tiếng Trung chuyên sâu dành riêng cho người Việt. Bám sát từ vựng & ngữ pháp HSK 1-6 chính thống, giao diện Á Đông hiện đại.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={nunito.variable}>
      <head>
        {/* Noto Sans SC loaded via standard Google Fonts link (avoids next/font CJK subset issue) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap"
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
