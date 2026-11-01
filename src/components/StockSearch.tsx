'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, X } from 'lucide-react';
import { POPULAR_STOCKS } from '@/lib/constants';

export default function StockSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 關閉下拉選單（點擊外部時）
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? POPULAR_STOCKS.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_STOCKS.slice(0, 8);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/stock/${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      setIsOpen(false);
      router.push(`/stock/${query.trim().toUpperCase()}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="搜尋股票代碼或名稱 (例: 2330, 台積電, NVDA, AAPL)..."
          className="w-full rounded-full border border-slate-700 bg-slate-900/90 py-2 pl-10 pr-9 text-sm text-slate-100 placeholder-slate-500 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-md">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            <span>{query ? '搜尋結果' : '熱門標的推薦'}</span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {filtered.length > 0 ? (
              filtered.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelect(stock.symbol)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-800/80 transition"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        stock.market === 'TW'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {stock.market === 'TW' ? '台股' : '美股'}
                    </span>
                    <span className="font-semibold text-slate-200">{stock.symbol}</span>
                    <span className="text-xs text-slate-400">{stock.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-blue-400">
                    查看分析 →
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                按 Enter 直接前往代碼：
                <span className="font-bold text-blue-400 ml-1">{query.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
