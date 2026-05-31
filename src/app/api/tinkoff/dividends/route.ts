import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio, getOperations, getDividends, getBondCoupons, getInstrumentBy, moneyToNumber } from '@/lib/tinkoff';
import { forecastDividends } from '@/lib/dividends';

const MONTH_NAMES = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const PAID_OP_TYPES = new Set([
  'OPERATION_TYPE_DIVIDEND',
  'OPERATION_TYPE_COUPON',
  'OPERATION_TYPE_DIV_EXT',
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

    // 1. Paid this year from operations
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const now = new Date().toISOString();
    try {
      const opsData = await getOperations(token, accountId, yearStart, now);
      for (const op of (opsData.operations || [])) {
        if (!PAID_OP_TYPES.has(op.operationType)) continue;
        const amount = moneyToNumber(op.payment);
        if (amount <= 0) continue;
        const month = new Date(op.date).getMonth();
        if (month >= 0 && month < 12) monthlyData[month].paid += amount;
      }
    } catch {}

    // 2. Portfolio positions
    const portfolioData = await getPortfolio(token, accountId);
    const positions: any[] = portfolioData.positions || [];
    const shares = positions.filter((p: any) => p.figi && isShare(p.instrumentType));
    const bonds = positions.filter((p: any) => p.figi && isBond(p.instrumentType));

    // Upcoming payments (announced + confirmed future)
    type PendingPayment = { day: number; mon: string; figi: string; type: string; amt: number; kind: 'div' | 'cpn' };
    const pending: PendingPayment[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // 3. Share dividends: announced + forecast
    await Promise.all(shares.map(async (pos) => {
      try {
        const divData = await getDividends(token, pos.figi);
        const history = divData.dividends || [];
        const qty = Math.abs(moneyToNumber({ units: pos.quantity?.units || '0', nano: pos.quantity?.nano || 0 }));
        if (qty === 0) return;

        const announcedMonths = new Set<number>();

        for (const d of history) {
          if (!d.paymentDate || !d.dividendNet) continue;
          const payDate = new Date(d.paymentDate);
          const amount = moneyToNumber(d.dividendNet) * qty;
          if (amount <= 0) continue;

          if (payDate >= today && payDate.getFullYear() === currentYear) {
            const month = payDate.getMonth();
            monthlyData[month].announced += amount;
            announcedMonths.add(month);
            pending.push({ day: payDate.getDate(), mon: MONTH_NAMES[month], figi: pos.figi, type: 'Дивиденды', amt: Math.round(amount), kind: 'div' });
          }
        }

        if (history.length > 0) {
          const forecasted = forecastDividends(history, qty);
          for (const f of forecasted) {
            if (!announcedMonths.has(f.month) && f.month >= 0 && f.month < 12) {
              monthlyData[f.month].forecast += f.amount;
            }
          }
        }
      } catch {}
    }));

    // 4. Bond coupons: announced
    await Promise.all(bonds.map(async (pos) => {
      try {
        const couponData = await getBondCoupons(token, pos.figi);
        const coupons = couponData.events || [];
        const qty = Math.abs(moneyToNumber({ units: pos.quantity?.units || '0', nano: pos.quantity?.nano || 0 }));
        if (qty === 0) return;

        for (const c of coupons) {
          if (!c.couponDate || !c.payOneBond) continue;
          const payDate = new Date(c.couponDate);
          if (payDate < today || payDate.getFullYear() !== currentYear) continue;
          const amount = moneyToNumber(c.payOneBond) * qty;
          if (amount <= 0) continue;
          const month = payDate.getMonth();
          monthlyData[month].announced += amount;
          pending.push({ day: payDate.getDate(), mon: MONTH_NAMES[month], figi: pos.figi, type: 'Купон', amt: Math.round(amount), kind: 'cpn' });
        }
      } catch {}
    }));

    // 5. Fetch instrument names for upcoming payments
    const uniqueFigis = [...new Set(pending.map(u => u.figi))];
    const nameMap: Record<string, string> = {};
    await Promise.all(uniqueFigis.map(async figi => {
      try {
        const d = await getInstrumentBy(token, figi);
        nameMap[figi] = d.instrument?.name || figi;
      } catch {}
    }));

    const upcoming = pending
      .map(u => ({ day: u.day, mon: u.mon, name: nameMap[u.figi] || u.figi, type: u.type, amt: u.amt, kind: u.kind }))
      .sort((a, b) => {
        const mi = MONTH_NAMES.indexOf(a.mon) - MONTH_NAMES.indexOf(b.mon);
        return mi !== 0 ? mi : a.day - b.day;
      });

    return NextResponse.json({ months: monthlyData, positions: positions.length, upcoming });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function isShare(t: string) { const s = String(t || '').toLowerCase(); return s === 'share' || s.includes('share'); }
function isBond(t: string) { const s = String(t || '').toLowerCase(); return s === 'bond' || s.includes('bond'); }
