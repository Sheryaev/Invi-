import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio, getLastPrices, getInstrumentBy, getCandles, getOperations, moneyToNumber } from '@/lib/tinkoff';

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
    const figis = positions.filter((p: any) => p.figi).map((p: any) => p.figi as string);

    // Cost basis = sum of (avg_price × qty) — correct "invested" amount
    let costBasis = 0;
    positions.forEach((p: any) => {
      costBasis += moneyToNumber(p.averagePositionPrice) * Number(p.quantity?.units || 0);
    });
    const invested = costBasis > 0 ? costBasis : totalValue;
    const totalReturnPct = invested > 0 ? ((totalValue - invested) / invested) * 100 : 0;

    // Parallel: last prices + instrument info
    const [priceData, ...instrumentResults] = await Promise.all([
      figis.length > 0
        ? getLastPrices(token, figis).catch(() => ({ lastPrices: [] }))
        : Promise.resolve({ lastPrices: [] }),
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
      const logoName = inst.brand?.logoName || inst.brand?.logo_name;
      instrMap[figi] = {
        name: inst.name || figi,
        ticker: inst.ticker || figi.slice(-6),
        color: inst.brand?.logoBaseColor || inst.brand?.logo_base_color || colorForType(inst.instrumentType || ''),
        logoUrl: logoName ? `/api/logo?n=${encodeURIComponent(logoName)}` : undefined,
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

    // Day candles for day change + gainers/losers
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const candleResults = await Promise.allSettled(
      holdings.map(h => getCandles(token, h.figi, fiveDaysAgo.toISOString(), new Date().toISOString()))
    );

    let totalDayChange = 0;
    const movers: Array<{ tkr: string; name: string; price: number; pct: number; chg: number; color: string; logoUrl?: string }> = [];

    candleResults.forEach((result, i) => {
      if (result.status !== 'fulfilled') return;
      const candles = result.value?.candles || [];
      if (candles.length < 2) return;
      const prevClose = moneyToNumber(candles[candles.length - 2].close);
      const currPrice = holdings[i].price;
      if (prevClose <= 0) return;
      const dayPct = ((currPrice - prevClose) / prevClose) * 100;
      const dayAbs = holdings[i].qty * (currPrice - prevClose);
      totalDayChange += dayAbs;
      movers.push({
        tkr: holdings[i].tkr,
        name: holdings[i].name,
        price: currPrice,
        pct: parseFloat(dayPct.toFixed(2)),
        chg: parseFloat((currPrice - prevClose).toFixed(2)),
        color: holdings[i].color,
        logoUrl: holdings[i].logoUrl,
      });
    });

    const sorted = [...movers].sort((a, b) => b.pct - a.pct);
    const gainers = sorted.filter(m => m.pct > 0).slice(0, 5);
    const losers = [...movers].sort((a, b) => a.pct - b.pct).filter(m => m.pct < 0).slice(0, 5);

    // Deposits per year — fetch INPUT operations for the last 5 past years
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);
    const depositsByYear: Record<string, number> = {};

    await Promise.all(pastYears.map(async year => {
      try {
        const from = new Date(year, 0, 1).toISOString();
        const to   = new Date(year + 1, 0, 1).toISOString();
        const ops  = await getOperations(token, accountId, from, to);
        let total  = 0;
        for (const op of ops.operations || []) {
          if (op.operationType === 'OPERATION_TYPE_INPUT') {
            total += moneyToNumber(op.payment);
          }
        }
        if (total > 0) depositsByYear[String(year)] = Math.round(total);
      } catch { /* ignore per-year errors */ }
    }));

    return NextResponse.json({
      totalValue,
      invested,
      dayChange: Math.round(totalDayChange),
      dayChangePct: totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0,
      totalReturnPct,
      holdings,
      gainers,
      losers,
      depositsByYear,
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
  return '#71717a';
}
