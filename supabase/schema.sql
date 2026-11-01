-- ========================================================
-- myStock 股票分析系統 - Supabase PostgreSQL 資料庫結構腳本
-- 請在 Supabase 專案後台的 SQL Editor 中執行此腳本
-- ========================================================

-- 1. 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 使用者公開資料表 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  default_market TEXT DEFAULT 'ALL', -- 'TW', 'US', or 'ALL'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 自動於註冊時建立 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. 自選股清單群組表 (watchlists)
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '預設自選',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 自選股明細項目 (watchlist_items)
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- e.g. "2330.TW", "NVDA"
  name TEXT NOT NULL,   -- e.g. "台積電", "NVIDIA Corp"
  market TEXT NOT NULL, -- 'TW' or 'US'
  target_buy_price NUMERIC(12, 2),
  target_sell_price NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(watchlist_id, symbol)
);

-- 5. 個人投資組合帳戶 (portfolios)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '核心投資組合',
  currency TEXT NOT NULL DEFAULT 'TWD', -- 'TWD' or 'USD'
  initial_cash NUMERIC(14, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 投資組合買賣交易明細 (portfolio_transactions)
CREATE TABLE IF NOT EXISTS public.portfolio_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  market TEXT NOT NULL, -- 'TW' or 'US'
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
  shares NUMERIC(12, 4) NOT NULL,
  price NUMERIC(12, 4) NOT NULL,
  fee NUMERIC(10, 2) DEFAULT 0,
  tax NUMERIC(10, 2) DEFAULT 0,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. 個股個人專屬筆記 (stock_notes)
CREATE TABLE IF NOT EXISTS public.stock_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- 8. 啟用 Row Level Security (RLS) 保護使用者私密持股數據
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_notes ENABLE ROW LEVEL SECURITY;

-- profiles 策略
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- watchlists 策略
CREATE POLICY "Users can CRUD own watchlists" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id);

-- watchlist_items 策略
CREATE POLICY "Users can CRUD own watchlist items" ON public.watchlist_items
  FOR ALL USING (auth.uid() = user_id);

-- portfolios 策略
CREATE POLICY "Users can CRUD own portfolios" ON public.portfolios
  FOR ALL USING (auth.uid() = user_id);

-- portfolio_transactions 策略
CREATE POLICY "Users can CRUD own transactions" ON public.portfolio_transactions
  FOR ALL USING (auth.uid() = user_id);

-- stock_notes 策略
CREATE POLICY "Users can CRUD own stock notes" ON public.stock_notes
  FOR ALL USING (auth.uid() = user_id);
