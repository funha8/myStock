export type MarketType = 'TW' | 'US';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: MarketType;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  currency: string;
  peRatio?: number | null;
  dividendYield?: number | null;
  marketCap?: number | null;
  week52High?: number | null;
  week52Low?: number | null;
  updatedAt: string;
}

export interface CandleData {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: MarketType;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  user_id: string;
  symbol: string;
  name: string;
  market: MarketType;
  target_buy_price?: number | null;
  target_sell_price?: number | null;
  notes?: string | null;
  created_at: string;
  // Runtime quote data
  quote?: StockQuote;
}

export interface PortfolioTransaction {
  id: string;
  portfolio_id: string;
  user_id: string;
  symbol: string;
  name: string;
  market: MarketType;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  fee: number;
  tax: number;
  transaction_date: string;
  notes?: string | null;
  created_at: string;
}

export interface StockNote {
  id: string;
  user_id: string;
  symbol: string;
  title?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}
