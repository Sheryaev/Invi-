/* App — composition, theme, tweaks */
const { useState: useS, useEffect: useE } = React;

const HEX = {
  blue:   { c: "#006FEE", d: "#005bc4" },
  green:  { c: "#17C964", d: "#12a150" },
  purple: { c: "#9353d3", d: "#7828c8" },
  pink:   { c: "#f31260", d: "#c20e4d" },
};
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
const DENSITY = {
  compact: { gap: "14px", pad: "16px" },
  regular: { gap: "20px", pad: "22px" },
  comfy:   { gap: "26px", pad: "28px" },
};
const RADIUS = { sharp: 0.5, default: 1, rounded: 1.7 };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "dark": true,
  "density": "regular",
  "radius": "default",
  "chartType": "stacked"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [custom, setCustom] = useS(() => {
    try { return JSON.parse(localStorage.getItem("invest_custom") || "[]"); } catch { return []; }
  });
  const [portfolio, setPortfolioRaw] = useS(() => localStorage.getItem("invest_portfolio") || "all");
  const [tab, setTabRaw] = useS(() => localStorage.getItem("invest_tab") || "overview");
  const [onboarded, setOnboarded] = useS(() => localStorage.getItem("invest_onboarded") === "1");
  const [modal, setModal] = useS(false);
  const [tip, setTip] = useS(null);
  const [ryModal, setRyModal] = useS(false);
  const [ryOpts, setRyOptsRaw] = useS(() => {
    try { return Object.assign({}, window.RY_DEFAULTS, JSON.parse(localStorage.getItem("invest_ry") || "{}")); }
    catch { return Object.assign({}, window.RY_DEFAULTS); }
  });
  const setRyOpts = (o) => { localStorage.setItem("invest_ry", JSON.stringify(o)); setRyOptsRaw(o); };
  const [lastUpd, setLastUpd] = useS(() => new Date());
  const [refreshing, setRefreshing] = useS(false);
  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setLastUpd(new Date()); setRefreshing(false); }, 950);
  };
  const setTab = (id) => { localStorage.setItem("invest_tab", id); setTabRaw(id); };
  const finishOnboarding = () => { localStorage.setItem("invest_onboarded", "1"); setOnboarded(true); };
  const logout = () => {
    localStorage.removeItem("invest_onboarded");
    localStorage.removeItem("invest_custom");
    localStorage.removeItem("invest_portfolio");
    setCustom([]);
    setPortfolioRaw("all");
    setTab("overview");
    setOnboarded(false);
  };

  const portfolios = [...window.PORTFOLIOS, ...custom];
  const setPortfolio = (id) => { localStorage.setItem("invest_portfolio", id); setPortfolioRaw(id); };

  const addPortfolio = ({ name, broker, key }) => {
    const p = window.makePortfolioFromKey({ name, broker, key });
    const next = [...custom, p];
    setCustom(next);
    localStorage.setItem("invest_custom", JSON.stringify(next));
    setModal(false);
    setPortfolio(p.id);
  };
  const removePortfolio = (p) => {
    const next = custom.filter((x) => x.id !== p.id);
    setCustom(next);
    localStorage.setItem("invest_custom", JSON.stringify(next));
    if (portfolio === p.id) setPortfolio("all");
  };

  const prof = portfolios.find((p) => p.id === portfolio) || portfolios[0];
  const P = window.deriveView(window.PORTFOLIO, prof);
  const ry = window.realYield(prof, ryOpts);

  // apply accent
  useE(() => {
    const a = HEX[t.accent] || HEX.blue;
    const r = document.documentElement.style;
    r.setProperty("--primary", a.c);
    r.setProperty("--primary-600", a.d);
    r.setProperty("--primary-soft", hexA(a.c, 0.15));
  }, [t.accent]);

  // theme
  useE(() => {
    document.documentElement.dataset.theme = t.dark ? "dark" : "light";
  }, [t.dark]);

  // density
  useE(() => {
    const d = DENSITY[t.density] || DENSITY.regular;
    const r = document.documentElement.style;
    r.setProperty("--gap", d.gap);
    r.setProperty("--card-pad", d.pad);
  }, [t.density]);

  // radius
  useE(() => {
    document.documentElement.style.setProperty("--radius-scale", RADIUS[t.radius] ?? 1);
  }, [t.radius]);

  // онбординг: пока не подключён ни один портфель и не выбрано демо
  if (!onboarded) {
    return (
      <Welcome
        theme={t.dark ? "dark" : "light"}
        toggleTheme={() => setTweak("dark", !t.dark)}
        onDemo={finishOnboarding}
        onConnect={({ name, broker, key }) => {
          const p = window.makePortfolioFromKey({ name, broker, key });
          const next = [...custom, p];
          setCustom(next);
          localStorage.setItem("invest_custom", JSON.stringify(next));
          setPortfolio(p.id);
          finishOnboarding();
        }} />
    );
  }

  const visible = P.months;
  const visTotal = P.sum.total;

  const TABS = [
    { id: "overview", label: "Обзор", icon: "grid" },
    { id: "income", label: "Пассивный доход", icon: "coins" },
    { id: "metrics", label: "Метрики", icon: "spark" },
    { id: "diversification", label: "Диверсификация", icon: "pie" },
  ];
  const HEADS = {
    overview: { h: "Обзор портфеля", p: "Доходность и пассивный доход за 2026" },
    income: { h: "Пассивный доход", p: "Купоны и дивиденды по месяцам · 2026" },
    metrics: { h: "Метрики", p: "Доходность, риск и динамика стоимости" },
    diversification: { h: "Диверсификация", p: "Структура портфеля по классам активов" },
  };

  // переиспользуемая карточка главного графика
  const ChartCard = (
    <div className="card col-8">
      <div className="card-head">
        <div>
          <div className="card-title">Пассивный доход за 12 месяцев</div>
          <div className="card-sub">
            Выплаты по месяцам · {fmt.rubK(visTotal)}/год · {fmt.rubK(visTotal / 12)}/мес
          </div>
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: "var(--success)" }} /> Выплачено</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: "var(--primary)" }} /> Объявлено</span>
          <span className="legend-item"><span className="legend-dot hatch" /> Прогноз</span>
        </div>
      </div>
      <PassiveIncomeChart months={visible} chartType="stacked" tip={tip} setTip={setTip} />
      <div style={{ display: "flex", gap: 0, marginTop: 14, borderTop: "1px solid var(--divider)", paddingTop: 16 }}>
        <SummaryStat label="Выплачено" value={fmt.rubK(P.sum.paid)} dot="var(--success)" />
        <SummaryStat label="Объявлено" value={fmt.rubK(P.sum.announced)} dot="var(--primary)" />
        <SummaryStat label="Прогноз" value={fmt.rubK(P.sum.forecast)} dot="var(--fg-faint)" hatch />
        <SummaryStat label="Итого за год" value={fmt.rubK(P.sum.total)} dot="var(--fg)" last />
      </div>
    </div>
  );

  return (
    <div className="page">
      <Topbar portfolios={portfolios} portfolio={portfolio} setPortfolio={setPortfolio}
        onAdd={() => setModal(true)} onRemove={removePortfolio} onLogout={logout}
        refreshing={refreshing} lastUpd={lastUpd} doRefresh={doRefresh}
        theme={t.dark ? "dark" : "light"} toggleTheme={() => setTweak("dark", !t.dark)} />

      <div className="content shell">
          <div className="page-bar">
            <div className="page-head">
              <h1>{HEADS[tab].h}</h1>
              <p>{P.profileName} · {HEADS[tab].p}</p>
            </div>
            <TabsNav tabs={TABS} active={tab} onChange={setTab} />
          </div>

          {tab === "overview" && (
            <div className="grid">
              <KpiRow P={P} ry={ry} onOpenRY={() => setRyModal(true)} />
              {ChartCard}
              <Upcoming P={P} className="col-4" />
              <TopMovers title="Топ роста за день" data={P.gainers} up={true} />
              <TopMovers title="Топ падений за день" data={P.losers} up={false} />
              <HoldingsTable P={P} />
            </div>
          )}

          {tab === "income" && (
            <EmptyState onBack={() => setTab("overview")}
              title="Календарь и прогноз выплат"
              text="Здесь появится детальный календарь купонов и дивидендов: помесячный прогноз поступлений, история выплат и сценарии реинвестирования. Мы уже работаем над этим разделом." />
          )}

          {tab === "metrics" && (
            <EmptyState onBack={() => setTab("overview")}
              title="Расширенная аналитика"
              text="Скоро тут будут продвинутые метрики: доходность с учётом вводов и выводов средств (XIRR), волатильность, бета и сравнение портфеля с индексом Мосбиржи." />
          )}

          {tab === "diversification" && (
            <EmptyState onBack={() => setTab("overview")}
              title="Анализ диверсификации"
              text="Мы покажем структуру портфеля по классам активов, секторам и эмитентам, оценим концентрацию риска и подскажем, как сбалансировать вложения." />
          )}
      </div>

      <ChartTip tip={tip} />

      <AddPortfolioModal open={modal} onClose={() => setModal(false)} onConnect={addPortfolio} />

      <RealYieldModal open={ryModal} onClose={() => setRyModal(false)}
        prof={prof} opts={ryOpts} setOpts={setRyOpts} />

      <TweaksPanel>
        <TweakSection label="Тема" />
        <TweakToggle label="Тёмная тема" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakColor label="Акцент" value={HEX[t.accent].c}
          options={[HEX.blue.c, HEX.green.c, HEX.purple.c, HEX.pink.c]}
          onChange={(v) => {
            const key = Object.keys(HEX).find((k) => HEX[k].c.toLowerCase() === v.toLowerCase()) || "blue";
            setTweak("accent", key);
          }} />
        <TweakSection label="Макет" />
        <TweakRadio label="Плотность" value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakRadio label="Скругление" value={t.radius}
          options={["sharp", "default", "rounded"]}
          onChange={(v) => setTweak("radius", v)} />
      </TweaksPanel>
    </div>
  );
}

function SummaryStat({ label, value, dot, hatch, last }) {
  return (
    <div style={{ flex: 1, paddingLeft: 16, borderLeft: last || false ? undefined : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--fg-muted)" }}>
        <span className={"legend-dot" + (hatch ? " hatch" : "")} style={hatch ? {} : { background: dot }} />
        {label}
      </div>
      <div className="tnum" style={{ fontSize: 18, fontWeight: 700, marginTop: 6, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
