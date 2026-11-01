import React from 'react';
import { MarketIndex } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketIndicesProps {
  indices: MarketIndex[];
}

export default function MarketIndices({ indices }: MarketIndicesProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {indices.map((idx) => {
        const isUp = idx.change >= 0;
        // 台股指數習慣以紅漲綠跌顯示，美股指數習慣以綠漲紅跌顯示
        const isTaiwan = idx.market === 'TW';
        const colorClass = isTaiwan
          ? isUp
            ? 'text-red-400 bg-red-950/20 border-red-900/30'
            : 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
          : isUp
          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
          : 'text-red-400 bg-red-950/20 border-red-900/30';

        const textClass = isTaiwan
          ? isUp
            ? 'text-red-400'
            : 'text-emerald-400'
          : isUp
          ? 'text-emerald-400'
          : 'text-red-400';

        return (
          <div
            key={idx.symbol}
            className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 shadow-sm backdrop-blur transition hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 truncate">
                {idx.name}
              </span>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                  idx.market === 'TW'
                    ? 'bg-emerald-900/40 text-emerald-300'
                    : 'bg-blue-900/40 text-blue-300'
                }`}
              >
                {idx.market}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-bold tracking-tight text-white">
                {idx.price.toLocaleString()}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={`flex items-center gap-0.5 font-medium ${textClass}`}>
                {isUp ? (
                  <TrendingUp className="h-3 w-3 inline" />
                ) : (
                  <TrendingDown className="h-3 w-3 inline" />
                )}
                {isUp ? '+' : ''}
                {idx.change.toFixed(2)}
              </span>
              <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${colorClass}`}>
                {isUp ? '+' : ''}
                {idx.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
