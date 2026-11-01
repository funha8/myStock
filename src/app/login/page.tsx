'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          text: '註冊驗證信已寄出，或若未開啟驗證請直接登入！',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/watchlist');
        router.refresh();
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || '認證失敗，請檢查帳號密碼或 Supabase 連線設定',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>返回市場首頁</span>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isSignUp ? '建立 myStock 會員帳戶' : '登入 myStock 股票分析系統'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp
              ? '享受個人化台美雙市場自選股追蹤與資產帳本'
              : '透過 Supabase 雲端安全登入您的個人投資平台'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
          {message && (
            <div
              className={`mb-4 rounded-lg p-3 text-xs ${
                message.type === 'error'
                  ? 'border border-red-900/50 bg-red-950/40 text-red-300'
                  : 'border border-emerald-900/50 bg-emerald-950/40 text-emerald-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                電子郵件 (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                登入密碼 (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isSignUp ? '立即註冊' : '登入系統'}</span>
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            {isSignUp ? (
              <p>
                已經有帳號了？{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-semibold text-blue-400 hover:text-blue-300 underline"
                >
                  前往登入
                </button>
              </p>
            ) : (
              <p>
                還沒有帳號？{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-semibold text-blue-400 hover:text-blue-300 underline"
                >
                  免費註冊新會員
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          💡 本系統採用 Supabase Auth 與 Row-Level Security 進行用戶隱私隔離保護
        </div>
      </div>
    </div>
  );
}
