'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { PortfolioTransaction } from '@/lib/types';
import { Briefcase, Plus, TrendingUp, TrendingDown, Trash2, Loader2, LogIn, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // 新增交易表單 state
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [market, setMarket] = useState<'TW' | 'US'>('TW');
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('20');
  const [submitting, setSubmitting] = useState(false);

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

        const { data, error } = await supabase
          .from('portfolio_transactions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('transaction_date', { ascending: false });

        if (!error && data) {
          setTransactions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      // 確保有預設的 portfolio
      let { data: defaultPortfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!defaultPortfolio) {
        const { data: newPf } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            name: '我的主要投資組合',
          })
          .select('id')
          .single();
        defaultPortfolio = newPf;
      }

      if (defaultPortfolio) {
        const newRecord = {
          portfolio_id: defaultPortfolio.id,
          user_id: user.id,
          symbol: symbol.toUpperCase(),
          name: name || symbol.toUpperCase(),
          market,
          action,
          shares: parseFloat(shares),
          price: parseFloat(price),
          fee: parseFloat(fee) || 0,
          tax: 0,
          transaction_date: new Date().toISOString().split('T')[0],
        };

        const { data, error } = await supabase
          .from('portfolio_transactions')
          .insert(newRecord)
          .select('*')
          .single();

        if (!error && data) {
          setTransactions((prev) => [data, ...prev]);
          setShowAddModal(false);
          setSymbol('');
          setName('');
          setShares('');
          setPrice('');
        }
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('portfolio_transactions').delete().eq('id', id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 簡易計算總投資本金 (Buy 總額)
  const totalCost = transactions
    .filter((t) => t.action === 'BUY')
    .reduce((acc, t) => acc + t.shares * t.price + (t.fee || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-indigo-400" />
              <span>投資組合與持股記帳 (Portfolio)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              精準記錄每筆買進與賣出交易 ‧ 整合雲端 PostgreSQL 自動保存
            </p>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-blue-500 transition"
            >
              <Plus className="h-4 w-4" />
              <span>新增買賣紀錄</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !user ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <LogIn className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">請先登入系統</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              登入即可開啟個人專屬股票記帳簿，隨時隨地記錄買賣紀錄並計算損益回報。
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition"
            >
              立即登入 / 註冊
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 總覽卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400">總計買入投入本金</span>
                <p className="mt-2 text-2xl font-bold font-mono text-white">
                  ${Math.round(totalCost).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400">歷史交易總筆數</span>
                <p className="mt-2 text-2xl font-bold font-mono text-slate-200">
                  {transactions.length} 筆
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-xs text-slate-400">雲端狀態</span>
                <p className="mt-2 text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase RLS 加密已連線
                </p>
              </div>
            </div>

            {/* 交易清單 */}
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center space-y-3">
                <p className="text-sm text-slate-400">尚無任何交易紀錄</p>
                <p className="text-xs text-slate-500">
                  點擊右上角「新增買賣紀錄」，開始記錄您的第一檔股票吧！
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3">日期</th>
                      <th className="px-4 py-3">動作</th>
                      <th className="px-4 py-3">標的代碼</th>
                      <th className="px-4 py-3 text-right">股數</th>
                      <th className="px-4 py-3 text-right">單價</th>
                      <th className="px-4 py-3 text-right">手續費</th>
                      <th className="px-4 py-3 text-right">總金額</th>
                      <th className="px-4 py-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {transactions.map((t) => {
                      const totalAmount = t.shares * t.price + (t.fee || 0);
                      return (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {t.transaction_date}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-bold ${
                                t.action === 'BUY'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {t.action === 'BUY' ? '買入' : '賣出'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-white font-sans">
                            <Link href={`/stock/${t.symbol}`} className="hover:text-blue-400">
                              {t.symbol}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-200">
                            {t.shares.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-200">
                            ${t.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500">
                            ${t.fee || 0}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-white">
                            ${Math.round(totalAmount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(t.id)}
                              className="rounded p-1 text-slate-500 hover:text-red-400"
                              title="刪除"
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
          </div>
        )}

        {/* 新增交易彈窗 Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">新增買賣交易紀錄</h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    市場類型
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMarket('TW')}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${
                        market === 'TW'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      台股 (TW)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarket('US')}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold ${
                        market === 'US'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      美股 (US)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      交易動作
                    </label>
                    <select
                      value={action}
                      onChange={(e: any) => setAction(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                    >
                      <option value="BUY">買進 (BUY)</option>
                      <option value="SELL">賣出 (SELL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      股票代碼
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例: 2330, NVDA"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      成交股數
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      placeholder="例: 1000"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      成交單價
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      placeholder="例: 1050"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    手續費 (可預設)
                  </label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-lg border border-slate-700 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {submitting ? '儲存中...' : '確認新增'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
