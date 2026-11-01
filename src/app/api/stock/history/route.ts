import { NextRequest, NextResponse } from 'next/server';
import { getStockHistory } from '@/lib/stock-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const days = parseInt(searchParams.get('days') || '90', 10);

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }

  try {
    const candles = await getStockHistory(symbol, isNaN(days) ? 90 : days);
    return NextResponse.json(candles);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
