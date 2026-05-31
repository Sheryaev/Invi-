'use client';
import type { Mover } from '@/types';
import { fmt } from '@/lib/format';
import { Tri } from './icons';

interface Props {
  title: string;
  data: Mover[];
  up: boolean;
}

export default function TopMovers({ title, data, up }: Props) {
  return (
    <div className="card col-6">
      <div className="card-head">
        <div className="card-title">{title}</div>
      </div>
      {data.map((m, i) => (
        <div className="row" key={i}>
          <div className="tkr" style={{ background: m.color + '22', color: m.color }}>
            {m.tkr.slice(0, 4)}
          </div>
          <div className="row-main">
            <div className="row-name">{m.name}</div>
            <div className="row-sub tnum">{fmt.price(m.price)}</div>
          </div>
          <div className="row-right">
            <div className={'delta ' + (up ? 'up' : 'down')} style={{ justifyContent: 'flex-end' }}>
              <Tri up={up} /> {fmt.pct(Math.abs(m.pct), { sign: false })}
            </div>
            <div className="row-amt-sub tnum" style={{ color: 'var(--fg-muted)', marginTop: 3 }}>
              {(m.chg > 0 ? '+' : '') + fmt.rub(m.chg)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
