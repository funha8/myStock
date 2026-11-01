'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MarketType } from '@/lib/types';

interface WatchlistButtonProps {
  symbol: string;
  name: string;
  market: MarketType;
}

export default function WatchlistButton({ symbol, name, market }: WatchlistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkSaved() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('watchlist_items')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('symbol', symbol)
        .maybeSingle();

      if (data) {
        setIsSaved(true);
      }
    }
    checkSaved();
  }, [symbol, supabase]);

  const toggleWatchlist = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      alert('請先登入系統即可將個股加入個人自選清單！');
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        // 移除自選
        await supabase
          .from('watchlist_items')
          .delete()
          .eq('user_id', session.user.id)
          .eq('symbol', symbol);
        setIsSaved(false);
      } else {
        // 先取得或建立使用者的預設自選清單 (watchlist)
        let { data: defaultList } = await supabase
          .from('watchlists')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_default', true)
          .maybeSingle();

        if (!defaultList) {
          const { data: newList } = await supabase
            .from('watchlists')
            .insert({
              user_id: session.user.id,
              name: '我的自選股',
              is_default: true,
            })
            .select('id')
            .single();
          defaultList = newList;
        }

        if (defaultList) {
          await supabase.from('watchlist_items').insert({
            watchlist_id: defaultList.id,
            user_id: session.user.id,
            symbol,
            name,
            market,
          });
          setIsSaved(true);
        }
      }
    } catch (err: any) {
      console.error('Watchlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleWatchlist}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        isSaved
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
      ) : (
        <Bookmark className="h-3.5 w-3.5" />
      )}
      <span>{isSaved ? '已在自選' : '加入自選'}</span>
    </button>
  );
}
