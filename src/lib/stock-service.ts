import YahooFinance from 'yahoo-finance2';
import { StockQuote, CandleData, MarketIndex, MarketType } from './types';
import { POPULAR_STOCKS } from './constants';

// 初始化 YahooFinance client
const yf = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
});

export { POPULAR_STOCKS };

/**
 * 自動標準化股票代碼
 * 例如輸入 "2330" -> 自動轉為 "2330.TW"
 */
export function normalizeSymbol(raw: string): { symbol: string; market: MarketType } {
  const clean = raw.trim().toUpperCase();
  if (/^\d{4,6}$/.test(clean)) {
    return { symbol: `${clean}.TW`, market: 'TW' };
  }
  if (clean.endsWith('.TW') || clean.endsWith('.TWO')) {
    return { symbol: clean, market: 'TW' };
  }
  return { symbol: clean, market: 'US' };
}

/**
 * 取得個股即時報價
 */
export async function getStockQuote(rawSymbol: string): Promise<StockQuote> {
  const { symbol, market } = normalizeSymbol(rawSymbol);

  try {
    const q: any = await yf.quote(symbol);
    const matched = POPULAR_STOCKS.find((s) => s.symbol === symbol);

    return {
      symbol,
      name: matched?.name || q.shortName || q.longName || symbol,
      price: q.regularMarketPrice || 0,
      change: q.regularMarketChange || 0,
      changePercent: q.regularMarketChangePercent || 0,
      market,
      volume: q.regularMarketVolume || 0,
      high: q.regularMarketDayHigh || q.regularMarketPrice || 0,
      low: q.regularMarketDayLow || q.regularMarketPrice || 0,
      open: q.regularMarketOpen || q.regularMarketPrice || 0,
      previousClose: q.regularMarketPreviousClose || q.regularMarketPrice || 0,
      currency: q.currency || (market === 'TW' ? 'TWD' : 'USD'),
      peRatio: q.trailingPE || null,
      dividendYield: q.dividendYield ? q.dividendYield * 100 : null,
      marketCap: q.marketCap || null,
      week52High: q.fiftyTwoWeekHigh || null,
      week52Low: q.fiftyTwoWeekLow || null,
      updatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error(`Error fetching quote for ${symbol}:`, err.message);
    // 備援預設資料
    const matched = POPULAR_STOCKS.find((s) => s.symbol === symbol);
    return {
      symbol,
      name: matched?.name || symbol,
      price: market === 'TW' ? 100 : 150,
      change: 0,
      changePercent: 0,
      market,
      volume: 1000000,
      high: market === 'TW' ? 102 : 152,
      low: market === 'TW' ? 99 : 148,
      open: market === 'TW' ? 100 : 150,
      previousClose: market === 'TW' ? 100 : 150,
      currency: market === 'TW' ? 'TWD' : 'USD',
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * 取得歷史 K 線資料 (Candlestick Data)
 */
export async function getStockHistory(
  rawSymbol: string,
  days: number = 90
): Promise<CandleData[]> {
  const { symbol } = normalizeSymbol(rawSymbol);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const res: any = await yf.chart(symbol, {
      period1: startDate,
      interval: '1d',
    });

    if (!res?.quotes || res.quotes.length === 0) {
      return generateFallbackCandles(days);
    }

    const candles: CandleData[] = res.quotes
      .filter((q: any) => q.open && q.close && q.high && q.low && q.date)
      .map((q: any) => {
        const d = new Date(q.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return {
          time: `${yyyy}-${mm}-${dd}`,
          open: Number(q.open.toFixed(2)),
          high: Number(q.high.toFixed(2)),
          low: Number(q.low.toFixed(2)),
          close: Number(q.close.toFixed(2)),
          volume: q.volume || 0,
        };
      });

    return candles;
  } catch (err: any) {
    console.error(`Error fetching history for ${symbol}:`, err.message);
    return generateFallbackCandles(days);
  }
}

/**
 * 取得大盤指數報價
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  const indexConfigs = [
    { symbol: '^TWII', name: '加權指數 (台股)', market: 'TW' as MarketType },
    { symbol: '^TWOII', name: '櫃買指數 (OTC)', market: 'TW' as MarketType },
    { symbol: '^GSPC', name: '標普 500 (S&P 500)', market: 'US' as MarketType },
    { symbol: '^IXIC', name: '那斯達克 (Nasdaq)', market: 'US' as MarketType },
    { symbol: '^DJI', name: '道瓊工業 (Dow Jones)', market: 'US' as MarketType },
  ];

  const results: MarketIndex[] = [];

  for (const item of indexConfigs) {
    try {
      const q: any = await yf.quote(item.symbol);
      results.push({
        symbol: item.symbol,
        name: item.name,
        price: Number((q.regularMarketPrice || 0).toFixed(2)),
        change: Number((q.regularMarketChange || 0).toFixed(2)),
        changePercent: Number((q.regularMarketChangePercent || 0).toFixed(2)),
        market: item.market,
      });
    } catch {
      results.push({
        symbol: item.symbol,
        name: item.name,
        price: 20000,
        change: 0,
        changePercent: 0,
        market: item.market,
      });
    }
  }

  return results;
}

/**
 * 產生備援 K 線資料（當網路中斷或 API 逾時時防止前端空白崩潰）
 */
function generateFallbackCandles(days: number): CandleData[] {
  const data: CandleData[] = [];
  let basePrice = 500;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // 跳過週末
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * 15;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * 8;
    const low = Math.min(open, close) - Math.random() * 8;
    basePrice = close;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    data.push({
      time: `${yyyy}-${mm}-${dd}`,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000 + 1000000),
    });
  }

  return data;
}
