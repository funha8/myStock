import React from 'react';
import Navbar from '@/components/Navbar';
import StockChart from '@/components/StockChart';
import WatchlistButton from '@/components/WatchlistButton';
import StockNotes from '@/components/StockNotes';
import { getStockQuote, getStockHistory, normalizeSymbol } from '@/lib/stock-service';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function StockPage({ params }: StockPageProps) {
  const resolvedParams = await params;
  const decodedSymbol = decodeURIComponent(resolvedParams.symbol);
  const { symbol, market } = normalizeSymbol(decodedSymbol);

  // 平行取得即時報價與 K 線資料
  const [quote, candles] = await Promise.all([
    getStockQuote(symbol),
    getStockHistory(symbol, 180),
  ]);

  const isUp = quote.change >= 0;
  const isTaiwan = market === 'TW';
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 回上頁導航 */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>返回市場首頁</span>
          </Link>
        </div>

        {/* 頂部股票基本資訊與現價 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  market === 'TW'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-blue-950 text-blue-400 border border-blue-800'
                }`}
              >
                {market === 'TW' ? '台股' : '美股'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {quote.symbol}
              </h1>
              <span className="text-lg text-slate-400 font-medium">{quote.name}</span>
            </div>
            <p className="text-xs text-slate-500">
              更新時間：{new Date(quote.updatedAt).toLocaleString('zh-TW')} ‧ 幣別：{quote.currency}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {quote.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">{quote.currency}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-end gap-2">
                <span className={`text-sm font-semibold flex items-center gap-0.5 ${textClass}`}>
                  {isUp ? (
                    <TrendingUp className="h-3.5 w-3.5 inline" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 inline" />
                  )}
                  {isUp ? '+' : ''}
                  {quote.change.toFixed(2)}
                </span>
                <span className={`rounded px-2 py-0.5 text-xs font-bold font-mono ${badgeClass}`}>
                  {isUp ? '+' : ''}
                  {quote.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* 加入自選按鈕 */}
            <div className="border-l border-slate-800 pl-4">
              <WatchlistButton symbol={quote.symbol} name={quote.name} market={market} />
            </div>
          </div>
        </div>

        {/* 重點數據指標卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
            <span className="text-xs text-slate-400">今日開盤</span>
            <p className="mt-1 font-mono text-base font-semibold text-slate-200">
              {quote.open?.toLocaleString() || '-'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
            <span className="text-xs text-slate-400">今日最高</span>
            <p className="mt-1 font-mono text-base font-semibold text-red-400">
              {quote.high?.toLocaleString() || '-'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
            <span className="text-xs text-slate-400">今日最低</span>
            <p className="mt-1 font-mono text-base font-semibold text-emerald-400">
              {quote.low?.toLocaleString() || '-'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
            <span className="text-xs text-slate-400">成交量</span>
            <p className="mt-1 font-mono text-base font-semibold text-slate-200">
              {quote.volume ? Number(quote.volume).toLocaleString() : '-'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
            <span className="text-xs text-slate-400">本益比 (PE)</span>
            <p className="mt-1 font-mono text-base font-semibold text-slate-200">
              {quote.peRatio ? quote.peRatio.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
            <span className="text-xs text-slate-400">殖利率 (%)</span>
            <p className="mt-1 font-mono text-base font-semibold text-amber-400">
              {quote.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* 互動式 TradingView Lightweight Charts */}
        <section>
          <StockChart candles={candles} symbol={quote.symbol} market={market} />
        </section>

        {/* 基本面與個人投資筆記區塊 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：基本面概覽 */}
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="h-4 w-4 text-blue-400" />
              <h2 className="font-semibold text-white">財務與評價面數據 (Fundamentals)</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
                <span className="text-xs text-slate-500">52 週最高</span>
                <p className="mt-0.5 font-bold text-slate-200 font-mono">
                  {quote.week52High ? quote.week52High.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
                <span className="text-xs text-slate-500">52 週最低</span>
                <p className="mt-0.5 font-bold text-slate-200 font-mono">
                  {quote.week52Low ? quote.week52Low.toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/60">
                <span className="text-xs text-slate-500">市值估值</span>
                <p className="mt-0.5 font-bold text-slate-200 font-mono">
                  {quote.marketCap ? `${(quote.marketCap / 1e9).toFixed(2)} 十億` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 p-4 text-xs text-blue-300 leading-relaxed">
              💡 提示：本分析系統已完整串接台美雙市場即時數據流。登入會員後，系統會自動在
              Supabase 同步您針對 <strong>{quote.symbol}</strong> 的自選目標價格與持股帳本。
            </div>
          </div>

          {/* 右側：個人策略筆記 (獨立 Client Component) */}
          <StockNotes symbol={quote.symbol} />
        </div>
      </main>
    </div>
  );
}
