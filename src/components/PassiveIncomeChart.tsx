'use client';
import { useRef, useLayoutEffect, useState } from 'react';
import type { MonthData, TipState } from '@/types';
import { fmt } from '@/lib/format';

function useMeasure(): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      const cw = entries[0].contentRect.width;
      if (cw > 0) setW(cw);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function niceMax(v: number) {
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / step;
  let m: number;
  if (n <= 2) m = 2; else if (n <= 4) m = 4; else if (n <= 5) m = 5; else m = 10;
  return m * step;
}

interface Props {
  months: MonthData[];
  tip: TipState | null;
  setTip: (tip: TipState | null) => void;
}

export default function PassiveIncomeChart({ months, tip, setTip }: Props) {
  const [ref, W] = useMeasure();
  const H = 300, padL = 52, padR = 14, padT = 14, padB = 30;
  const plotW = Math.max(10, W - padL - padR);
  const plotH = H - padT - padB;

  const SEGMENTS = [
    { key: 'paid',      label: 'Выплачено', fill: 'var(--success)' },
    { key: 'announced', label: 'Объявлено', fill: 'var(--primary)' },
    { key: 'forecast',  label: 'Прогноз',   fill: 'url(#hatchF)' },
  ] as const;

  const totals = months.map(d => d.paid + d.announced + d.forecast);
  const maxTot = Math.max(...totals, 1);
  const ymax = niceMax(maxTot * 1.08);
  const y = (v: number) => padT + plotH - (v / ymax) * plotH;
  const band = plotW / months.length;
  const bw = band * 0.5;
  const ticks = 4;

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg width={W} height={H} style={{ display: 'block' }} onMouseLeave={() => setTip(null)}>
        <defs>
          <pattern id="hatchF" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="var(--surface-3)" opacity="0.5" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--fg-faint)" strokeWidth="2.2" opacity="0.7" />
          </pattern>
        </defs>

        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (ymax / ticks) * i;
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--divider)" strokeWidth="1" />
              <text x={padL - 9} y={yy + 4} textAnchor="end" fill="var(--fg-faint)" fontSize="11" className="tnum">
                {v === 0 ? '0' : (v / 1000) + 'к'}
              </text>
            </g>
          );
        })}

        {months.map((d, i) => {
          const cx = padL + band * i + band / 2;
          const hov = tip && tip.i === i;
          const total = d.paid + d.announced + d.forecast;
          const onEnter = (e: React.MouseEvent) => setTip({ i, x: e.clientX, y: e.clientY, d });

          let acc = 0;
          return (
            <g key={i} onMouseMove={onEnter} onMouseEnter={onEnter} style={{ cursor: 'pointer' }}>
              <rect x={cx - band / 2} y={padT} width={band} height={plotH} fill="transparent" />
              {SEGMENTS.map(s => {
                const v = d[s.key];
                if (v <= 0) return null;
                const h = (v / ymax) * plotH;
                const yy = y(acc + v);
                acc += v;
                return (
                  <rect key={s.key} x={cx - bw / 2} y={yy} width={bw} height={h} rx="3"
                    fill={s.fill}
                    stroke={s.key === 'forecast' ? 'var(--fg-faint)' : 'none'}
                    strokeWidth="1"
                    strokeDasharray={s.key === 'forecast' ? '2 2' : '0'}
                    opacity={hov ? 1 : 0.95}
                  />
                );
              })}
              {hov && total > 0 && (
                <rect x={cx - bw / 2 - 3} y={y(total) - 3} width={bw + 6}
                  height={(total / ymax) * plotH + 6} rx="5" fill="none"
                  stroke="var(--divider-strong)" strokeWidth="1" />
              )}
            </g>
          );
        })}

        {months.map((d, i) => {
          const cx = padL + band * i + band / 2;
          const hov = tip && tip.i === i;
          return (
            <text key={i} x={cx} y={H - 10} textAnchor="middle"
              fill={hov ? 'var(--fg)' : 'var(--fg-muted)'}
              fontSize="11.5" fontWeight={hov ? 700 : 500}>
              {d.m}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function ChartTip({ tip }: { tip: TipState | null }) {
  if (!tip) return null;
  const { d, x, y } = tip;
  const total = d.paid + d.announced + d.forecast;
  return (
    <div className="tip" style={{ left: x, top: y - 14, opacity: 1 }}>
      <div className="tip-title">{d.m}</div>
      {d.paid > 0 && (
        <div className="tip-row">
          <span className="tip-k"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--success)', display: 'inline-block', marginRight: 4 }} />Выплачено</span>
          <span className="tip-v tnum">{fmt.rubK(d.paid)}</span>
        </div>
      )}
      {d.announced > 0 && (
        <div className="tip-row">
          <span className="tip-k"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--primary)', display: 'inline-block', marginRight: 4 }} />Объявлено</span>
          <span className="tip-v tnum">{fmt.rubK(d.announced)}</span>
        </div>
      )}
      {d.forecast > 0 && (
        <div className="tip-row">
          <span className="tip-k"><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--fg-faint)', display: 'inline-block', marginRight: 4 }} />Прогноз</span>
          <span className="tip-v tnum">{fmt.rubK(d.forecast)}</span>
        </div>
      )}
      <div className="tip-row" style={{ borderTop: '1px solid var(--divider)', marginTop: 6, paddingTop: 6 }}>
        <span className="tip-k">Итого</span>
        <span className="tip-v tnum">{fmt.rubK(total)}</span>
      </div>
    </div>
  );
}
