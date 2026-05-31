'use client';
import { useEffect } from 'react';
import { Icon } from './icons';
import { calcIISDeduction } from '@/lib/real-yield';
import type { RYOpts } from '@/types';
import { fmt } from '@/lib/format';

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={'switch' + (checked ? ' on' : '')}
      onClick={() => onChange(!checked)}
    />
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  opts: RYOpts;
  setOpts: (o: RYOpts) => void;
  totalValue: number;
  invested: number;
}

export default function RealYieldModal({ open, onClose, opts, setOpts, totalValue, invested }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const prevYear     = new Date().getFullYear() - 1;
  const baseResult   = totalValue - invested;
  const iisDeduction = calcIISDeduction(opts.iisContribs);
  const totalResult  = baseResult + (opts.useIIS ? iisDeduction : 0);
  const totalPct     = invested > 0 ? (totalResult / invested) * 100 : 0;
  const up           = totalResult >= 0;

  const set = (k: keyof RYOpts, v: any) => setOpts({ ...opts, [k]: v });

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ry-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="modal-head">
          <div className="modal-ic" style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)' }}>
            <Icon name="settings" size={18} stroke={1.9} />
          </div>
          <div>
            <div className="modal-title">Настройки доходности</div>
            <div className="modal-sub">Инвестиционный результат</div>
          </div>
          <button className="modal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        <div className="ry-body">
          {/* Итоговый результат */}
          <div className="ry-result-hero">
            <div className="ry-result-val tnum" style={{ color: up ? 'var(--success)' : 'var(--danger)' }}>
              {fmt.rub(totalResult, { sign: true })}
            </div>
            <div className="ry-result-pct tnum" style={{ color: up ? 'var(--success)' : 'var(--danger)' }}>
              {fmt.pct(totalPct, { sign: true })}
            </div>
            <div className="ry-result-sub">
              {opts.useIIS && iisDeduction > 0 ? 'с учётом вычета ИИС' : 'без вычета ИИС'}
            </div>
          </div>

          {/* Разбивка */}
          <div className="ry-breakdown">
            <div className="ry-br-row">
              <span>Стоимость портфеля</span>
              <span className="tnum">{fmt.rubK(totalValue)}</span>
            </div>
            <div className="ry-br-row">
              <span>Пополнено</span>
              <span className="tnum">−{fmt.rubK(invested)}</span>
            </div>
            <div className="ry-br-row ry-br-sep">
              <span>Результат портфеля</span>
              <span className={'tnum ' + (baseResult >= 0 ? 'ry-pos' : 'ry-neg')}>
                {fmt.rub(baseResult, { sign: true })}
              </span>
            </div>
            {opts.useIIS && iisDeduction > 0 && (
              <div className="ry-br-row">
                <span>Вычет ИИС за {prevYear} г.</span>
                <span className="tnum ry-pos">+{fmt.rub(iisDeduction)}</span>
              </div>
            )}
          </div>

          {/* Поле ввода + тогл */}
          <div className="ry-iis-block">
            <div className="ry-iis-header">
              <span className="ry-iis-title">Вычет ИИС за {prevYear} год</span>
              <Switch checked={opts.useIIS} onChange={v => set('useIIS', v)} />
            </div>
            <div className="ry-iis-field">
              <label className="ry-iis-label">Взносы на ИИС в {prevYear} году</label>
              <div className="ry-iis-input-wrap">
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={opts.iisContribs || ''}
                  placeholder="0"
                  onChange={e => set('iisContribs', Math.max(0, Number(e.target.value) || 0))}
                  className="ry-iis-input tnum"
                />
                <span className="ry-iis-currency">₽</span>
              </div>
            </div>
            {opts.iisContribs > 0 && (
              <div className="ry-iis-calc">
                min({fmt.rubK(opts.iisContribs)}, 400 000 ₽) × 13% = <strong>{fmt.rub(iisDeduction)}</strong>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
