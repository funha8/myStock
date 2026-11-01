'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import { CandleData, MarketType } from '@/lib/types';
import { BarChart3, LineChart as LineChartIcon, RefreshCw } from 'lucide-react';

interface StockChartProps {
  candles: CandleData[];
  symbol: string;
  market: MarketType;
}

export default function StockChart({ candles, symbol, market }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [timeRange, setTimeRange] = useState<'30' | '90' | '180' | '365'>('90');
  const [colorMode, setColorMode] = useState<'market' | 'western'>(
    market === 'TW' ? 'market' : 'western'
  );

  // 決定漲跌顏色（台股習慣：紅漲綠跌；美股習慣：綠漲紅跌）
  const isTaiwanStyle = colorMode === 'market' ? market === 'TW' : false;
  const upColor = isTaiwanStyle ? '#ef4444' : '#10b981'; // 紅色 vs 綠色
  const downColor = isTaiwanStyle ? '#10b981' : '#ef4444'; // 綠色 vs 紅色

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // 清理舊圖表
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 480,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.25)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.25)' },
      },
      crosshair: {
        vertLine: {
          color: '#64748b',
          width: 1,
          style: 1,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#64748b',
          width: 1,
          style: 1,
          labelBackgroundColor: '#1e293b',
        },
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
    });

    chartRef.current = chart;

    // 1. 新增 K 線主序列
    const mainSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });
    candlestickSeriesRef.current = mainSeries;

    // 格式化資料
    const sortedCandles = [...candles].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    mainSeries.setData(
      sortedCandles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // 2. 新增成交量 (Volume) 直方圖
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#38bdf8',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // 獨立縮放比例
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // 壓在底部 20%
        bottom: 0,
      },
    });

    volumeSeries.setData(
      sortedCandles.map((c) => ({
        time: c.time,
        value: c.volume,
        color:
          c.close >= c.open
            ? `${upColor}80` // 半透明
            : `${downColor}80`,
      }))
    );

    // 3. 計算 MA20 月線
    if (sortedCandles.length >= 20) {
      const ma20Data = [];
      for (let i = 19; i < sortedCandles.length; i++) {
        let sum = 0;
        for (let j = 0; j < 20; j++) {
          sum += sortedCandles[i - j].close;
        }
        ma20Data.push({
          time: sortedCandles[i].time,
          value: Number((sum / 20).toFixed(2)),
        });
      }

      const ma20Series = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 2,
        title: 'MA20',
      });
      ma20Series.setData(ma20Data);
    }

    chart.timeScale().fitContent();

    // RWD 自適應寬度
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, upColor, downColor, market]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-semibold text-slate-200">
            {symbol} 技術 K 線走勢 (TradingView)
          </h3>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            含 MA20 & 成交量
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 顏色習慣切換 (台股紅漲 / 美股綠漲) */}
          <button
            type="button"
            onClick={() =>
              setColorMode((prev) => (prev === 'market' ? 'western' : 'market'))
            }
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition"
            title="切換紅綠漲跌習慣"
          >
            <span>{isTaiwanStyle ? '台股配色(紅漲綠跌)' : '國際配色(綠漲紅跌)'}</span>
          </button>
        </div>
      </div>

      {/* 圖表渲染畫布 */}
      <div ref={chartContainerRef} className="w-full relative min-h-[480px] rounded-lg overflow-hidden" />

      {/* 圖例說明 */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: upColor }} />
            <span>上漲 (陽線)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: downColor }} />
            <span>下跌 (陰線)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-amber-500 rounded" />
            <span>MA20 月均線</span>
          </div>
        </div>
        <div>滑鼠滾輪可自由縮放、左右拖曳平移</div>
      </div>
    </div>
  );
}
