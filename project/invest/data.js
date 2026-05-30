/* ============================================================
   Данные портфеля (демо, ₽). Облигации (купоны) + дивидендные акции.
   Год: 2026. Текущая дата — конец мая, поэтому янв–май = факт,
   июн–дек = прогноз.
   ============================================================ */
window.PORTFOLIO = {
  currency: "₽",
  totalValue: 4852300,
  dayChange: 58200,
  dayChangePct: 1.21,
  invested: 4098000,
  totalReturnPct: 18.4,
  monthReturnPct: 2.3,
  yieldPct: 8.0,
  yieldCoupon: 3.9,
  yieldDividend: 4.1,
  passiveYoY: 24,
  target: 400000,

  // 12 месяцев пассивного дохода, ₽. В каждом месяце сумма может состоять
  // из уже выплаченного, объявленного (подтверждён размер, ждём дату) и прогноза.
  months: [
    { m: "Янв", paid: 14200, announced: 0,     forecast: 0 },
    { m: "Фев", paid: 13900, announced: 0,     forecast: 0 },
    { m: "Мар", paid: 20900, announced: 0,     forecast: 0 },
    { m: "Апр", paid: 20100, announced: 0,     forecast: 0 },
    { m: "Май", paid: 27600, announced: 11700, forecast: 0 },
    { m: "Июн", paid: 0,     announced: 42300, forecast: 12600 },
    { m: "Июл", paid: 0,     announced: 49800, forecast: 30100 },
    { m: "Авг", paid: 0,     announced: 6400,  forecast: 15100 },
    { m: "Сен", paid: 0,     announced: 7800,  forecast: 18200 },
    { m: "Окт", paid: 0,     announced: 19500, forecast: 26800 },
    { m: "Ноя", paid: 0,     announced: 0,     forecast: 15700 },
    { m: "Дек", paid: 0,     announced: 9200,  forecast: 27400 },
  ],

  // распределение портфеля по классам активов (вкладка «Диверсификация»)
  allocation: [
    { name: "ОФЗ",              pct: 22, cls: "bond",  color: "var(--primary)" },
    { name: "Корп. облигации",  pct: 17, cls: "bond",  color: "#4d94ff" },
    { name: "Акции · нефтегаз", pct: 26, cls: "stock", color: "var(--success)" },
    { name: "Акции · финансы",  pct: 18, cls: "stock", color: "#f5a524" },
    { name: "Акции · прочее",   pct: 12, cls: "stock", color: "var(--secondary)" },
    { name: "Денежные средства", pct: 5, cls: "cash",  color: "var(--fg-faint)" },
  ],

  // распределение портфеля по секторам (donut + таблица)
  sectors: [
    { name: "Нефтегаз",              count: 5, value: 1358600, invested: 1247000, color: "var(--primary)" },
    { name: "Финансы",               count: 4, value: 1164500, invested: 1118200, color: "#38bdf8" },
    { name: "Облигации ОФЗ и корп.", count: 6, value: 1067500, invested: 1041000, color: "var(--secondary)" },
    { name: "Металлы и добыча",      count: 3, value: 582300,  invested: 631400,  color: "#7c5cff" },
    { name: "Электроэнергетика",     count: 2, value: 388200,  invested: 372500,  color: "#f5a524" },
    { name: "Телеком",               count: 2, value: 291200,  invested: 318900,  color: "var(--success)" },
  ],

  // история стоимости портфеля (12 точек), ₽ млн
  valueHistory: [3.92, 3.98, 4.05, 3.99, 4.18, 4.27, 4.34, 4.41, 4.46, 4.52, 4.68, 4.79, 4.85],

  // топ активов по годовому доходу
  topAssets: [
    { tkr: "SBER", name: "Сбербанк",        kind: "Акция",     yield: 10.4, income: 52300, color: "var(--success)" },
    { tkr: "LKOH", name: "Лукойл",          kind: "Акция",     yield: 9.8,  income: 47600, color: "var(--success)" },
    { tkr: "26238",name: "ОФЗ 26238",       kind: "Облигация", yield: 11.2, income: 38400, color: "var(--primary)" },
    { tkr: "TATN", name: "Татнефть",        kind: "Акция",     yield: 13.2, income: 33200, color: "var(--success)" },
    { tkr: "SBER", name: "Сбербанк 001Р",   kind: "Облигация", yield: 12.8, income: 29100, color: "var(--primary)" },
    { tkr: "26244",name: "ОФЗ 26244",       kind: "Облигация", yield: 11.6, income: 24700, color: "var(--primary)" },
    { tkr: "MTSS", name: "МТС",             kind: "Акция",     yield: 12.1, income: 21800, color: "var(--success)" },
    { tkr: "SIBN", name: "Газпром нефть",   kind: "Акция",     yield: 11.5, income: 18400, color: "var(--success)" },
  ],

  // ближайшие выплаты (прогноз)
  upcoming: [
    { day: 2,  mon: "июн", name: "Лукойл",         type: "Дивиденды", amt: 23400, kind: "div" },
    { day: 9,  mon: "июн", name: "ОФЗ 26238",      type: "Купон",     amt: 9600,  kind: "cpn" },
    { day: 15, mon: "июн", name: "Татнефть",       type: "Дивиденды", amt: 12100, kind: "div" },
    { day: 27, mon: "июн", name: "Сбербанк 001Р",  type: "Купон",     amt: 7300,  kind: "cpn" },
    { day: 4,  mon: "июл", name: "Сбербанк",       type: "Дивиденды", amt: 31800, kind: "div" },
    { day: 11, mon: "июл", name: "ОФЗ 26244",      type: "Купон",     amt: 6200,  kind: "cpn" },
  ],

  // движения за день
  gainers: [
    { tkr: "TATNP", name: "Татнефть ап",    price: 712.40,  pct: 2.14, chg: 14.90, color: "var(--success)" },
    { tkr: "SBER",  name: "Сбербанк",       price: 318.60,  pct: 1.42, chg: 4.45,  color: "var(--success)" },
    { tkr: "MTSS",  name: "МТС",            price: 245.10,  pct: 0.94, chg: 2.28,  color: "#4d94ff" },
    { tkr: "SIBN",  name: "Газпром нефть",  price: 642.80,  pct: 0.61, chg: 3.90,  color: "var(--secondary)" },
    { tkr: "26238", name: "ОФЗ 26238",      price: 645.20,  pct: 0.29, chg: 1.86,  color: "var(--primary)" },
  ],
  losers: [
    { tkr: "LKOH",  name: "Лукойл",         price: 7184.00, pct: -0.88, chg: -64.00, color: "var(--danger)" },
    { tkr: "GMKN",  name: "Норникель",      price: 142.30,  pct: -1.21, chg: -1.74,  color: "#f59e0b" },
    { tkr: "MGNT",  name: "Магнит",         price: 5210.00, pct: -0.69, chg: -36.20, color: "var(--danger)" },
    { tkr: "VTBR",  name: "ВТБ",            price: 98.42,   pct: -0.54, chg: -0.53,  color: "var(--primary)" },
    { tkr: "NVTK",  name: "Новатэк",        price: 1024.00, pct: -0.21, chg: -2.15,  color: "var(--secondary)" },
  ],

  // позиции в портфеле (вход → текущая цена, количество)
  holdings: [
    { tkr: "DOMRF", name: "ДОМ.РФ",                              glyph: "ДОМ", entry: 2292.9,  price: 2411.6, qty: 3,    color: "#1b3c8f" },
    { tkr: "AQUA",  name: "ИНАРКТИКА",                           glyph: "ИНА", entry: 460.9,   price: 415.4,  qty: 16,   color: "#0b1a2b" },
    { tkr: "IRAO",  name: "Интер РАО",                           glyph: "ИРАО",entry: 3.1794,  price: 3.2095, qty: 2100, color: "#e8741e" },
    { tkr: "FIVE",  name: "Корпоративный Центр Икс 5",           glyph: "X5",  entry: 2744.3,  price: 2450.0, qty: 3,    color: "#009f3c" },
    { tkr: "LKOH",  name: "ЛУКОЙЛ",                              glyph: "ЛК",  entry: 5698.8,  price: 4880.5, qty: 2,    color: "#e3001b" },
    { tkr: "MAGN",  name: "Магнитогорский металлургический комбинат", glyph: "ММК", entry: 27.061, price: 22.875, qty: 120, color: "#1a4f9c" },
    { tkr: "MOEX",  name: "Московская Биржа",                    glyph: "MX",  entry: 178.97,  price: 175.37, qty: 30,   color: "#ee2a24" },
    { tkr: "NMTP",  name: "НМТП",                                glyph: "НМТП",entry: 8.44,    price: 8.76,   qty: 100,  color: "#16315c" },
    { tkr: "NVTK",  name: "НОВАТЭК",                             glyph: "НВ",  entry: 1120.7,  price: 1071.2, qty: 4,    color: "#2b5fb0" },
    { tkr: "LSNGP", name: "Россети Ленэнерго ап",                glyph: "ЛЭ",  entry: 291.95,  price: 378.75, qty: 20,   color: "#1f6fb2" },
    { tkr: "SBER",  name: "Сбербанк",                            glyph: "СБ",  entry: 268.40,  price: 318.60, qty: 40,   color: "#21a038" },
    { tkr: "TATN",  name: "Татнефть",                            glyph: "ТН",  entry: 624.10,  price: 712.40, qty: 12,   color: "#e3001b" },
    { tkr: "MTSS",  name: "МТС",                                 glyph: "МТС", entry: 251.80,  price: 245.10, qty: 35,   color: "#e3001b" },
    { tkr: "GMKN",  name: "Норникель",                           glyph: "НН",  entry: 148.60,  price: 142.30, qty: 90,   color: "#f59e0b" },
  ],
};

// helpers
window.fmt = {
  rub(n, opts = {}) {
    const sign = opts.sign && n > 0 ? "+" : "";
    return sign + "₽" + Math.round(n).toLocaleString("ru-RU");
  },
  rubK(n) {
    // компактно: ₽389,3 тыс / ₽4,85 млн
    if (Math.abs(n) >= 1e6) return "₽" + (n / 1e6).toFixed(2).replace(".", ",") + " млн";
    if (Math.abs(n) >= 1e3) return "₽" + (n / 1e3).toFixed(1).replace(".", ",") + " тыс";
    return "₽" + Math.round(n);
  },
  pct(n, opts = {}) {
    const sign = opts.sign && n > 0 ? "+" : "";
    return sign + n.toLocaleString("ru-RU") + "%";
  },
  rubFull(n, opts = {}) {
    const sign = opts.sign && n > 0 ? "+" : "";
    return sign + n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₽";
  },
  price(n) {
    // натуральная точность цены: 2 292,9 / 3,1794 / 27,061
    const dec = Math.abs(n) >= 1000 ? 2 : Math.abs(n) >= 1 ? 4 : 4;
    const s = n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: dec });
    return s + " ₽";
  },
};

// производные суммы
(function () {
  const P = window.PORTFOLIO;
  let paid = 0, announced = 0, forecast = 0;
  P.months.forEach((x) => { paid += x.paid; announced += x.announced; forecast += x.forecast; });
  P.sum = { paid, announced, forecast, total: paid + announced + forecast };
})();

/* ---------------- Портфели + пересчёт аналитики ---------------- */
// ry — слагаемые «реальной доходности» (в п.п.):
//   div — вклад дивидендов/купонов, divReinv — бонус от реинвестирования,
//   iis — налоговый вычет ИИС, iisReinv — бонус от реинвестирования вычета,
//   infl — инфляция (вычитается). iis=0 → счёт не на ИИС.
window.PORTFOLIOS = [
  { id: "all",  name: "Общая аналитика", sub: "Все счета · 3 портфеля", icon: "layers",    factor: 1.00, cScale: 1.00, dScale: 1.00, ret: 18.4, month: 2.3, dayPct: 1.21, yield: 8.0, yoY: 24, filter: null, ry: { div: 1.8, divReinv: 0.5, iis: 1.5, iisReinv: 0.5, infl: 1.0 } },
  { id: "iis",  name: "ИИС",             sub: "Долгосрочный",           icon: "wallet",    factor: 0.33, cScale: 0.36, dScale: 0.30, ret: 22.1, month: 3.1, dayPct: 1.6,  yield: 9.2, yoY: 31, filter: null, ry: { div: 1.2, divReinv: 0.4, iis: 2.4, iisReinv: 0.7, infl: 1.0 } },
  { id: "div",  name: "Дивидендные акции", sub: "Брокерский счёт",      icon: "wallet",    factor: 0.43, cScale: 0.05, dScale: 0.80, ret: 15.6, month: 1.8, dayPct: 1.9,  yield: 6.4, yoY: 19, filter: "Акция", ry: { div: 3.4, divReinv: 0.9, iis: 0, iisReinv: 0, infl: 1.0 } },
  { id: "bond", name: "Облигации",       sub: "Купонный доход",         icon: "wallet",    factor: 0.24, cScale: 0.62, dScale: 0.00, ret: 11.8, month: 0.7, dayPct: 0.22, yield: 10.6, yoY: 12, filter: "Облигация", ry: { div: 5.2, divReinv: 1.3, iis: 0.9, iisReinv: 0.3, infl: 1.0 } },
];
// удобный доступ к стоимости портфеля (для меню)
window.PORTFOLIOS.forEach((p) => { p.value = Math.round(window.PORTFOLIO.totalValue * p.factor); });

// брокеры для подключения по ключу
window.BROKERS = [
  { id: "tinkoff", name: "Т-Инвестиции" },
  { id: "sber",    name: "СберИнвестор" },
  { id: "vtb",     name: "ВТБ Мои Инвестиции" },
  { id: "alfa",    name: "Альфа-Инвестиции" },
  { id: "bcs",     name: "БКС Мир инвестиций" },
  { id: "finam",   name: "Финам" },
];

// детерминированный «хэш» из строки ключа → стабильные демо-метрики
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

// создать профиль портфеля из подключённого ключа (демо-генерация метрик)
window.makePortfolioFromKey = function ({ name, broker, key }) {
  const h = hashStr(key + "|" + broker + "|" + name);
  const rnd = (seed, min, max) => min + ((h >> seed) & 255) / 255 * (max - min);
  const factor = +(rnd(0, 0.12, 0.55)).toFixed(2);
  const ret = +(rnd(3, 6, 24)).toFixed(1);
  const brk = (window.BROKERS.find((b) => b.id === broker) || {}).name || "Брокерский счёт";
  return {
    id: "u_" + h.toString(36),
    name: name || brk,
    sub: brk,
    icon: "wallet",
    custom: true,
    broker,
    keyMask: "••••" + key.slice(-4),
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
    value: Math.round(window.PORTFOLIO.totalValue * factor),
  };
};

// строим «вид» дашборда под выбранный портфель
window.deriveView = function (base, prof) {
  if (!prof || prof.id === "all") {
    return Object.assign({}, base, {
      totalReturnPct: prof ? prof.ret : base.totalReturnPct,
      monthReturnPct: prof ? prof.month : base.monthReturnPct,
      yieldPct: prof ? prof.yield : base.yieldPct,
      passiveYoY: prof ? prof.yoY : base.passiveYoY,
      profileName: prof ? prof.name : "Общая аналитика",
    });
  }
  const f = prof.factor;
  const totalValue = Math.round(base.totalValue * f);
  const invested = Math.round(totalValue / (1 + prof.ret / 100));
  const dayChange = Math.round(totalValue * prof.dayPct / 100);

  const months = base.months.map((m) => ({
    ...m,
    paid: Math.round(m.paid * f),
    announced: Math.round(m.announced * f),
    forecast: Math.round(m.forecast * f),
  }));
  let paid = 0, announced = 0, forecast = 0;
  months.forEach((x) => { paid += x.paid; announced += x.announced; forecast += x.forecast; });

  const topAssets = base.topAssets
    .filter((a) => !prof.filter || a.kind === prof.filter);
  const upcoming = base.upcoming
    .filter((u) => !prof.filter || (prof.filter === "Облигация" ? u.kind === "cpn" : u.kind === "div"));

  return Object.assign({}, base, {
    totalValue, invested, dayChange,
    dayChangePct: prof.dayPct,
    totalReturnPct: prof.ret,
    monthReturnPct: prof.month,
    yieldPct: prof.yield,
    passiveYoY: prof.yoY,
    valueHistory: base.valueHistory.map((v) => +(v * f).toFixed(3)),
    months,
    sectors: base.sectors.map((s) => ({ ...s, value: Math.round(s.value * f), invested: Math.round(s.invested * f) })),
    sum: { paid, announced, forecast, total: paid + announced + forecast },
    topAssets,
    upcoming,
    profileName: prof.name,
  });
};

/* ---------------- Реальная доходность ----------------
   Складывает доходность с учётом стратегии инвестора:
   рынок + дивиденды/купоны (± реинвест) + вычет ИИС (± реинвест) − инфляция. */
window.RY_DEFAULTS = { useIIS: true, reinvestDiv: true, reinvestTax: true };

window.realYield = function (prof, opts) {
  const o = Object.assign({}, window.RY_DEFAULTS, opts);
  const ry = prof.ry || { div: 1.6, divReinv: 0.4, iis: 1.2, iisReinv: 0.3, infl: 1.0 };
  const r1 = (n) => Math.round(n * 10) / 10;
  const parts = [];

  parts.push({ key: "market", label: "Базовая доходность", note: "рост стоимости активов", val: prof.ret });

  parts.push({
    key: "div", label: "Дивиденды и купоны",
    note: o.reinvestDiv ? "с реинвестированием" : "без реинвестирования",
    val: r1(ry.div + (o.reinvestDiv ? ry.divReinv : 0)),
  });

  const hasIIS = ry.iis > 0;
  if (o.useIIS && hasIIS) {
    parts.push({
      key: "iis", label: "Налоговый вычет ИИС",
      note: o.reinvestTax ? "вычет реинвестирован" : "разовый вычет",
      val: r1(ry.iis + (o.reinvestTax ? ry.iisReinv : 0)),
    });
  }

  const total = r1(parts.reduce((s, p) => s + p.val, 0));
  const strategy = r1(total - prof.ret);
  return { parts, total, market: prof.ret, strategy, hasIIS };
};
