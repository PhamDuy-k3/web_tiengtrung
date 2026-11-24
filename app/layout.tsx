import type { Metadata } from "next";
import { Nunito, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["chinese-simplified"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-chinese",
  display: "swap",
  preload: false,          // CJK fonts are huge – don't block page load
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
    <html lang="vi" className={`${nunito.variable} ${notoSansSC.variable}`}>
      <body className="min-h-screen flex flex-col bg-parchment-50 text-ink font-sans selection:bg-celadon/20 selection:text-celadon-dark">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-8">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
