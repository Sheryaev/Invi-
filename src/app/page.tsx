'use client';
import { useState, useEffect } from 'react';
import Welcome from '@/components/Welcome';
import Topbar from '@/components/Topbar';
import TabsNav from '@/components/TabsNav';
import KpiRow from '@/components/KpiRow';
import PassiveIncomeChart, { ChartTip } from '@/components/PassiveIncomeChart';
import Upcoming from '@/components/Upcoming';
import TopMovers from '@/components/TopMovers';
import HoldingsTable from '@/components/HoldingsTable';
import EmptyState from '@/components/EmptyState';
import AddPortfolioModal from '@/components/AddPortfolioModal';
import RealYieldModal from '@/components/RealYieldModal';
import SkeletonDashboard from '@/components/SkeletonDashboard';
import { BASE_PORTFOLIO, DEMO_PORTFOLIOS } from '@/lib/demo-data';
import { deriveView, makePortfolioFromKey, RY_DEFAULTS, calcIISDeduction } from '@/lib/real-yield';
import { useTinkoffPortfolio } from '@/hooks/useTinkoffPortfolio';
import { fmt } from '@/lib/format';
import type { PortfolioProfile, TipState, RYOpts } from '@/types';
import { Icon } from '@/components/icons';

const HEX: Record<string, { c: string; d: string }> = {
  blue:   { c: '#006FEE', d: '#005bc4' },
  green:  { c: '#17C964', d: '#12a150' },
  purple: { c: '#9353d3', d: '#7828c8' },
  pink:   { c: '#f31260', d: '#c20e4d' },
};

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const TABS = [
  { id: 'overview',        label: 'Обзор',          icon: 'grid' },
  { id: 'income',          label: 'Пассивный доход', icon: 'coins' },
  { id: 'metrics',         label: 'Метрики',         icon: 'spark' },
  { id: 'diversification', label: 'Диверсификация',  icon: 'pie' },
];

const HEADS: Record<string, { h: string; p: string }> = {
  overview:        { h: 'Обзор портфеля',     p: 'Доходность и пассивный доход за 2026' },
  income:          { h: 'Пассивный доход',    p: 'Купоны и дивиденды по месяцам · 2026' },
  metrics:         { h: 'Метрики',             p: 'Доходность, риск и динамика стоимости' },
  diversification: { h: 'Диверсификация',     p: 'Структура портфеля по классам активов' },
};

function SummaryStat({ label, value, dot, hatch, last }: { label: string; value: string; dot?: string; hatch?: boolean; last?: boolean }) {
  return (
    <div style={{ flex: 1, paddingLeft: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--fg-muted)' }}>
        <span className={'legend-dot' + (hatch ? ' hatch' : '')} style={hatch ? {} : { background: dot }} />
        {label}
      </div>
      <div className="tnum" style={{ fontSize: 18, fontWeight: 700, marginTop: 6, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [accent, setAccent] = useState('blue');
  const [dark, setDark] = useState<boolean | null>(null);
  const [portfolio, setPortfolioRaw] = useState('all');
  const [tab, setTabRaw] = useState('overview');
  const [onboarded, setOnboarded] = useState(false);
  const [custom, setCustom] = useState<PortfolioProfile[]>([]);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [modal, setModal] = useState(false);
  const [ryModal, setRyModal] = useState(false);
  const [tip, setTip] = useState<TipState | null>(null);
  const [ryOpts, setRyOptsRaw] = useState<RYOpts>({ ...RY_DEFAULTS });
  const [lastUpd, setLastUpd] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const ls = (key: string) => localStorage.getItem(key);
    setOnboarded(ls('invest_onboarded') === '1');
    setPortfolioRaw(ls('invest_portfolio') || 'all');
    setTabRaw(ls('invest_tab') || 'overview');
    // Theme: saved preference or system
    const savedTheme = ls('invest_theme');
    setDark(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    try { setCustom(JSON.parse(ls('invest_custom') || '[]')); } catch {}
    try { setKeys(JSON.parse(ls('invest_keys') || '{}')); } catch {}
    try { setRyOptsRaw({ ...RY_DEFAULTS, ...JSON.parse(ls('invest_ry') || '{}') }); } catch {}
  }, []);

  // Theme
  useEffect(() => {
    if (!mounted || dark === null) return;
    const t = dark ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
    localStorage.setItem('invest_theme', t);
  }, [dark, mounted]);

  // Accent colors
  useEffect(() => {
    if (!mounted) return;
    const a = HEX[accent] || HEX.blue;
    const r = document.documentElement.style;
    r.setProperty('--primary', a.c);
    r.setProperty('--primary-600', a.d);
    r.setProperty('--primary-soft', hexA(a.c, 0.15));
  }, [accent, mounted]);

  const setPortfolio = (id: string) => { localStorage.setItem('invest_portfolio', id); setPortfolioRaw(id); };
  const setTab = (id: string) => { localStorage.setItem('invest_tab', id); setTabRaw(id); };
  const setRyOpts = (o: RYOpts) => { localStorage.setItem('invest_ry', JSON.stringify(o)); setRyOptsRaw(o); };

  const finishOnboarding = () => { localStorage.setItem('invest_onboarded', '1'); setOnboarded(true); };
  const logout = () => {
    localStorage.removeItem('invest_onboarded');
    localStorage.removeItem('invest_custom');
    localStorage.removeItem('invest_portfolio');
    localStorage.removeItem('invest_keys');
    setCustom([]);
    setKeys({});
    setPortfolioRaw('all');
    setTab('overview');
    setOnboarded(false);
  };

  const saveKey = (profileId: string, token: string) => {
    const next = { ...keys, [profileId]: token };
    setKeys(next);
    localStorage.setItem('invest_keys', JSON.stringify(next));
  };

  const addPortfolio = ({ name, broker, key }: { name: string; broker: string; key: string }) => {
    const p = makePortfolioFromKey({ name, broker, key });
    const next = [...custom, p];
    setCustom(next);
    localStorage.setItem('invest_custom', JSON.stringify(next));
    if (broker === 'tinkoff' && key) saveKey(p.id, key);
    setModal(false);
    setPortfolio(p.id);
  };

  const removePortfolio = (p: PortfolioProfile) => {
    const next = custom.filter(x => x.id !== p.id);
    setCustom(next);
    localStorage.setItem('invest_custom', JSON.stringify(next));
    const nextKeys = { ...keys };
    delete nextKeys[p.id];
    setKeys(nextKeys);
    localStorage.setItem('invest_keys', JSON.stringify(nextKeys));
    if (portfolio === p.id) setPortfolio('all');
  };

  const doRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setLastUpd(new Date()); setRefreshing(false); }, 950);
  };

  // When real portfolios are connected, show only those (not demo data)
  const portfolios = custom.length > 0 ? custom : DEMO_PORTFOLIOS;
  const prof = portfolios.find(p => p.id === portfolio) || portfolios[0];

  const activeToken = prof?.custom && prof.broker === 'tinkoff' ? (keys[prof.id] ?? null) : null;
  const { portfolioData, loading: tinkoffLoading, error: tinkoffError } = useTinkoffPortfolio(activeToken);

  const baseView = deriveView(BASE_PORTFOLIO, prof);
  // When real API data is present — never show demo data for any field
  const P = portfolioData ? {
    ...baseView,
    totalValue: portfolioData.totalValue ?? baseView.totalValue,
    invested: portfolioData.invested ?? baseView.invested,
    dayChange: portfolioData.dayChange ?? 0,
    dayChangePct: portfolioData.dayChangePct ?? 0,
    totalReturnPct: portfolioData.totalReturnPct ?? 0,
    holdings: portfolioData.holdings ?? [],
    gainers: portfolioData.gainers ?? [],
    losers: portfolioData.losers ?? [],
    upcoming: portfolioData.upcoming ?? [],
    months: portfolioData.months ?? baseView.months,
    sum: portfolioData.sum ?? baseView.sum,
  } : baseView;

  const iisDeduction = calcIISDeduction(P.invested);

  const theme = dark === false ? 'light' : 'dark';

  if (!mounted) return null;

  if (!onboarded) {
    return (
      <Welcome
        theme={theme}
        toggleTheme={() => setDark(d => !d)}
        onDemo={finishOnboarding}
        onConnect={({ name, broker, key }) => {
          const p = makePortfolioFromKey({ name, broker, key });
          const next = [...custom, p];
          setCustom(next);
          localStorage.setItem('invest_custom', JSON.stringify(next));
          if (broker === 'tinkoff' && key) saveKey(p.id, key);
          setPortfolio(p.id);
          finishOnboarding();
        }}
      />
    );
  }

  const visTotal = P.sum.total;

  return (
    <div className="page">
      <Topbar
        portfolios={portfolios}
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        onAdd={() => setModal(true)}
        onRemove={removePortfolio}
        onLogout={logout}
        theme={theme}
        toggleTheme={() => setDark(d => !d)}
        refreshing={refreshing || tinkoffLoading}
        lastUpd={lastUpd}
        doRefresh={doRefresh}
      />

      <div className="content shell">
        <div className="page-bar">
          <div className="page-head">
            <h1>{HEADS[tab].h}</h1>
            <p>{P.profileName} · {tinkoffError ? `Ошибка: ${tinkoffError}` : HEADS[tab].p}</p>
          </div>
          <TabsNav tabs={TABS} active={tab} onChange={setTab} />
        </div>

        {activeToken && tinkoffError && !tinkoffLoading && (
          <div className="error-banner">
            <Icon name="alert" size={18} />
            <div>
              <strong>
                {/401|403|Unauthenticated|Unauthorized/i.test(tinkoffError)
                  ? 'Неверный API-ключ'
                  : 'Ошибка загрузки данных'}
              </strong>
              <p>
                {/401|403|Unauthenticated|Unauthorized/i.test(tinkoffError)
                  ? 'Ключ не принят T-Invest API. Проверьте токен в настройках — возможно, он устарел или введён с ошибкой.'
                  : tinkoffError}
              </p>
            </div>
          </div>
        )}

        {tab === 'overview' && tinkoffLoading && <SkeletonDashboard />}

        {tab === 'overview' && !tinkoffLoading && (
          <div className="grid">
            <KpiRow P={P} iisDeduction={ryOpts.useIIS ? iisDeduction : 0} onOpenRY={() => setRyModal(true)} />

            {/* Main chart */}
            <div className="card col-8">
              <div className="card-head">
                <div>
                  <div className="card-title">Пассивный доход за 12 месяцев</div>
                  <div className="card-sub">
                    Выплаты по месяцам · {fmt.rubK(visTotal)}/год · {fmt.rubK(visTotal / 12)}/мес
                  </div>
                </div>
                <div className="legend">
                  <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--success)' }} /> Выплачено</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--primary)' }} /> Объявлено</span>
                  <span className="legend-item"><span className="legend-dot hatch" /> Прогноз</span>
                </div>
              </div>
              <PassiveIncomeChart months={P.months} tip={tip} setTip={setTip} />
              <div style={{ display: 'flex', gap: 0, marginTop: 14, borderTop: '1px solid var(--divider)', paddingTop: 16 }}>
                <SummaryStat label="Выплачено" value={fmt.rubK(P.sum.paid)} dot="var(--success)" />
                <SummaryStat label="Объявлено" value={fmt.rubK(P.sum.announced)} dot="var(--primary)" />
                <SummaryStat label="Прогноз" value={fmt.rubK(P.sum.forecast)} dot="var(--fg-faint)" hatch />
                <SummaryStat label="Итого за год" value={fmt.rubK(P.sum.total)} dot="var(--fg)" last />
              </div>
            </div>

            <Upcoming P={P} />
            <TopMovers title="Топ роста за день" data={P.gainers} up={true} />
            <TopMovers title="Топ падений за день" data={P.losers} up={false} />
            <HoldingsTable P={P} />
          </div>
        )}

        {tab === 'income' && (
          <EmptyState
            onBack={() => setTab('overview')}
            title="Календарь и прогноз выплат"
            text="Здесь появится детальный календарь купонов и дивидендов: помесячный прогноз поступлений, история выплат и сценарии реинвестирования. Мы уже работаем над этим разделом."
          />
        )}

        {tab === 'metrics' && (
          <EmptyState
            onBack={() => setTab('overview')}
            title="Расширенная аналитика"
            text="Скоро тут будут продвинутые метрики: доходность с учётом вводов и выводов средств (XIRR), волатильность, бета и сравнение портфеля с индексом Мосбиржи."
          />
        )}

        {tab === 'diversification' && (
          <EmptyState
            onBack={() => setTab('overview')}
            title="Анализ диверсификации"
            text="Мы покажем структуру портфеля по классам активов, секторам и эмитентам, оценим концентрацию риска и подскажем, как сбалансировать вложения."
          />
        )}
      </div>

      <ChartTip tip={tip} />
      <AddPortfolioModal open={modal} onClose={() => setModal(false)} onConnect={addPortfolio} />
      <RealYieldModal open={ryModal} onClose={() => setRyModal(false)} opts={ryOpts} setOpts={setRyOpts} totalValue={P.totalValue} invested={P.invested} />
    </div>
  );
}
