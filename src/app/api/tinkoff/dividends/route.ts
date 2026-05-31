import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio, getOperations, getDividends, moneyToNumber } from '@/lib/tinkoff';
import { forecastDividends } from '@/lib/dividends';

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const PAID_OP_TYPES = new Set([
  'OPERATION_TYPE_DIVIDEND',
  'OPERATION_TYPE_COUPON',
  'OPERATION_TYPE_DIV_EXT',
  'OPERATION_TYPE_BOND_REPAYMENT',
  'OPERATION_TYPE_DIVIDEND_TRANSFER',
]);

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }
  const token = auth.slice(7);

  try {
    const { accountId } = await req.json();

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      m: MONTH_NAMES[i],
      paid: 0,
      announced: 0,
      forecast: 0,
    }));

    // 1. Paid dividends/coupons from operations this year
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const now = new Date().toISOString();

    try {
      const opsData = await getOperations(token, accountId, yearStart, now);
      for (const op of (opsData.operations || [])) {
        if (!PAID_OP_TYPES.has(op.operationType)) continue;
        const amount = moneyToNumber(op.payment);
        if (amount <= 0) continue;
        const month = new Date(op.date).getMonth();
        if (month >= 0 && month < 12) {
          monthlyData[month].paid += amount;
        }
      }
    } catch {}

    // 2. Forecast future dividends from historical data
    const portfolioData = await getPortfolio(token, accountId);
    const positions: any[] = portfolioData.positions || [];
    const equityPositions = positions.filter(
      (p: any) => p.figi && isEquity(p.instrumentType)
    );

    await Promise.all(
      equityPositions.map(async (pos) => {
        try {
          const divData = await getDividends(token, pos.figi);
          const history = divData.dividends || [];
          const qty = Math.abs(moneyToNumber({ units: pos.quantity?.units || '0', nano: pos.quantity?.nano || 0 }));
          if (history.length === 0 || qty === 0) return;
          const forecasted = forecastDividends(history, qty);
          for (const f of forecasted) {
            if (f.month >= 0 && f.month < 12) {
              monthlyData[f.month].forecast += f.amount;
            }
          }
        } catch {}
      })
    );

    return NextResponse.json({ months: monthlyData, positions: equityPositions.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function isEquity(type: string): boolean {
  const t = String(type || '').toLowerCase();
  return t === 'share' || t === 'bond' || t.includes('share') || t.includes('bond');
}
