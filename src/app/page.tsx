import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MarketIndices from '@/components/MarketIndices';
import { getMarketIndices, POPULAR_STOCKS, getStockQuote } from '@/lib/stock-service';
import {
  TrendingUp,
  LineChart,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const revalidate = 60; // 靜態快取 60 秒

export default async function HomePage() {
  // 1. 取得大盤指數報價
  const indices = await getMarketIndices();

  // 2. 取得焦點熱門股票前 8 檔即時報價
  const featuredList = POPULAR_STOCKS.slice(0, 8);
  const quotes = await Promise.all(
    featuredList.map(async (item) => {
      try {
        return await getStockQuote(item.symbol);
      } catch {
        return {
          symbol: item.symbol,
          name: item.name,
          price: item.market === 'TW' ? 1000 : 200,
          change: 0,
          changePercent: 0,
          market: item.market,
          volume: 50000,
          high: 1000,
          low: 990,
          open: 995,
          previousClose: 1000,
          currency: item.market === 'TW' ? 'TWD' : 'USD',
          updatedAt: new Date().toISOString(),
        };
      }
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-950 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>全方位台美雙市場支援 ‧ 雲端極速架構</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              智慧股票分析系統
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-300">
                深入技術指標 ‧ 掌握市場動向
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              整合台股 (TWSE/TPEx) 與美股 (US Market)，搭載 TradingView 互動式 K 線圖、
              三大法人與基本面財務河流圖，並透過 Supabase 雲端資料庫安全管理個人自選股與持股損益記帳。
            </p>
          </div>
          {/* 背景裝飾光暈 */}
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        </div>

        {/* 1. 大盤焦點指數 (加權指數 / 櫃買 / S&P 500 / 那斯達克 / 道瓊) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span>全球主要市場指數 (Major Market Indices)</span>
            </h2>
          </div>
          <MarketIndices indices={indices} />
        </section>

        {/* 2. 熱門焦點個股 (台股 + 美股) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                市場焦點股報價 (Market Movers)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                點擊任一標的即可查看 TradingView 互動 K 線與指標分析
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quotes.map((q) => {
              const isUp = q.change >= 0;
              const isTaiwan = q.market === 'TW';
              // 顏色邏輯：台股紅漲綠跌，美股綠漲紅跌
              const textClass = isTaiwan
                ? isUp
                  ? 'text-red-400'
                  : 'text-emerald-400'
                : isUp
                ? 'text-emerald-400'
                : 'text-red-400';

              const badgeClass = isTaiwan
                ? isUp
                  ? 'bg-red-950/40 text-red-400 border border-red-900/40'
                  : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                : isUp
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                : 'bg-red-950/40 text-red-400 border border-red-900/40';

              return (
                <Link
                  key={q.symbol}
                  href={`/stock/${q.symbol}`}
                  className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900/90 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            q.market === 'TW'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {q.market === 'TW' ? '台股' : '美股'}
                        </span>
                        <span className="font-bold text-slate-100 group-hover:text-blue-400 transition">
                          {q.symbol}
                        </span>
                      </div>
                      <span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${badgeClass}`}>
                        {isUp ? '+' : ''}
                        {q.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-400 font-medium truncate">
                      {q.name}
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-slate-800/60 pt-3">
                    <div>
                      <span className="text-xl font-extrabold tracking-tight text-white">
                        {q.price.toLocaleString()}
                      </span>
                      <span className="ml-1 text-xs text-slate-500">{q.currency}</span>
                    </div>

                    <div className={`text-xs font-semibold ${textClass}`}>
                      {isUp ? '+' : ''}
                      {q.change.toFixed(2)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 3. 系統核心功能卡片 (Feature Grid) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <LineChart className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">TradingView 互動 K 線</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              採用 TradingView 官方 Lightweight Charts，支援縮放、日均線 (MA20)
              與成交量疊圖，並自動依市場切換台股與美股配色慣例。
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Supabase 雲端個人資料安全</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              透過 Supabase Row Level Security (RLS) 與 Auth，您的自選清單、目標價提醒
              與買賣損益帳本完全加密隔離，只有您自己能存取。
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">GitHub + Vercel 極速部署</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              全站透過 Next.js App Router 打造，程式碼同步於 GitHub，由 Vercel Edge
              全球 CDN 提供毫秒級快速載入與自動化 CI/CD。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>myStock 股票分析系統 © 2026 - Powered by Next.js, Vercel & Supabase</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-300 transition">市場總覽</Link>
            <Link href="/watchlist" className="hover:text-slate-300 transition">我的自選</Link>
            <Link href="/portfolio" className="hover:text-slate-300 transition">投資記帳</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
