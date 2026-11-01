import { NextRequest, NextResponse } from 'next/server';
import { POPULAR_STOCKS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) {
    return NextResponse.json(POPULAR_STOCKS.slice(0, 10));
  }

  // 先在熱門股票清單中過濾
  const filtered = POPULAR_STOCKS.filter((stock) => {
    return (
      stock.symbol.toLowerCase().includes(q) ||
      stock.name.toLowerCase().includes(q)
    );
  });

  return NextResponse.json(filtered);
}
