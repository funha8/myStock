import { NextRequest, NextResponse } from 'next/server';
import { getStockQuote } from '@/lib/stock-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }

  try {
    const quote = await getStockQuote(symbol);
    return NextResponse.json(quote);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
