'use client';
import type { Portfolio } from '@/types';
import { fmt } from '@/lib/format';

export default function Upcoming({ P }: { P: Portfolio }) {
  return (
    <div className="card col-4">
      <div className="card-head">
        <div>
          <div className="card-title">Ближайшие выплаты</div>
          <div className="card-sub">Прогноз поступлений</div>
        </div>
      </div>
      {P.upcoming.map((u, i) => (
        <div className="row" key={i}>
          <div className="daypill">
            <div className="d">{u.day}</div>
            <div className="m">{u.mon}</div>
          </div>
          <div className="row-main">
            <div className="row-name">{u.name}</div>
            <div className="row-sub">{u.type}</div>
          </div>
          <div className="row-right">
            <div className="row-amt tnum">{fmt.rubK(u.amt)}</div>
            <div className="row-amt-sub">
              <span className={'chip ' + (u.kind === 'div' ? 'up' : 'pri')} style={{ fontSize: 11 }}>
                {u.kind === 'div' ? 'Дивиденды' : 'Купон'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
