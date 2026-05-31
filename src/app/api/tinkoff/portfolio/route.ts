import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio, getLastPrices, getInstrumentBy, getCandles, moneyToNumber } from '@/lib/tinkoff';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }
  const token = auth.slice(7);

  try {
    const { accountId } = await req.json();

    const data = await getPortfolio(token, accountId);
    const positions: any[] = data.positions || [];

    const totalValue = moneyToNumber(data.totalAmountPortfolio);
    const expectedYield = moneyToNumber(data.expectedYield);

    const figis = positions.filter((p: any) => p.figi).map((p: any) => p.figi as string);

    // Fetch last prices, instrument info, and candles for day change — all in parallel
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 5);
    const fromDate = threeDaysAgo.toISOString();
    const toDate = new Date().toISOString();

    const [priceData, ...instrumentResults] = await Promise.all([
      figis.length > 0 ? getLastPrices(token, figis).catch(() => ({ lastPrices: [] })) : Promise.resolve({ lastPrices: [] }),
      ...figis.map(figi => getInstrumentBy(token, figi).catch(() => null)),
    ]);

    const priceMap: Record<string, number> = {};
    (priceData.lastPrices || []).forEach((lp: any) => {
      priceMap[lp.figi] = moneyToNumber(lp.price);
    });

    const instrMap: Record<string, { name: string; ticker: string; color: string; logoUrl?: string }> = {};
    figis.forEach((figi, i) => {
      const inst = instrumentResults[i]?.instrument;
      if (!inst) return;
      const logoName = inst.brand?.logoName;
      instrMap[figi] = {
        name: inst.name || figi,
        ticker: inst.ticker || figi.slice(-6),
        color: inst.brand?.logoBaseColor || colorForType(inst.instrumentType || ''),
        logoUrl: logoName ? `https://invest-brands.cdn-tinkoff.ru/${logoName}x160.png` : undefined,
      };
    });

    // Build holdings
    const holdings = positions
      .filter((p: any) => p.figi)
      .map((p: any) => {
        const info = instrMap[p.figi] || {};
        const currentPrice = priceMap[p.figi] || moneyToNumber(p.currentPrice);
        const averagePrice = moneyToNumber(p.averagePositionPrice);
        const qty = Number(p.quantity?.units || 0);

        return {
          tkr: info.ticker || p.ticker || p.figi.slice(-6),
          name: info.name || p.figi,
          figi: p.figi as string,
          glyph: (info.ticker || p.ticker || p.figi).slice(0, 4),
          entry: averagePrice,
          price: currentPrice,
          qty,
          color: info.color || colorForType(p.instrumentType),
          logoUrl: info.logoUrl,
        };
      });

    // Calculate day change from daily candles (parallel)
    let dayChange = 0;
    const candleResults = await Promise.allSettled(
      holdings.map(h =>
        getCandles(token, h.figi, fromDate, toDate).catch(() => null)
      )
    );
    candleResults.forEach((result, i) => {
      if (result.status !== 'fulfilled' || !result.value) return;
      const candles = result.value.candles || [];
      if (candles.length < 2) return;
      const prevClose = moneyToNumber(candles[candles.length - 2].close);
      const currPrice = holdings[i].price;
      dayChange += holdings[i].qty * (currPrice - prevClose);
    });

    const invested = totalValue - expectedYield;
    const investedSafe = invested > 0 ? invested : totalValue * 0.85;

    return NextResponse.json({
      totalValue,
      invested: investedSafe,
      dayChange: Math.round(dayChange),
      dayChangePct: totalValue > 0 ? (dayChange / totalValue) * 100 : 0,
      totalReturnPct: investedSafe > 0 ? (expectedYield / investedSafe) * 100 : 0,
      holdings,
      positions: positions.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function colorForType(type: string): string {
  const t = String(type).toLowerCase();
  if (t.includes('share')) return '#21a038';
  if (t.includes('bond')) return '#006FEE';
  if (t.includes('etf')) return '#9353d3';
  if (t.includes('currency')) return '#f5a524';
  switch (t) {
    case 'share': return '#21a038';
    case 'bond': return '#006FEE';
    case 'etf': return '#9353d3';
    case 'currency': return '#f5a524';
    default: return '#71717a';
  }
}
