'use client';
import { useRef, useEffect, useState } from 'react';
import { Icon } from './icons';
import type { PortfolioProfile } from '@/types';
import { fmt } from '@/lib/format';

interface Props {
  portfolios: PortfolioProfile[];
  value: string;
  onChange: (id: string) => void;
  onAdd: () => void;
  onRemove: (p: PortfolioProfile) => void;
}

export default function PortfolioSelector({ portfolios, value, onChange, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const cur = portfolios.find(p => p.id === value) || portfolios[0];

  return (
    <div className="psel" ref={ref}>
      <button className={'psel-trigger' + (open ? ' open' : '')} onClick={() => setOpen(o => !o)}>
        <span className="psel-ic"><Icon name={cur.icon as any} size={18} stroke={1.9} /></span>
        <span className="psel-tx">
          <span className="psel-name">{cur.name}</span>
          <span className="psel-sub">{cur.sub}</span>
        </span>
        <Icon name="chevron" size={16} style={{ transform: open ? 'rotate(270deg)' : 'rotate(90deg)', transition: 'transform .18s', color: 'var(--fg-faint)', marginLeft: 4 }} />
      </button>

      {open && (
        <div className="psel-menu">
          <div className="psel-menu-label">Портфель для аналитики</div>
          {portfolios.map(p => (
            <div
              key={p.id}
              className={'psel-item' + (p.id === value ? ' active' : '')}
              onClick={() => { onChange(p.id); setOpen(false); }}
            >
              <span className="psel-ic sm"><Icon name={p.icon as any} size={16} stroke={1.9} /></span>
              <span className="psel-tx">
                <span className="psel-name">{p.name}</span>
                <span className="psel-sub">{p.custom ? p.sub + ' · ключ ' + p.keyMask : p.sub}</span>
              </span>
              {p.id === value && !p.custom && <Icon name="check" size={16} stroke={2.4} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              {p.custom
                ? <button className="psel-trash" title="Отключить портфель" onClick={e => { e.stopPropagation(); onRemove(p); }}>
                    <Icon name="trash" size={15} />
                  </button>
                : <span className="psel-val tnum">{fmt.rubK(p.value)}</span>
              }
            </div>
          ))}
          <div className="psel-divider" />
          <button className="psel-add" onClick={() => { setOpen(false); onAdd(); }}>
            <span className="psel-add-ic"><Icon name="plus" size={16} stroke={2.2} /></span>
            Добавить портфель
          </button>
        </div>
      )}
    </div>
  );
}
