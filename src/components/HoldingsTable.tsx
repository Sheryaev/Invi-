'use client';
import { useState } from 'react';
import type { Portfolio } from '@/types';
import { fmt } from '@/lib/format';
import { Icon, Tri } from './icons';

type SortKey = 'name' | 'price' | 'value' | 'pl';
type SortDir = 'asc' | 'desc';

export default function HoldingsTable({ P }: { P: Portfolio }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filtered = P.holdings.filter(h =>
    h.name.toLowerCase().includes(query.toLowerCase()) ||
    h.tkr.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let av = 0, bv = 0;
    if (sortKey === 'name') return sortDir === 'asc'
      ? a.name.localeCompare(b.name, 'ru')
      : b.name.localeCompare(a.name, 'ru');
    if (sortKey === 'price') { av = a.price; bv = b.price; }
    if (sortKey === 'value') { av = a.price * a.qty; bv = b.price * b.qty; }
    if (sortKey === 'pl') {
      av = (a.price - a.entry) / a.entry;
      bv = (b.price - b.entry) / b.entry;
    }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const Th = ({ label, k, right }: { label: string; k: SortKey; right?: boolean }) => (
    <button
      className={'htbl-th' + (sortKey === k ? ' active' : '') + (right ? ' right' : '')}
      onClick={() => handleSort(k)}
    >
      {label}
      <span className="htbl-caret">
        {sortKey === k ? <Tri up={sortDir === 'asc'} size={8} /> : <Icon name="sort" size={12} />}
      </span>
    </button>
  );

  return (
    <div className="card col-12 htbl-card">
      <div className="card-head htbl-head">
        <div className="card-title">Позиции</div>
        <div className="htbl-search">
          <Icon name="search" size={16} />
          <input
            placeholder="Поиск по имени или тикеру…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="htbl-clear" onClick={() => setQuery('')}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="htbl">
        <div className="htbl-row htbl-headrow">
          <Th label="Название" k="name" />
          <Th label="Цена" k="price" right />
          <Th label="Стоимость" k="value" right />
          <Th label="За всё время" k="pl" right />
        </div>

        {sorted.length === 0 && (
          <div className="htbl-empty">Ничего не найдено</div>
        )}

        {sorted.map((h, i) => {
          const value = h.price * h.qty;
          const plAbs = (h.price - h.entry) * h.qty;
          const plPct = ((h.price - h.entry) / h.entry) * 100;
          const up = plAbs >= 0;
          return (
            <div className="htbl-row" key={i}>
              <div className="htbl-asset">
                <div className="htbl-logo" style={{ background: h.logoUrl ? '#fff' : h.color }}>
                  {h.logoUrl ? (
                    <img
                      src={h.logoUrl}
                      alt={h.tkr}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }}
                      onError={e => {
                        const img = e.currentTarget;
                        img.style.display = 'none';
                        if (img.parentElement) {
                          img.parentElement.style.background = h.color;
                          img.parentElement.textContent = h.glyph;
                        }
                      }}
                    />
                  ) : h.glyph}
                </div>
                <div className="htbl-asset-tx">
                  <div className="htbl-name">{h.name}</div>
                  <div className="htbl-tkr">{h.tkr}</div>
                </div>
              </div>

              <div className="htbl-c right">
                <div className="htbl-price">
                  <span className="htbl-entry tnum">{fmt.price(h.entry)}</span>
                  <span className="htbl-arrow">→</span>
                  <span className="htbl-cur tnum">{fmt.price(h.price)}</span>
                </div>
              </div>

              <div className="htbl-c right">
                <div className="htbl-val tnum">{fmt.rubK(value)}</div>
                <div className="htbl-sub">{h.qty} шт.</div>
              </div>

              <div className="htbl-c right">
                <div className="htbl-pl tnum">{fmt.rub(plAbs, { sign: true })}</div>
                <div className={'htbl-sub ' + (up ? 'pos' : 'neg')}>
                  {fmt.pct(Math.abs(plPct), { sign: false })}{up ? ' ▲' : ' ▼'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
