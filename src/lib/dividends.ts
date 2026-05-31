interface HistoricalDividend {
  dividendNet: { units: string; nano: number };
  paymentDate: string;
}

export function forecastDividends(
  history: HistoricalDividend[],
  qty: number
): Array<{ month: number; amount: number; type: 'forecast' }> {
  if (!history || history.length === 0) return [];

  const moneyToNum = (m: { units: string; nano: number }) =>
    Number(m.units) + m.nano / 1e9;

  const payments = history
    .filter((d) => d.dividendNet && d.paymentDate)
    .map((d) => ({
      amount: moneyToNum(d.dividendNet),
      date: new Date(d.paymentDate),
      month: new Date(d.paymentDate).getMonth(),
      year: new Date(d.paymentDate).getFullYear(),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (payments.length === 0) return [];

  const byYear: Record<number, typeof payments> = {};
  payments.forEach((p) => {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p);
  });

  const years = Object.keys(byYear).map(Number).sort();
  const annualTotals = years.map((y) => ({
    year: y,
    total: byYear[y].reduce((s, p) => s + p.amount, 0),
    months: byYear[y].map((p) => p.month),
    count: byYear[y].length,
  }));

  let forecastAnnual: number;
  let paymentMonths: number[];

  if (annualTotals.length >= 2) {
    const recentYears = annualTotals.slice(-3);
    const firstTotal = recentYears[0].total;
    const lastTotal = recentYears[recentYears.length - 1].total;
    const yearsSpan = recentYears.length - 1;
    const cagr =
      yearsSpan > 0 ? Math.pow(lastTotal / firstTotal, 1 / yearsSpan) - 1 : 0;

    if (Math.abs(cagr) >= 0.05) {
      forecastAnnual = lastTotal * (1 + cagr);
    } else {
      forecastAnnual =
        recentYears.reduce((s, y) => s + y.total, 0) / recentYears.length;
    }

    const lastYearData = annualTotals[annualTotals.length - 1];
    paymentMonths = lastYearData.months;
  } else {
    forecastAnnual = annualTotals[0].total;
    paymentMonths = annualTotals[0].months;
  }

  const amtPerPayment =
    paymentMonths.length > 0 ? forecastAnnual / paymentMonths.length : forecastAnnual;

  const currentMonth = new Date().getMonth();

  return paymentMonths
    .filter((m) => m > currentMonth)
    .map((m) => ({
      month: m,
      amount: amtPerPayment * qty,
      type: 'forecast' as const,
    }));
}
