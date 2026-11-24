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
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-chinese",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hanyu - Luyện tập tiếng Trung phản xạ chuẩn HSK",
  description: "Website luyện tập tiếng Trung thực hành cho người Việt, giao diện trực quan phong cách Duolingo, bám sát khung chuẩn HSK 1-6.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${nunito.variable} ${notoSansSC.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream-100 text-charcoal font-sans selection:bg-coral/20 selection:text-coral-dark">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-8">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
