import { NextRequest, NextResponse } from 'next/server';
import { getDividends, getPortfolio, getAccounts, getLastPrices, moneyToNumber } from '@/lib/tinkoff';
import { forecastDividends } from '@/lib/dividends';

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

    // Get portfolio positions
    const portfolioData = await getPortfolio(token, accountId);
    const positions: any[] = portfolioData.positions || [];

    // Filter equity/stock positions that have figi
    const equityPositions = positions.filter(
      (p: any) => p.figi && (p.instrumentType === 'share' || p.instrumentType === 'bond')
    );

    // Fetch dividend history for all positions
    const allForecasts: Array<{ month: number; amount: number; type: 'forecast' }> = [];
    const upcomingPayments: Array<{ month: number; name: string; amount: number; type: string }> = [];

    for (const pos of equityPositions) {
      try {
        const divData = await getDividends(token, pos.figi);
        const history = divData.dividends || [];
        const qty = Math.abs(moneyToNumber({ units: pos.quantity?.units || '0', nano: pos.quantity?.nano || 0 }));

        if (history.length > 0 && qty > 0) {
          const forecasted = forecastDividends(history, qty);
          allForecasts.push(...forecasted);
        }
      } catch {
        // Skip positions where dividend data is unavailable
      }
    }

    // Aggregate forecasts by month (current year)
    const monthlyForecast = Array.from({ length: 12 }, (_, i) => ({
      m: MONTH_NAMES[i],
      paid: 0,
      announced: 0,
      forecast: 0,
    }));

    for (const f of allForecasts) {
      if (f.month >= 0 && f.month < 12) {
        monthlyForecast[f.month].forecast += f.amount;
      }
    }

    return NextResponse.json({ months: monthlyForecast, positions: equityPositions.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
