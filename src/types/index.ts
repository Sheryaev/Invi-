export interface MonthData {
  m: string;
  paid: number;
  announced: number;
  forecast: number;
}

export interface Holding {
  tkr: string;
  name: string;
  figi?: string;
  glyph: string;
  entry: number;
  price: number;
  qty: number;
  color: string;
  logoUrl?: string;
}

export interface TopAsset {
  tkr: string;
  name: string;
  kind: string;
  yield: number;
  income: number;
  color: string;
}

export interface UpcomingPayment {
  day: number;
  mon: string;
  name: string;
  type: string;
  amt: number;
  kind: 'div' | 'cpn';
}

export interface Mover {
  tkr: string;
  name: string;
  price: number;
  pct: number;
  chg: number;
  color: string;
  logoUrl?: string;
}

export interface AllocationItem {
  name: string;
  pct: number;
  cls: 'bond' | 'stock' | 'cash';
  color: string;
}

export interface SectorItem {
  name: string;
  count: number;
  value: number;
  invested: number;
  color: string;
}

export interface Portfolio {
  currency: string;
  totalValue: number;
  dayChange: number;
  dayChangePct: number;
  invested: number;
  totalReturnPct: number;
  monthReturnPct: number;
  yieldPct: number;
  yieldCoupon: number;
  yieldDividend: number;
  passiveYoY: number;
  target: number;
  months: MonthData[];
  sum: { paid: number; announced: number; forecast: number; total: number };
  topAssets: TopAsset[];
  upcoming: UpcomingPayment[];
  gainers: Mover[];
  losers: Mover[];
  holdings: Holding[];
  valueHistory: number[];
  profileName: string;
  allocation: AllocationItem[];
  sectors: SectorItem[];
}

export interface RYValues {
  div: number;
  divReinv: number;
  iis: number;
  iisReinv: number;
  infl: number;
}

export interface PortfolioProfile {
  id: string;
  name: string;
  sub: string;
  icon: string;
  custom?: boolean;
  broker?: string;
  keyMask?: string;
  factor: number;
  cScale?: number;
  dScale?: number;
  ret: number;
  month: number;
  dayPct: number;
  yield: number;
  yoY: number;
  filter?: string | null;
  ry: RYValues;
  value: number;
}

export interface RYOpts {
  useIIS: boolean;
}

export interface RYResult {
  parts: Array<{ key: string; label: string; note: string; val: number }>;
  total: number;
  market: number;
  strategy: number;
  hasIIS: boolean;
}

export interface TipState {
  i: number;
  x: number;
  y: number;
  d: MonthData;
}
