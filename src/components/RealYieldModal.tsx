'use client';
import { useEffect } from 'react';
import { Icon } from './icons';
import { realYield } from '@/lib/real-yield';
import type { PortfolioProfile, RYOpts } from '@/types';
import { fmt } from '@/lib/format';

function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={'switch' + (checked ? ' on' : '') + (disabled ? ' disabled' : '')}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span className="switch-knob" />
    </button>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  prof: PortfolioProfile;
  opts: RYOpts;
  setOpts: (o: RYOpts) => void;
}

export default function RealYieldModal({ open, onClose, prof, opts, setOpts }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const ry = realYield(prof, opts);
  const toggle = (k: keyof RYOpts) => setOpts({ ...opts, [k]: !opts[k] });

  const TOGGLES: Array<{ k: keyof RYOpts; label: string; note: string; disabled?: boolean }> = [
    { k: 'reinvestDiv', label: 'Реинвестировать дивиденды', note: 'сложный процент на выплаты' },
    { k: 'useIIS', label: 'Учитывать вычет ИИС', note: ry.hasIIS ? 'налоговый вычет 13%' : 'счёт не на ИИС', disabled: !ry.hasIIS },
    { k: 'reinvestTax', label: 'Реинвестировать вычет', note: 'вкладывать возврат налога', disabled: !ry.hasIIS || !opts.useIIS },
  ];

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ry-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-ic" style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)' }}>
            <Icon name="settings" size={18} stroke={1.9} />
          </div>
          <div>
            <div className="modal-title">Настройки доходности</div>
            <div className="modal-sub">{prof.name} · с учётом вашей стратегии</div>
          </div>
          <button className="modal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        <div className="ry-hero">
          <span className="ry-hero-val tnum" style={{ color: ry.total >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt.pct(ry.total, { sign: true })}
          </span>
          <span className="ry-hero-cap">
            <span className="tnum">{fmt.pct(ry.market, { sign: true })}</span> рынок
            <span className="ry-dotsep">·</span>
            <span className={'tnum ' + (ry.strategy >= 0 ? 'ry-pos' : 'ry-neg')}>{fmt.pct(ry.strategy, { sign: true })}</span> стратегия
          </span>
        </div>

        <div className="ry-settings">
          {TOGGLES.map(tg => (
            <label className={'ry-toggle' + (tg.disabled ? ' is-disabled' : '')} key={tg.k}>
              <div className="ry-toggle-tx">
                <span className="ry-toggle-label">{tg.label}</span>
                <span className="ry-toggle-note">{tg.note}</span>
              </div>
              <Switch
                checked={!!opts[tg.k] && !tg.disabled}
                disabled={tg.disabled}
                onChange={() => toggle(tg.k)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
