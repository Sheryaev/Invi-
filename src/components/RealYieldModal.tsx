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

function NumInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <input
      type="number"
      min={0}
      step={1000}
      value={value || ''}
      placeholder={placeholder ?? '0'}
      onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
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

  const prevYear = new Date().getFullYear() - 1;
  const portfolioResult = totalValue - invested;
  const portfolioPct = invested > 0 ? (portfolioResult / invested) * 100 : 0;
  const iisDeduction = calcIISDeduction(opts);
  const totalResult = portfolioResult + (opts.useIIS ? iisDeduction : 0);
  const totalPct = invested > 0 ? (totalResult / invested) * 100 : 0;
  const totalUp = totalResult >= 0;

  const set = (k: keyof RYOpts, v: any) => setOpts({ ...opts, [k]: v });

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ry-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-ic" style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)' }}>
            <Icon name="settings" size={18} stroke={1.9} />
          </div>
          <div>
            <div className="modal-title">Настройки доходности</div>
            <div className="modal-sub">Инвестиционный результат с учётом ИИС</div>
          </div>
          <button className="modal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        {/* Результат портфеля */}
        <div className="ry-section">
          <div className="ry-section-title">Результат портфеля</div>
          <div className="ry-stat-row">
            <span>Стоимость сейчас</span>
            <span className="tnum">{fmt.rubK(totalValue)}</span>
          </div>
          <div className="ry-stat-row">
            <span>Пополнения (инвестировано)</span>
            <span className="tnum">{fmt.rubK(invested)}</span>
          </div>
          <div className="ry-stat-row">
            <span>Результат без ИИС</span>
            <span className={'tnum ' + (portfolioResult >= 0 ? 'ry-pos' : 'ry-neg')}>
              {fmt.rub(portfolioResult, { sign: true })} ({fmt.pct(portfolioPct, { sign: true })})
            </span>
          </div>
        </div>

        {/* Вычет ИИС */}
        <div className="ry-section">
          <div className="ry-section-title">Вычет ИИС типа А ({prevYear} год)</div>
          <div className="ry-input-row">
            <label>Взносы на ИИС за {prevYear} год</label>
            <NumInput value={opts.iisContribs} onChange={v => set('iisContribs', v)} placeholder="например 400 000" />
          </div>
          <div className="ry-input-row">
            <label>Уплаченный НДФЛ (необязательно)</label>
            <NumInput value={opts.ndflPaid} onChange={v => set('ndflPaid', v)} placeholder="0 = без ограничения" />
          </div>
          {iisDeduction > 0 && (
            <div className="ry-deduction">
              <span>Расчётный вычет: min({fmt.rubK(opts.iisContribs)}, 400 000 ₽) × 13%</span>
              <span>{fmt.rub(iisDeduction)}</span>
            </div>
          )}
        </div>

        {/* Тогл */}
        <div className="ry-section">
          <label className="ry-toggle" style={{ cursor: 'pointer' }}>
            <div className="ry-toggle-tx">
              <span className="ry-toggle-label">Учитывать вычет ИИС в результате</span>
              <span className="ry-toggle-note">добавить возврат налога к инвестиционному результату</span>
            </div>
            <Switch checked={opts.useIIS} onChange={v => set('useIIS', v)} />
          </label>

          {opts.useIIS && (
            <div className="ry-total-row">
              <span>Итоговый результат с ИИС</span>
              <span className={'tnum ' + (totalUp ? 'ry-pos' : 'ry-neg')}>
                {fmt.rub(totalResult, { sign: true })} ({fmt.pct(totalPct, { sign: true })})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
