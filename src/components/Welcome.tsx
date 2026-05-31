'use client';
import { useState } from 'react';
import { Icon } from './icons';

interface WelcomeProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onDemo: () => void;
  onConnect: (data: { name: string; broker: string; key: string }) => void;
}

export default function Welcome({ theme, toggleTheme, onDemo, onConnect }: WelcomeProps) {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const valid = key.trim().length >= 8;

  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);
    setTimeout(() => onConnect({ name: '', broker: 'tinkoff', key: key.trim() }), 750);
  };

  return (
    <div className="welcome">
      <button className="icon-btn welcome-theme" onClick={toggleTheme} title="Сменить тему">
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
      </button>

      <div className="welcome-card">
        <div className="welcome-art">
          <div className="welcome-brand">
            <img className="brand-logo" src="/app-icon.png" alt="" draggable={false} />
            <span className="brand-name" style={{ fontSize: 17 }}>Инви</span>
          </div>
          <img className="welcome-cat" src="/cat-hero.png" alt="" draggable={false} />
          <div className="welcome-art-cap">
            <div className="welcome-art-title">Весь капитал — на одном экране</div>
            <div className="welcome-art-sub">Доходность, пассивный доход и аналитика по всем брокерским счетам сразу.</div>
          </div>
        </div>

        <div className="welcome-form">
          <div className="welcome-eyebrow">Первый запуск</div>
          <h1 className="welcome-h1">Подключите портфель</h1>
          <p className="welcome-p">Добавьте брокерский счёт по API-ключу — мы синхронизируем позиции и построим аналитику. Данные хранятся только в этом браузере.</p>

          <div className="welcome-fields">
            <label className="field">
              <span className="field-label">API-ключ Т-Инвестиций</span>
              <div className="input-wrap">
                <span className="input-ic"><Icon name="link" size={16} /></span>
                <input
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="t.xxxxxxxxxxxxxxxxxxxx"
                  spellCheck={false}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') submit(); }}
                />
                <button type="button" className="input-eye" onClick={() => setShow(s => !s)} title={show ? 'Скрыть' : 'Показать'}>
                  <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
              <span className="field-hint">Ключ хранится только в этом браузере и используется для чтения позиций.</span>
            </label>
          </div>

          <button
            className={'btn-primary welcome-submit' + (!valid || busy ? ' is-disabled' : '')}
            onClick={submit}
            disabled={!valid || busy}
          >
            {busy ? <><span className="spinner" /> Подключение…</> : <><Icon name="plus" size={16} stroke={2.2} /> Добавить портфель</>}
          </button>

          <div className="welcome-foot">
            <span>Нет ключа под рукой?</span>
            <button className="welcome-demo" onClick={onDemo}>Посмотреть демо <Icon name="chevron" size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
