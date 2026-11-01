import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "myStock - 智慧股票分析系統 (台股 / 美股)",
  description: "支援台股與美股的現代化股票分析、即時報價、TradingView K線圖與個人投資組合管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
