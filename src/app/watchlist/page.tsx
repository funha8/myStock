'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { WatchlistItem, StockQuote } from '@/lib/types';
import { Bookmark, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Loader2, LogIn } from 'lucide-react';

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(session.user);

        // 從 Supabase 取得使用者的自選股
        const { data: listItems, error } = await supabase
          .from('watchlist_items')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(error);
          setItems([]);
        } else {
          setItems(listItems || []);

          // 抓取每一檔股票的即時報價
          if (listItems && listItems.length > 0) {
            const quotePromises = listItems.map(async (item: WatchlistItem) => {
              try {
                const res = await fetch(`/api/stock/quote?symbol=${encodeURIComponent(item.symbol)}`);
                if (res.ok) {
                  const q = await res.json();
                  return { symbol: item.symbol, quote: q };
                }
              } catch {
                // ignore
              }
              return null;
            });

            const fetchedQuotes = await Promise.all(quotePromises);
            const quoteMap: Record<string, StockQuote> = {};
            fetchedQuotes.forEach((fq) => {
              if (fq) quoteMap[fq.symbol] = fq.quote;
            });
            setQuotes(quoteMap);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const removeItem = async (id: string, symbol: string) => {
    try {
      await supabase.from('watchlist_items').delete().eq('id', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bookmark className="h-6 w-6 text-blue-400" />
              <span>我的自選觀察清單 (Watchlist)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              雲端同步於 Supabase ‧ 支援台股及美股標的即時損益追蹤
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !user ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <LogIn className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">請先登入系統</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              登入後即可建立您個人的專屬自選股清單，享受雲端同步與個人化到價提醒功能。
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition"
            >
              立即登入 / 註冊
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center space-y-3">
            <p className="text-sm text-slate-400">目前您的自選清單還是空的！</p>
            <p className="text-xs text-slate-500">
              前往市場首頁或搜尋任意股票（如 2330, NVDA），點擊「加入自選」即可在此即時追蹤。
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              <span>瀏覽熱門市場股票 →</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">市場</th>
                  <th className="px-4 py-3">代碼 / 名稱</th>
                  <th className="px-4 py-3 text-right">即時現價</th>
                  <th className="px-4 py-3 text-right">漲跌幅</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => {
                  const q = quotes[item.symbol];
                  const isUp = (q?.change || 0) >= 0;
                  const isTaiwan = item.market === 'TW';
                  const textClass = isTaiwan
                    ? isUp
                      ? 'text-red-400'
                      : 'text-emerald-400'
                    : isUp
                    ? 'text-emerald-400'
                    : 'text-red-400';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            item.market === 'TW'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}
                        >
                          {item.market === 'TW' ? '台股' : '美股'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/stock/${item.symbol}`}
                          className="font-bold text-white hover:text-blue-400 transition flex items-center gap-1.5"
                        >
                          <span>{item.symbol}</span>
                          <span className="text-xs text-slate-400 font-normal">{item.name}</span>
                          <ArrowUpRight className="h-3 w-3 text-slate-500" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                        {q ? `${q.price.toLocaleString()} ${q.currency}` : '載入中...'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {q ? (
                          <span className={`font-mono font-bold text-xs ${textClass}`}>
                            {isUp ? '+' : ''}
                            {q.changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.symbol)}
                          className="rounded p-1.5 text-slate-500 hover:bg-red-950/40 hover:text-red-400 transition"
                          title="移出自選"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
