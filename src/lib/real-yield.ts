import type { PortfolioProfile, RYOpts, RYResult } from '@/types';

export const RY_DEFAULTS: RYOpts = {
  useIIS: false,
};

/** Считает вычет ИИС типа А на основе суммы пополнений: min(invested, 400 000) × 13% */
export function calcIISDeduction(invested: number): number {
  if (!invested || invested <= 0) return 0;
  return Math.round(Math.min(invested, 400_000) * 0.13);
}

export function realYield(prof: PortfolioProfile, opts?: Partial<RYOpts>): RYResult {
  const parts: RYResult['parts'] = [];
  parts.push({ key: 'market', label: 'Базовая доходность', note: 'рост стоимости активов', val: prof.ret });
  const total = parts.reduce((s, p) => s + p.val, 0);
  return { parts, total, market: prof.ret, strategy: 0, hasIIS: false };
}

export function deriveView(base: any, prof: any) {
  if (!prof || prof.id === 'all') {
    return {
      ...base,
      totalReturnPct: prof ? prof.ret : base.totalReturnPct,
      monthReturnPct: prof ? prof.month : base.monthReturnPct,
      yieldPct: prof ? prof.yield : base.yieldPct,
      passiveYoY: prof ? prof.yoY : base.passiveYoY,
      profileName: prof ? prof.name : 'Общая аналитика',
    };
  }

  const f = prof.factor;
  const totalValue = Math.round(base.totalValue * f);
  const invested = Math.round(totalValue / (1 + prof.ret / 100));
  const dayChange = Math.round(totalValue * prof.dayPct / 100);

  const months = base.months.map((m: any) => ({
    ...m,
    paid: Math.round(m.paid * f),
    announced: Math.round(m.announced * f),
    forecast: Math.round(m.forecast * f),
  }));

  let paid = 0, announced = 0, forecast = 0;
  months.forEach((x: any) => {
    paid += x.paid;
    announced += x.announced;
    forecast += x.forecast;
  });

  const topAssets = base.topAssets.filter(
    (a: any) => !prof.filter || a.kind === prof.filter
  );
  const upcoming = base.upcoming.filter((u: any) =>
    !prof.filter ||
    (prof.filter === 'Облигация' ? u.kind === 'cpn' : u.kind === 'div')
  );

  return {
    ...base,
    totalValue,
    invested,
    dayChange,
    dayChangePct: prof.dayPct,
    totalReturnPct: prof.ret,
    monthReturnPct: prof.month,
    yieldPct: prof.yield,
    passiveYoY: prof.yoY,
    valueHistory: base.valueHistory.map((v: number) => +(v * f).toFixed(3)),
    months,
    sectors: base.sectors.map((s: any) => ({
      ...s,
      value: Math.round(s.value * f),
      invested: Math.round(s.invested * f),
    })),
    sum: { paid, announced, forecast, total: paid + announced + forecast },
    topAssets,
    upcoming,
    profileName: prof.name,
  };
}

export function makePortfolioFromKey({
  name,
  broker,
  key,
}: {
  name: string;
  broker: string;
  key: string;
}) {
  const BROKERS: Record<string, string> = {
    tinkoff: 'Т-Инвестиции',
    sber: 'СберИнвестор',
    vtb: 'ВТБ Мои Инвестиции',
    alfa: 'Альфа-Инвестиции',
    bcs: 'БКС Мир инвестиций',
    finam: 'Финам',
  };

  function hashStr(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const h = hashStr(key + '|' + broker + '|' + name);
  const rnd = (seed: number, min: number, max: number) =>
    min + ((h >> seed) & 255) / 255 * (max - min);

  const factor = +(rnd(0, 0.12, 0.55)).toFixed(2);
  const ret = +(rnd(3, 6, 24)).toFixed(1);
  const brk = BROKERS[broker] || 'Брокерский счёт';

  return {
    id: 'u_' + h.toString(36),
    name: name || brk,
    sub: brk,
    icon: 'wallet',
    custom: true,
    broker,
    keyMask: '••••' + key.slice(-4),
    factor,
    cScale: +(rnd(6, 0.05, 0.7)).toFixed(2),
    dScale: +(rnd(9, 0.1, 0.85)).toFixed(2),
    ret,
    month: +(rnd(12, 0.5, 3.4)).toFixed(1),
    dayPct: +(rnd(15, -1.2, 2.2)).toFixed(2),
    yield: +(rnd(18, 5, 11)).toFixed(1),
    yoY: Math.round(rnd(21, 8, 33)),
    filter: null,
    ry: {
      div: +(rnd(2, 1.0, 4.5)).toFixed(1),
      divReinv: +(rnd(4, 0.3, 1.1)).toFixed(1),
      iis: ((h >> 7) & 1) ? +(rnd(8, 0.8, 2.4)).toFixed(1) : 0,
      iisReinv: +(rnd(10, 0.3, 0.7)).toFixed(1),
      infl: 1.0,
    },
    value: 0,
  };
}
