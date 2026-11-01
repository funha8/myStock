'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  LayoutDashboard,
  Bookmark,
  Briefcase,
  User,
  LogOut,
} from 'lucide-react';
import StockSearch from './StockSearch';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch {
        setUser(null);
      }
    }
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: '市場首頁', icon: LayoutDashboard },
    { href: '/watchlist', label: '我的自選', icon: Bookmark },
    { href: '/portfolio', label: '投資記帳', icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                myStock
                <span className="rounded bg-blue-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  台股 / 美股
                </span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Stock Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <StockSearch />
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                <User className="h-3.5 w-3.5 text-blue-400" />
                <span className="max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg border border-red-900/30 bg-red-950/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">登出</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition"
            >
              <User className="h-3.5 w-3.5" />
              <span>會員登入</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="block sm:hidden px-4 pb-3">
        <StockSearch />
      </div>
    </header>
  );
}
