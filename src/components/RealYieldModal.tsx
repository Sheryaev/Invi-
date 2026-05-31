'use client';
import { useEffect } from 'react';
import { Icon } from './icons';
import { calcYearDeduction, calcIISDeduction } from '@/lib/real-yield';
import type { RYOpts } from '@/types';
import { fmt } from '@/lib/format';
// totalValue and invested kept in props for future use but not rendered directly

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={'switch' + (checked ? ' on' : '')}
      onClick={() => onChange(!checked)}
    >
      <span className="switch-knob" />
    </button>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  opts: RYOpts;
  setOpts: (o: RYOpts) => void;
  totalValue: number;
  invested: number;
  depositsByYear: Record<string, number>;
}

export default function RealYieldModal({ open, onClose, opts, setOpts, totalValue, invested, depositsByYear }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const iisDeduction = calcIISDeduction(depositsByYear);

  // Только годы где есть пополнения, отсортированные по убыванию
  const years = Object.keys(depositsByYear)
    .map(Number)
    .filter(y => depositsByYear[String(y)] > 0)
    .sort((a, b) => b - a);

  const hasData = years.length > 0;

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ry-modal" role="dialog" aria-modal="true">

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

          {/* ИИС секция */}
          <div className="ry-iis-block">
            <div className="ry-iis-header">
              <div>
                <div className="ry-iis-title">Налоговый вычет ИИС</div>
                <div className="ry-iis-hint">
                  {hasData
                    ? 'Пополнения по годам из истории операций'
                    : 'Нет данных о пополнениях — подключите реальный портфель'}
                </div>
              </div>
              <Switch
                checked={opts.useIIS && hasData}
                onChange={v => setOpts({ ...opts, useIIS: v })}
              />
            </div>

            {hasData && (
              <>
                <div className="ry-years-table">
                  <div className="ry-years-head">
                    <span>Год</span>
                    <span>Пополнения</span>
                    <span>Вычет 13%</span>
                  </div>
                  {years.map(year => {
                    const contrib = depositsByYear[String(year)] ?? 0;
                    const deduct  = calcYearDeduction(contrib);
                    return (
                      <div className="ry-year-row" key={year}>
                        <span className="ry-year-label">{year}</span>
                        <span className="tnum">{fmt.rubK(contrib)}</span>
                        <span className="tnum ry-pos">+{fmt.rub(deduct)}</span>
                      </div>
                    );
                  })}
                </div>

                {iisDeduction > 0 && (
                  <div className="ry-iis-total">
                    <span>Итого вычетов</span>
                    <span className="tnum ry-pos">+{fmt.rub(iisDeduction)}</span>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
