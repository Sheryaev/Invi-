'use client';
import { useRef, useEffect, useState } from 'react';
import { Icon } from './icons';
import PortfolioSelector from './PortfolioSelector';
import type { PortfolioProfile } from '@/types';

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function ConnectionsMenu({ count, onAdd, onLogout }: { count: number; onAdd: () => void; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="acct" ref={ref}>
      <button className={'icon-btn' + (open ? ' is-active' : '')} onClick={() => setOpen(o => !o)} title="Подключения">
        <Icon name="settings" size={18} />
      </button>
      {open && (
        <div className="acct-menu">
          <div className="conn-head">
            <span className="conn-status"><span className="conn-dot" /> Синхронизировано</span>
          </div>
          <div className="conn-count">
            <Icon name="link" size={15} />
            <span>{count} {plural(count, 'счёт подключён', 'счёта подключено', 'счетов подключено')} · обновлено только что</span>
          </div>
          <div className="psel-divider" />
          <button className="acct-item" onClick={() => { setOpen(false); onAdd(); }}>
            <Icon name="plus" size={17} stroke={2.1} /> Подключить счёт по ключу
          </button>
          <button className="acct-item danger" onClick={() => { setOpen(false); onLogout(); }}>
            <Icon name="logout" size={17} /> Отключить все счета
          </button>
        </div>
      )}
    </div>
  );
}

interface TopbarProps {
  portfolios: PortfolioProfile[];
  portfolio: string;
  setPortfolio: (id: string) => void;
  onAdd: () => void;
  onRemove: (p: PortfolioProfile) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  refreshing: boolean;
  lastUpd: Date;
  doRefresh: () => void;
}

export default function Topbar({ portfolios, portfolio, setPortfolio, onAdd, onRemove, onLogout, theme, toggleTheme, refreshing, lastUpd, doRefresh }: TopbarProps) {
  const connected = portfolios.filter(p => p.custom).length || (portfolios.length - 1);
  const updTime = lastUpd.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="topbar">
      <div className="topbar-inner shell">
        <div className="brand-mini">
          <img className="brand-logo" src="/app-icon.png" alt="" draggable={false} />
          <span className="brand-name">Инви</span>
        </div>
        <div className="topbar-div" />
        <PortfolioSelector portfolios={portfolios} value={portfolio} onChange={setPortfolio} onAdd={onAdd} onRemove={onRemove} />
        <div style={{ marginLeft: 'auto' }} />
        <button
          className="btn-ghost refresh-btn"
          onClick={doRefresh}
          disabled={refreshing}
          title={refreshing ? 'Обновление…' : 'Обновлено ' + updTime}
        >
          <span className={'upd-dot' + (refreshing ? ' busy' : '')} />
          <Icon name="refresh" size={15} className={refreshing ? 'spin' : ''} />
          <span className="refresh-tx">{refreshing ? 'Обновление…' : 'Обновлено ' + updTime}</span>
        </button>
        <button className="icon-btn" onClick={toggleTheme} title="Сменить тему">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <ConnectionsMenu count={connected} onAdd={onAdd} onLogout={onLogout} />
      </div>
    </header>
  );
}
