'use client';
import { useState } from 'react';
import { Icon, Tri } from './icons';
import type { Portfolio } from '@/types';
import { fmt } from '@/lib/format';

function KpiCard({ icon, iconColor, label, value, delta, deltaUp, sub, action, onClick }: {
  icon: string; iconColor?: string; label: string; value: string;
  delta?: string; deltaUp?: boolean; sub?: React.ReactNode;
  action?: React.ReactNode; onClick?: () => void;
}) {
  return (
    <div className={'card col-3' + (onClick ? ' kpi2-click' : '')} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="kpi2-head">
        <span className="kpi2-ic" style={{ color: iconColor }}><Icon name={icon as any} size={15} stroke={2} /></span>
        <span className="kpi2-label">{label}</span>
        {!action && (onClick
          ? <span className="kpi2-info" title="Детализация"><Icon name="chevron" size={15} stroke={2} /></span>
          : <span className="kpi2-info" title="Подробнее"><Icon name="info" size={14} stroke={1.7} /></span>
        )}
        {action}
      </div>
      <div className="kpi2-valrow">
        <span className="kpi2-val tnum">{value}</span>
        {delta != null && (
          <span className={'delta ' + (deltaUp ? 'up' : 'down')}>
            <Tri up={!!deltaUp} /> {delta}
          </span>
        )}
      </div>
      <div className="kpi2-sub">{sub}</div>
    </div>
  );
}

function ResultCard({ P, profit, iisDeduction, hidden, onOpenRY }: {
  P: Portfolio; profit: number; iisDeduction: number; hidden: boolean; onOpenRY: () => void;
}) {
  const displayProfit = profit + iisDeduction;
  const displayPct = P.invested > 0 ? (displayProfit / P.invested) * 100 : P.totalReturnPct;
  const up = displayProfit >= 0;
  const dayUp = P.dayChange >= 0;

  return (
    <div className="card col-6 kpi-result">
      <div className="kpi2-head">
        <span className="kpi2-ic" style={{ color: up ? 'var(--success)' : 'var(--danger)' }}>
          <Icon name="trend" size={15} stroke={2} />
        </span>
        <span className="kpi2-label">Результат портфеля{iisDeduction > 0 ? ' + ИИС' : ''}</span>
        <button className="kpi2-eye kpi2-gear" onClick={e => { e.stopPropagation(); onOpenRY(); }} title="Настройки доходности">
          <Icon name="settings" size={16} />
        </button>
      </div>
      <div className="result-body">
        <div className="result-main">
          <span className="result-big tnum">
            {hidden ? '••• •••' : (up ? '+' : '−') + fmt.rubK(Math.abs(displayProfit))}
          </span>
          <span className={'delta ' + (up ? 'up' : 'down')} style={{ fontSize: 14 }}>
            <Tri up={up} size={10} /> {fmt.pct(displayPct, { sign: true })} <span className="delta-cap">доходность</span>
          </span>
        </div>
        <div className="result-divider" />
        <div className="result-side">
          <div className="rs-row">
            <span className="rs-k"><span className="result-pill"><Icon name="calendar" size={12} /> Сегодня</span></span>
            <span className="rs-v">
              <span className="rs-v tnum">{hidden ? '•••' : fmt.rub(P.dayChange, { sign: true })}</span>
              <span className="ry-dotsep">·</span>
              <span className={dayUp ? 'ry-pos' : 'ry-neg'}>{fmt.pct(P.dayChangePct, { sign: true })}</span>
            </span>
          </div>
          <div className="rs-row">
            <span className="rs-k">Вложено</span>
            <span className="rs-v tnum">{hidden ? '••• •••' : fmt.rubK(P.invested)}</span>
          </div>
          <div className="rs-row">
            <span className="rs-k">Стоимость сейчас</span>
            <span className="rs-v tnum">{hidden ? '••• •••' : fmt.rubK(P.totalValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiRowProps {
  P: Portfolio;
  iisDeduction: number;
  onOpenRY: () => void;
}

export default function KpiRow({ P, iisDeduction, onOpenRY }: KpiRowProps) {
  const [hidden, setHidden] = useState(false);
  const profit = P.totalValue - P.invested;

  return (
    <>
      <KpiCard
        action={
          <button className="kpi2-eye" onClick={e => { e.stopPropagation(); setHidden(h => !h); }} title={hidden ? 'Показать' : 'Скрыть'}>
            <Icon name={hidden ? 'eyeOff' : 'eye'} size={16} />
          </button>
        }
        icon="briefcase" iconColor="var(--primary)"
        label="Стоимость"
        value={hidden ? '••• •••' : fmt.rubK(P.totalValue)}
        sub={<span>{hidden ? '••• ••• вложено' : fmt.rubK(P.invested) + ' вложено'}</span>}
      />
      <ResultCard P={P} profit={profit} iisDeduction={iisDeduction} hidden={hidden} onOpenRY={onOpenRY} />
      <KpiCard
        icon="coins" iconColor="var(--primary)"
        label="Пассивный доход"
        value={fmt.pct(P.yieldPct)}
        delta={'+' + P.passiveYoY + '%'} deltaUp={true}
        sub={<span>{fmt.rubK(P.sum.total)}/год <span className="ry-dotsep">·</span> {fmt.rubK(P.sum.total / 12)}/мес</span>}
      />
    </>
  );
}
