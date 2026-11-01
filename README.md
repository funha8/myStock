# myStock - 智慧股票分析系統 (台股 / 美股)

現代化全端股票分析與投資管理系統，基於 **Next.js (App Router) + Vercel + Supabase (PostgreSQL / Auth / RLS)** 打造，完整支援**台股 (TWSE/TPEx)** 與**美股 (US Market)** 雙市場即時報價與技術分析。

---

## ✨ 核心特色

1. **台美雙市場支援 (TW & US Markets)**：
   - 即時搜尋台股代碼（如 `2330`, `2454`, `0050`）或美股代碼（如 `NVDA`, `AAPL`, `TSLA`）。
   - 自動識別市場並採用對應的漲跌配色慣例（台股：紅漲綠跌；美股：綠漲紅跌），亦可一鍵切換。

2. **TradingView 官方 Lightweight Charts**：
   - 互動式專業 K 線圖（支援平移、縮放、日線走勢）。
   - 內建 MA20 月均線與成交量 (Volume) 疊圖。

3. **Supabase 雲端資料庫與列級安全 (RLS)**：
   - 內建會員登入 / 註冊系統（Supabase Auth）。
   - 個人專屬自選股清單 (Watchlist) 與目標價提醒。
   - 投資組合與買賣交易記帳 (Portfolio Tracker)，精準計算投資本金。

4. **GitHub + Vercel 極速自動化部署**：
   - Next.js App Router 搭配邊緣快取，毫秒級渲染。
   - `git push` 即自動完成 CI/CD 上線。

---

## 🚀 快速上手指南

### 步驟 1：建立 Supabase 資料庫
1. 前往 [Supabase 官網](https://supabase.com/) 登入並進入您的專案。
2. 點選左側選單的 **SQL Editor**。
3. 開啟專案根目錄下的 [`supabase/schema.sql`](supabase/schema.sql)，將內容完整複製並貼入 Supabase 執行。
4. 點選左側 **Project Settings** -> **API**，複製：
   - `Project URL`
   - `anon public` key

### 步驟 2：設定環境變數
在專案根目錄的 `.env.local` 填入您的 Supabase 資訊：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 步驟 3：本地啟動開發伺服器
```bash
npm run dev
```
開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000) 即可瀏覽系統！

---

## 🚢 部署至 GitHub & Vercel

### 1. 推送至 GitHub
在專案根目錄執行：
```bash
git add .
git commit -m "feat: initial release of myStock with TW & US market support"
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/myStock.git
git branch -M main
git push -u origin main
```

### 2. 在 Vercel 一鍵部署
1. 前往 [Vercel Dashboard](https://vercel.com/dashboard) 點擊 **Add New Project**。
2. 選擇剛才匯入的 `myStock` GitHub 儲存庫。
3. 在 **Environment Variables** 區塊填入：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 點擊 **Deploy**，約 1~2 分鐘後即可上線！
