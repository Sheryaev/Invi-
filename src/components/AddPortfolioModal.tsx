'use client';
import { useState, useEffect } from 'react';
import { Icon } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onConnect: (data: { name: string; broker: string; key: string }) => void;
}

export default function AddPortfolioModal({ open, onClose, onConnect }: Props) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setKey(''); setShow(false); setBusy(false); }
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  const valid = key.trim().length >= 8;

  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);
    setTimeout(() => onConnect({ name: '', broker: 'tinkoff', key: key.trim() }), 700);
  };

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-ic"><Icon name="key" size={19} stroke={1.9} /></div>
          <div>
            <div className="modal-title">Подключить портфель</div>
            <div className="modal-sub">Добавьте брокерский счёт по API-ключу — данные синхронизируются автоматически.</div>
          </div>
          <button className="modal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="field-label">API-ключ</span>
            <div className="input-wrap">
              <span className="input-ic"><Icon name="link" size={16} /></span>
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="t.xxxxxxxxxxxxxxxxxxxx"
                autoFocus
                spellCheck={false}
                onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              />
              <button type="button" className="input-eye" onClick={() => setShow(s => !s)} title={show ? 'Скрыть' : 'Показать'}>
                <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
              </button>
            </div>
            <span className="field-hint">Ключ хранится только в этом браузере и используется для чтения позиций.</span>
          </label>
        </div>

        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose}>Отмена</button>
          <button
            className={'btn-primary' + (!valid || busy ? ' is-disabled' : '')}
            onClick={submit}
            disabled={!valid || busy}
          >
            {busy ? <><span className="spinner" /> Подключение…</> : <><Icon name="plus" size={15} stroke={2.2} /> Подключить</>}
          </button>
        </div>
      </div>
    </div>
  );
}
