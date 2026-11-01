import { MarketType } from './types';

// 常見台美股熱門股票對照表（加速搜尋與中文化名稱）
export const POPULAR_STOCKS: { symbol: string; name: string; market: MarketType }[] = [
  // 台股指標
  { symbol: '2330.TW', name: '台積電', market: 'TW' },
  { symbol: '2454.TW', name: '聯發科', market: 'TW' },
  { symbol: '2317.TW', name: '鴻海', market: 'TW' },
  { symbol: '2382.TW', name: '廣達', market: 'TW' },
  { symbol: '2308.TW', name: '台達電', market: 'TW' },
  { symbol: '0050.TW', name: '元大台灣50', market: 'TW' },
  { symbol: '0056.TW', name: '元大高股息', market: 'TW' },
  { symbol: '00878.TW', name: '國泰永續高股息', market: 'TW' },
  { symbol: '00919.TW', name: '群益台灣精選高息', market: 'TW' },
  { symbol: '2603.TW', name: '長榮', market: 'TW' },
  { symbol: '2881.TW', name: '富邦金', market: 'TW' },
  { symbol: '2882.TW', name: '國泰金', market: 'TW' },

  // 美股指標
  { symbol: 'NVDA', name: '輝達 (NVIDIA)', market: 'US' },
  { symbol: 'AAPL', name: '蘋果 (Apple)', market: 'US' },
  { symbol: 'MSFT', name: '微軟 (Microsoft)', market: 'US' },
  { symbol: 'GOOGL', name: 'Alphabet (Google)', market: 'US' },
  { symbol: 'AMZN', name: '亞馬遜 (Amazon)', market: 'US' },
  { symbol: 'TSLA', name: '特斯拉 (Tesla)', market: 'US' },
  { symbol: 'META', name: 'Meta (Facebook)', market: 'US' },
  { symbol: 'AMD', name: '超微半導體 (AMD)', market: 'US' },
  { symbol: 'SPY', name: 'SPDR 標普500 ETF', market: 'US' },
  { symbol: 'QQQ', name: 'Invesco 那斯達克100 ETF', market: 'US' },
  { symbol: 'TSM', name: '台積電 ADR', market: 'US' },
];
