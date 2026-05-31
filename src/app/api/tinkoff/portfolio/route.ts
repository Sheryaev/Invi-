import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio, getAccounts, getLastPrices, moneyToNumber } from '@/lib/tinkoff';

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }
  const token = auth.slice(7);

  try {
    const body = await req.json();
    const { accountId } = body;

    const data = await getPortfolio(token, accountId);
    const positions: any[] = data.positions || [];

    const totalValue = moneyToNumber(data.totalAmountPortfolio);
    const expectedYield = moneyToNumber(data.expectedYield);

    // Build holdings from positions
    const holdings = positions
      .filter((p: any) => p.figi)
      .map((p: any) => {
        const currentPrice = moneyToNumber(p.currentPrice);
        const averagePrice = moneyToNumber(p.averagePositionPrice);
        const qty = Number(p.quantity?.units || 0);
        const value = moneyToNumber(p.currentNkd) + currentPrice * qty;

        return {
          tkr: p.ticker || p.figi.slice(-6),
          name: p.name || p.figi,
          figi: p.figi,
          glyph: (p.ticker || p.figi).slice(0, 4),
          entry: averagePrice,
          price: currentPrice,
          qty,
          color: colorForType(p.instrumentType),
        };
      });

    // Fetch last prices for all positions
    const figis = positions.filter((p: any) => p.figi).map((p: any) => p.figi);
    let priceMap: Record<string, number> = {};
    if (figis.length > 0) {
      try {
        const priceData = await getLastPrices(token, figis);
        (priceData.lastPrices || []).forEach((lp: any) => {
          priceMap[lp.figi] = moneyToNumber(lp.price);
        });
      } catch {}
    }

    // Update current prices
    holdings.forEach(h => {
      if (priceMap[h.figi]) h.price = priceMap[h.figi];
    });

    const invested = totalValue - expectedYield;

    return NextResponse.json({
      totalValue,
      invested: invested > 0 ? invested : totalValue * 0.85,
      dayChange: 0,
      dayChangePct: 0,
      totalReturnPct: invested > 0 ? (expectedYield / invested) * 100 : 0,
      holdings,
      positions: positions.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function colorForType(type: string): string {
  switch (type) {
    case 'share': return '#21a038';
    case 'bond': return '#006FEE';
    case 'etf': return '#9353d3';
    case 'currency': return '#f5a524';
    default: return '#71717a';
  }
}
