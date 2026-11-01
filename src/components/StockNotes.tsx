'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface StockNotesProps {
  symbol: string;
}

export default function StockNotes({ symbol }: StockNotesProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadNote() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data } = await supabase
          .from('stock_notes')
          .select('content')
          .eq('user_id', session.user.id)
          .eq('symbol', symbol)
          .maybeSingle();

        if (data?.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Failed to load note:', err);
      }
    }

    loadNote();
  }, [symbol, supabase]);

  const handleSave = async () => {
    setLoading(true);
    setSavedStatus(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        alert('請先登入系統即可將個股策略筆記同步至雲端！');
        window.location.href = '/login';
        return;
      }

      // 檢查是否已存在筆記
      const { data: existing } = await supabase
        .from('stock_notes')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('symbol', symbol)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('stock_notes')
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('stock_notes').insert({
          user_id: session.user.id,
          symbol,
          content,
        });
      }

      setSavedStatus('已成功儲存至 Supabase 雲端！');
      setTimeout(() => setSavedStatus(null), 3000);
    } catch (err: any) {
      console.error('Failed to save note:', err);
      setSavedStatus('儲存失敗，請確認資料庫設定');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-amber-400" />
          <h2 className="font-semibold text-white">我的投資策略筆記</h2>
        </div>
        {savedStatus && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{savedStatus}</span>
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        記錄針對 <strong>{symbol}</strong> 的進場邏輯、停損停利目標或法說會觀察（儲存於 Supabase 加密資料庫）。
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="例如：預計跌破月線 5% 停損，目標價設定在歷史新高..."
        rows={4}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5" />
        )}
        <span>{loading ? '儲存中...' : '儲存策略筆記至雲端'}</span>
      </button>
    </div>
  );
}
