/* Panels: Sidebar, Topbar, KPI cards, AllocationCard, TopAssets, Upcoming, Target, ChartTip */

/* ---------------- Sidebar ---------------- */
function Sidebar() {
  const nav = [
    { ic: "grid", label: "Обзор", active: true },
    { ic: "briefcase", label: "Портфель" },
    { ic: "coins", label: "Выплаты", badge: "6" },
    { ic: "pie", label: "Аналитика" },
    { ic: "calendar", label: "Календарь" },
  ];
  const nav2 = [
    { ic: "wallet", label: "Счета" },
    { ic: "settings", label: "Настройки" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon name="trend" size={19} stroke={2.1} /></div>
        <div>
          <div className="brand-name">Инви</div>
          <div className="brand-sub">Личный портфель</div>
        </div>
      </div>

      <div className="nav-label">Меню</div>
      {nav.map((n) => (
        <div key={n.label} className={"nav-item" + (n.active ? " active" : "")}>
          <Icon name={n.ic} size={19} />
          <span>{n.label}</span>
          {n.badge && <span className="ni-badge">{n.badge}</span>}
        </div>
      ))}

      <div className="nav-label">Управление</div>
      {nav2.map((n) => (
        <div key={n.label} className="nav-item">
          <Icon name={n.ic} size={19} />
          <span>{n.label}</span>
        </div>
      ))}

      <div className="sidebar-foot">
        <div className="upgrade">
          <div className="upgrade-title">Премиум-аналитика</div>
          <div className="upgrade-sub">Прогноз дохода на 3 года и налоговый калькулятор.</div>
          <button className="btn-primary" style={{ width: "100%" }}>Подключить</button>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Portfolio selector ---------------- */
function PortfolioSelector({ portfolios, value, onChange, onAdd, onRemove }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = portfolios.find((p) => p.id === value) || portfolios[0];
  return (
    <div className="psel" ref={ref}>
      <button className={"psel-trigger" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="psel-ic"><Icon name={cur.icon} size={18} stroke={1.9} /></span>
        <span className="psel-tx">
          <span className="psel-name">{cur.name}</span>
          <span className="psel-sub">{cur.sub}</span>
        </span>
        <Icon name="chevron" size={16}
          style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform .18s", color: "var(--fg-faint)", marginLeft: 4 }} />
      </button>
      {open && (
        <div className="psel-menu">
          <div className="psel-menu-label">Портфель для аналитики</div>
          {portfolios.map((p) => (
            <div key={p.id} className={"psel-item" + (p.id === value ? " active" : "")}
              onClick={() => { onChange(p.id); setOpen(false); }}>
              <span className="psel-ic sm"><Icon name={p.icon} size={16} stroke={1.9} /></span>
              <span className="psel-tx">
                <span className="psel-name">{p.name}</span>
                <span className="psel-sub">{p.custom ? p.sub + " · ключ " + p.keyMask : p.sub}</span>
              </span>
              {p.id === value && !p.custom && <Icon name="check" size={16} stroke={2.4} style={{ color: "var(--primary)", flexShrink: 0 }} />}
              {p.custom ? (
                <button className="psel-trash" title="Отключить портфель"
                  onClick={(e) => { e.stopPropagation(); onRemove(p); }}>
                  <Icon name="trash" size={15} />
                </button>
              ) : (
                <span className="psel-val tnum">{fmt.rubK(p.value)}</span>
              )}
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

/* ---------------- Add-portfolio modal (API key) ---------------- */
function AddPortfolioModal({ open, onClose, onConnect }) {
  const [broker, setBroker] = React.useState("tinkoff");
  const [name, setName] = React.useState("");
  const [key, setKey] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) { setBroker("tinkoff"); setName(""); setKey(""); setShow(false); setBusy(false); }
  }, [open]);
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  const valid = key.trim().length >= 8;

  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);
    // имитация подключения по API-ключу
    setTimeout(() => {
      onConnect({ name: name.trim(), broker, key: key.trim() });
    }, 700);
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
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
              <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)}
                placeholder="t.xxxxxxxxxxxxxxxxxxxx" autoFocus spellCheck={false}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
              <button type="button" className="input-eye" onClick={() => setShow((s) => !s)} title={show ? "Скрыть" : "Показать"}>
                <Icon name={show ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
            <span className="field-hint">Ключ хранится только в этом браузере и используется для чтения позиций.</span>
          </label>
        </div>

        <div className="modal-foot">
          <button className="btn-ghost" onClick={onClose}>Отмена</button>
          <button className={"btn-primary" + (!valid || busy ? " is-disabled" : "")} onClick={submit} disabled={!valid || busy}>
            {busy ? <><span className="spinner" /> Подключение…</> : <><Icon name="plus" size={15} stroke={2.2} /> Подключить</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Topbar ---------------- */
function ConnectionsMenu({ count, onAdd, onLogout }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="acct" ref={ref}>
      <button className={"icon-btn" + (open ? " is-active" : "")} onClick={() => setOpen((o) => !o)} title="Подключения">
        <Icon name="settings" size={18} />
      </button>
      {open && (
        <div className="acct-menu">
          <div className="conn-head">
            <span className="conn-status"><span className="conn-dot" /> Синхронизировано</span>
          </div>
          <div className="conn-count">
            <Icon name="link" size={15} />
            <span>{count} {plural(count, "счёт подключён", "счёта подключено", "счетов подключено")} · обновлено только что</span>
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
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function Topbar({ portfolios, portfolio, setPortfolio, onAdd, onRemove, onLogout, theme, toggleTheme, refreshing, lastUpd, doRefresh }) {
  const connected = portfolios.filter((p) => p.custom).length || (portfolios.length - 1);
  return (
    <header className="topbar">
      <div className="topbar-inner shell">
        <div className="brand-mini">
          <img className="brand-logo" src="assets/app-icon.png" alt="" draggable="false" />
          <span className="brand-name" style={{ fontSize: 17 }}>Инви</span>
        </div>

        <div className="topbar-div" />

        <PortfolioSelector portfolios={portfolios} value={portfolio}
          onChange={setPortfolio} onAdd={onAdd} onRemove={onRemove} />

        <div style={{ marginLeft: "auto" }} />

        {doRefresh && (
          <button className="btn-ghost refresh-btn" onClick={doRefresh} disabled={refreshing} title={refreshing ? "Обновление…" : "Обновлено " + lastUpd.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}>
            <span className={"upd-dot" + (refreshing ? " busy" : "")} />
            <Icon name="refresh" size={15} className={refreshing ? "spin" : ""} />
            <span className="refresh-tx">{refreshing ? "Обновление…" : "Обновлено " + lastUpd.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
          </button>
        )}

        <button className="icon-btn" onClick={toggleTheme} title="Сменить тему">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
        </button>
        <ConnectionsMenu count={connected} onAdd={onAdd} onLogout={onLogout} />
      </div>
    </header>
  );
}

/* ---------------- KPI cards (new layout) ---------------- */
function KpiCard({ icon, iconColor, label, value, delta, deltaUp, sub, action, onClick, valueColor }) {
  return (
    <div className={"card col-3 kpi2" + (onClick ? " kpi2-click" : "")}
      onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="kpi2-head">
        <span className="kpi2-ic" style={{ color: iconColor }}><Icon name={icon} size={15} stroke={2} /></span>
        <span className="kpi2-label">{label}</span>
        {!action && (onClick
          ? <span className="kpi2-info" title="Детализация"><Icon name="chevron" size={15} stroke={2} /></span>
          : <span className="kpi2-info" title="Подробнее"><Icon name="info" size={14} stroke={1.7} /></span>)}
        {action}
      </div>
      <div className="kpi2-valrow">
        <span className="kpi2-val tnum" style={valueColor ? { color: valueColor } : null}>{value}</span>
        {delta != null && (
          <span className={"delta " + (deltaUp ? "up" : "down")}>
            <Tri up={deltaUp} /> {delta}
          </span>
        )}
      </div>
      <div className="kpi2-sub">{sub}</div>
    </div>
  );
}

/* ---------------- Result card: profit ₽ + return % + daily ---------------- */
function ResultCard({ P, profit, hidden, onOpenRY }) {
  const up = profit >= 0;
  const dayUp = P.dayChange >= 0;
  return (
    <div className="card col-6 kpi2 result-card">
      <div className="kpi2-head">
        <span className="kpi2-ic" style={{ color: up ? "var(--success)" : "var(--danger)" }}>
          <Icon name="trend" size={15} stroke={2} />
        </span>
        <span className="kpi2-label">Результат портфеля</span>
        <button className="kpi2-eye kpi2-gear" onClick={(e) => { e.stopPropagation(); onOpenRY(); }} title="Настройки доходности">
          <Icon name="settings" size={16} />
        </button>
      </div>
      <div className="result-body">
        <div className="result-main">
          <span className="result-big tnum">
            {hidden ? "••• •••" : fmt.rubK(profit, { sign: true }).replace("₽", up ? "+₽" : "₽")}
          </span>
          <span className={"delta " + (up ? "up" : "down")} style={{ fontSize: 14 }}>
            <Tri up={up} size={10} /> {fmt.pct(P.totalReturnPct, { sign: true })} <span className="delta-cap">доходность</span>
          </span>
        </div>
        <div className="result-divider" />
        <div className="result-side">
          <div className="rs-row">
            <span className="rs-k"><span className="result-pill"><Icon name="calendar" size={12} /> Сегодня</span></span>
            <span className="rs-v">
              <span className="rs-v tnum">{hidden ? "•••" : fmt.rub(P.dayChange, { sign: true })}</span>
              <span className="ry-dotsep">·</span>
              <span className={dayUp ? "ry-pos" : "ry-neg"}>{fmt.pct(P.dayChangePct, { sign: true })}</span>
            </span>
          </div>
          <div className="rs-row">
            <span className="rs-k">Вложено</span>
            <span className="rs-v tnum">{hidden ? "••• •••" : fmt.rubK(P.invested)}</span>
          </div>
          <div className="rs-row">
            <span className="rs-k">Стоимость сейчас</span>
            <span className="rs-v tnum">{hidden ? "••• •••" : fmt.rubK(P.totalValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiRow({ P, ry, onOpenRY }) {
  const [hidden, setHidden] = React.useState(false);
  const profit = P.totalValue - P.invested;
  return (
    <>
      <KpiCard
        action={
          <button className="kpi2-eye" onClick={(e) => { e.stopPropagation(); setHidden((h) => !h); }} title={hidden ? "Показать" : "Скрыть"}>
            <Icon name={hidden ? "eyeOff" : "eye"} size={16} />
          </button>
        }
        icon="briefcase" iconColor="var(--primary)"
        label="Стоимость"
        value={hidden ? "••• •••" : fmt.rubK(P.totalValue)}
        sub={<span>{hidden ? "••• ••• вложено" : fmt.rubK(P.invested) + " вложено"}</span>}
      />
      <ResultCard P={P} profit={profit} hidden={hidden} onOpenRY={onOpenRY} />
      <KpiCard
        icon="coins" iconColor="var(--primary)"
        label="Пассивный доход"
        value={fmt.pct(P.yieldPct)}
        delta={"+" + P.passiveYoY + "%"} deltaUp={true}
        sub={<span>{fmt.rubK(P.sum.total)}/год <span className="ry-dotsep">·</span> {fmt.rubK(P.sum.total / 12)}/мес</span>}
      />
    </>
  );
}

/* ---------------- Real yield: switch + detail modal ---------------- */
function Switch({ checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      className={"switch" + (checked ? " on" : "") + (disabled ? " disabled" : "")}
      onClick={() => !disabled && onChange(!checked)}>
      <span className="switch-knob" />
    </button>
  );
}

function RealYieldModal({ open, onClose, prof, opts, setOpts }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;

  const ry = window.realYield(prof, opts);
  const toggle = (k) => setOpts({ ...opts, [k]: !opts[k] });

  const TOGGLES = [
    { k: "reinvestDiv", label: "Реинвестировать дивиденды", note: "сложный процент на выплаты" },
    { k: "useIIS", label: "Учитывать вычет ИИС", note: ry.hasIIS ? "налоговый вычет 13%" : "счёт не на ИИС", disabled: !ry.hasIIS },
    { k: "reinvestTax", label: "Реинвестировать вычет", note: "вкладывать возврат налога", disabled: !ry.hasIIS || !opts.useIIS },
  ];

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ry-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-ic" style={{ background: "var(--secondary-soft)", color: "var(--secondary)" }}><Icon name="settings" size={18} stroke={1.9} /></div>
          <div>
            <div className="modal-title">Настройки доходности</div>
            <div className="modal-sub">{prof.name} · с учётом вашей стратегии</div>
          </div>
          <button className="modal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        <div className="ry-hero">
          <span className="ry-hero-val tnum" style={{ color: ry.total >= 0 ? "var(--success)" : "var(--danger)" }}>
            {fmt.pct(ry.total, { sign: true })}
          </span>
          <span className="ry-hero-cap">
            <span className="tnum">{fmt.pct(ry.market, { sign: true })}</span> рынок
            <span className="ry-dotsep">·</span>
            <span className={"tnum " + (ry.strategy >= 0 ? "ry-pos" : "ry-neg")}>{fmt.pct(ry.strategy, { sign: true })}</span> стратегия
          </span>
        </div>

        <div className="ry-settings">
          {TOGGLES.map((tg) => (
            <label className={"ry-toggle" + (tg.disabled ? " is-disabled" : "")} key={tg.k}>
              <div className="ry-toggle-tx">
                <span className="ry-toggle-label">{tg.label}</span>
                <span className="ry-toggle-note">{tg.note}</span>
              </div>
              <Switch checked={!!opts[tg.k] && !tg.disabled} disabled={tg.disabled} onChange={() => toggle(tg.k)} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Welcome / onboarding (no portfolios yet) ---------------- */
function Welcome({ onConnect, onDemo, theme, toggleTheme }) {
  const [key, setKey] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const valid = key.trim().length >= 8;

  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);
    setTimeout(() => onConnect({ name: "", broker: "tinkoff", key: key.trim() }), 750);
  };

  return (
    <div className="welcome">
      <button className="icon-btn welcome-theme" onClick={toggleTheme} title="Сменить тему">
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
      </button>

      <div className="welcome-card">
        {/* left: illustration */}
        <div className="welcome-art">
          <div className="welcome-brand">
            <img className="brand-logo" src="assets/app-icon.png" alt="" draggable="false" />
            <span className="brand-name" style={{ fontSize: 17 }}>Инви</span>
          </div>
          <img className="welcome-cat" src="assets/cat-hero.png" alt="" draggable="false" />
          <div className="welcome-art-cap">
            <div className="welcome-art-title">Весь капитал — на одном экране</div>
            <div className="welcome-art-sub">Доходность, пассивный доход и аналитика по всем брокерским счетам сразу.</div>
          </div>
        </div>

        {/* right: form */}
        <div className="welcome-form">
          <div className="welcome-eyebrow">Первый запуск</div>
          <h1 className="welcome-h1">Подключите портфель</h1>
          <p className="welcome-p">Добавьте брокерский счёт по API-ключу — мы синхронизируем позиции и построим аналитику. Данные хранятся только в этом браузере.</p>

          <div className="welcome-fields">
            <label className="field">
              <span className="field-label">API-ключ</span>
              <div className="input-wrap">
                <span className="input-ic"><Icon name="link" size={16} /></span>
                <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)}
                  placeholder="t.xxxxxxxxxxxxxxxxxxxx" spellCheck={false} autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
                <button type="button" className="input-eye" onClick={() => setShow((s) => !s)} title={show ? "Скрыть" : "Показать"}>
                  <Icon name={show ? "eyeOff" : "eye"} size={16} />
                </button>
              </div>
              <span className="field-hint">Ключ хранится только в этом браузере и используется для чтения позиций.</span>
            </label>
          </div>

          <button className={"btn-primary welcome-submit" + (!valid || busy ? " is-disabled" : "")} onClick={submit} disabled={!valid || busy}>
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

/* ---------------- Empty / coming-soon state ---------------- */
function EmptyState({ title, text, onBack }) {
  return (
    <div className="empty">
      <img className="empty-img" src="assets/cat.png" alt="" draggable="false" />
      <div className="empty-body">
        <span className="empty-badge"><span className="empty-dot" /> Скоро</span>
        <div className="empty-title">{title}</div>
        <p className="empty-text">{text}</p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={onBack}><Icon name="grid" size={15} /> Вернуться в обзор</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tabs nav ---------------- */
function TabsNav({ tabs, active, onChange }) {
  return (
    <div className="segtabs-wrap">
      <nav className="segtabs">
        {tabs.map((tb) => (
          <button key={tb.id} className={"segtab" + (active === tb.id ? " active" : "")}
            onClick={() => onChange(tb.id)}>
            {tb.icon && <Icon name={tb.icon} size={16} stroke={1.9} />}
            <span>{tb.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ---------------- Metric tile ---------------- */
function MetricTile({ label, value, sub, accent, delta, deltaUp }) {
  return (
    <div className="card col-4 mtile">
      <div className="mtile-label">{label}</div>
      <div className="mtile-valrow">
        <span className="mtile-val tnum" style={accent ? { color: accent } : null}>{value}</span>
        {delta != null && (
          <span className={"delta " + (deltaUp ? "up" : "down")}><Tri up={deltaUp} /> {delta}</span>
        )}
      </div>
      {sub && <div className="mtile-sub">{sub}</div>}
    </div>
  );
}

function MetricsGrid({ P }) {
  const profit = P.totalValue - P.invested;
  const avgPay = Math.round(P.sum.total / 12);
  const y1 = P.yieldDividend, y2 = P.yieldCoupon;
  return (
    <>
      <MetricTile label="Общая доходность" value={fmt.pct(P.totalReturnPct, { sign: true })}
        accent="var(--success)" delta={fmt.pct(P.monthReturnPct, { sign: true })} deltaUp={P.monthReturnPct >= 0}
        sub="за всё время · к вложенному" />
      <MetricTile label="Прибыль" value={fmt.rubK(profit)}
        sub={fmt.rub(profit) + " к телу портфеля"} />
      <MetricTile label="Изменение за день" value={fmt.rub(P.dayChange, { sign: true })}
        accent={P.dayChangePct >= 0 ? "var(--success)" : "var(--danger)"}
        delta={fmt.pct(P.dayChangePct, { sign: true })} deltaUp={P.dayChangePct >= 0}
        sub="переоценка позиций" />
      <MetricTile label="Доходность портфеля" value={fmt.pct(P.yieldPct)}
        sub={"купоны " + y2 + "% · дивиденды " + y1 + "%"} />
      <MetricTile label="Средняя выплата в месяц" value={fmt.rubK(avgPay)}
        sub={"из " + fmt.rubK(P.sum.total) + " за год"} />
      <MetricTile label="Рост пассивного дохода" value={"+" + P.passiveYoY + "%"}
        accent="var(--success)" sub="год к году" />
    </>
  );
}

/* ---------------- Yield composition ---------------- */
function YieldComposition({ P }) {
  const c = P.yieldCoupon, d = P.yieldDividend;
  const tot = c + d;
  return (
    <div className="card col-4">
      <div className="card-head">
        <div className="card-title">Состав доходности</div>
      </div>
      <div className="kpi2-valrow" style={{ marginBottom: 18 }}>
        <span className="kpi2-val tnum">{fmt.pct(P.yieldPct)}</span>
        <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>годовых</span>
      </div>
      <div className="ycomp-bar">
        <div style={{ width: (c / tot * 100) + "%", background: "var(--primary)" }} />
        <div style={{ width: (d / tot * 100) + "%", background: "var(--success)" }} />
      </div>
      <div className="ycomp-rows">
        <div className="ycomp-row">
          <span className="legend-dot" style={{ background: "var(--primary)" }} />
          <span className="ycomp-nm">Купоны облигаций</span>
          <span className="tnum" style={{ fontWeight: 600 }}>{c}%</span>
        </div>
        <div className="ycomp-row">
          <span className="legend-dot" style={{ background: "var(--success)" }} />
          <span className="ycomp-nm">Дивиденды акций</span>
          <span className="tnum" style={{ fontWeight: 600 }}>{d}%</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Diversification ---------------- */
function DiversificationView({ P }) {
  const alloc = P.allocation;
  const sum = (cls) => alloc.filter((a) => a.cls === cls).reduce((s, a) => s + a.pct, 0);
  const mix = [
    { name: "Акции", pct: sum("stock"), color: "var(--success)" },
    { name: "Облигации", pct: sum("bond"), color: "var(--primary)" },
    { name: "Денежные средства", pct: sum("cash"), color: "var(--fg-faint)" },
  ];
  const top5 = P.topAssets.slice(0, 5);
  const top5Share = 58; // концентрация топ-5 позиций, %
  return (
    <>
      {/* asset-class donut */}
      <div className="card col-5">
        <div className="card-head">
          <div>
            <div className="card-title">Структура портфеля</div>
            <div className="card-sub">По классам активов</div>
          </div>
          <span className="chip flat"><Icon name="pie" size={13} style={{ marginRight: 2 }} /> {alloc.length}</span>
        </div>
        <div className="donut-wrap">
          <Donut data={alloc} centerTop={fmt.rubK(P.totalValue)} centerBottom="всего" />
          <div className="alloc-list">
            {alloc.map((s) => (
              <div className="alloc-row" key={s.name}>
                <span className="legend-dot" style={{ background: s.color, borderRadius: "50%" }} />
                <span className="nm">{s.name}</span>
                <span className="pc tnum">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* stocks/bonds split + concentration */}
      <div className="card col-7">
        <div className="card-head">
          <div>
            <div className="card-title">Акции, облигации и кэш</div>
            <div className="card-sub">Баланс риска и диверсификация</div>
          </div>
        </div>
        <div className="mix-bar">
          {mix.map((m) => (
            <div key={m.name} style={{ width: m.pct + "%", background: m.color }} title={m.name + " " + m.pct + "%"} />
          ))}
        </div>
        <div className="mix-legend">
          {mix.map((m) => (
            <div className="mix-leg" key={m.name}>
              <span className="legend-dot" style={{ background: m.color }} />
              <div>
                <div className="mix-pct tnum">{m.pct}%</div>
                <div className="mix-nm">{m.name}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="conc">
          <div className="conc-row">
            <span>Концентрация топ-5 позиций</span>
            <span className="tnum" style={{ fontWeight: 700 }}>{top5Share}%</span>
          </div>
          <div className="bar-track" style={{ marginTop: 10 }}>
            <div className="bar-fill" style={{ width: top5Share + "%" }} />
          </div>
          <div className="conc-tags">
            {top5.map((a, i) => (
              <span className="conc-tag" key={i}>{a.name}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Allocation card ---------------- */
function AllocationCard({ P }) {
  return (
    <div className="card col-4">
      <div className="card-head">
        <div>
          <div className="card-title">Распределение</div>
          <div className="card-sub">По типам активов</div>
        </div>
        <span className="chip flat"><Icon name="pie" size={13} style={{ marginRight: 2 }} /> 5</span>
      </div>
      <div className="donut-wrap">
        <Donut data={P.allocation} centerTop={fmt.rubK(P.totalValue)} centerBottom="всего" />
        <div className="alloc-list">
          {P.allocation.map((s) => (
            <div className="alloc-row" key={s.name}>
              <span className="legend-dot" style={{ background: s.color, borderRadius: "50%" }} />
              <span className="nm">{s.name}</span>
              <span className="pc tnum">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Top assets ---------------- */
function TopAssets({ P }) {
  const max = Math.max(...P.topAssets.map((a) => a.income));
  return (
    <div className="card col-12">
      <div className="card-head">
        <div>
          <div className="card-title">Топ активов по доходу</div>
          <div className="card-sub">Годовой купонный и дивидендный доход</div>
        </div>
        <button className="btn-ghost"><Icon name="filter" size={14} /> Фильтр</button>
      </div>
      <div>
        {P.topAssets.map((a, i) => {
          const isBond = a.kind === "Облигация";
          return (
            <div className="row" key={i}>
              <div className="tkr" style={{ background: isBond ? "var(--primary-soft)" : "var(--success-soft)", color: a.color }}>
                {a.tkr.length > 4 ? a.tkr.slice(0, 4) : a.tkr}
              </div>
              <div className="row-main">
                <div className="row-name">{a.name}</div>
                <div className="row-sub">
                  <span className="chip flat" style={{ fontSize: 11, padding: "1px 7px" }}>{a.kind}</span>
                  <span style={{ marginLeft: 8 }}>{isBond ? "купон" : "дивиденды"} {a.yield}%</span>
                </div>
              </div>
              <div style={{ flex: 1, maxWidth: 130 }}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: (a.income / max) * 100 + "%", background: a.color }} />
                </div>
              </div>
              <div className="row-right" style={{ minWidth: 78 }}>
                <div className="row-amt tnum">{fmt.rub(a.income)}</div>
                <div className="row-amt-sub">в год</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Top movers (gainers / losers) ---------------- */
function TopMovers({ title, data, up }) {
  return (
    <div className="card col-6">
      <div className="card-head">
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div className="card-title">{title}</div>
          <span className="kpi2-info"><Icon name="info" size={14} stroke={1.7} /></span>
        </div>
        <button className="card-ic-btn" title="Открыть"><Icon name="briefcase" size={15} /></button>
      </div>
      <div>
        {data.map((a, i) => (
          <div className="row" key={i}>
            <div className="tkr" style={{ background: "var(--surface-2)", color: a.color }}>
              {a.tkr.length > 4 ? a.tkr.slice(0, 4) : a.tkr}
            </div>
            <div className="row-main">
              <div className="row-name">{a.name}</div>
              <div className="row-sub" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: ".02em" }}>{a.tkr}</div>
            </div>
            <div className="row-right">
              <div className="row-amt tnum">{fmt.rubFull(a.price)}</div>
              <div className={"delta " + (up ? "up" : "down")} style={{ justifyContent: "flex-end", marginTop: 3 }}>
                <Tri up={up} /> {fmt.pct(Math.abs(a.pct))} <span style={{ opacity: .8, fontWeight: 500 }}>({fmt.rubFull(a.chg, { sign: true })})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Upcoming payments ---------------- */
function Upcoming({ P, className = "" }) {
  return (
    <div className={"card " + className}>
      <div className="card-head">
        <div>
          <div className="card-title">Ближайшие выплаты</div>
          <div className="card-sub">Прогноз на июнь–июль</div>
        </div>
        <span className="chip pri">{P.upcoming.length}</span>
      </div>
      <div>
        {P.upcoming.map((u, i) => (
          <div className="row" key={i}>
            <div className="daypill">
              <div className="d tnum">{u.day}</div>
              <div className="m">{u.mon}</div>
            </div>
            <div className="row-main">
              <div className="row-name">{u.name}</div>
              <div className="row-sub">
                <span className="legend-dot" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6, background: u.kind === "div" ? "var(--success)" : "var(--primary)", borderRadius: "50%" }} />
                {u.type}
              </div>
            </div>
            <div className="row-right">
              <div className="row-amt tnum">{fmt.rub(u.amt, { sign: true })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Target progress ---------------- */
function TargetCard({ P }) {
  const proj = P.sum.total;
  const paid = P.sum.paid;
  const projPct = Math.min(100, (proj / P.target) * 100);
  const paidPct = Math.min(100, (paid / P.target) * 100);
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Цель по доходу</div>
          <div className="card-sub">{fmt.rubK(P.target)} пассивного дохода в год</div>
        </div>
        <span className="chip up">{Math.round(projPct)}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span className="kpi-value tnum" style={{ fontSize: 24 }}>{fmt.rubK(proj)}</span>
        <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>/ {fmt.rubK(P.target)} прогноз</span>
      </div>
      {/* dual progress */}
      <div className="bar-track" style={{ height: 11, position: "relative" }}>
        <div className="bar-fill" style={{ width: projPct + "%", background: "var(--primary-soft)", position: "absolute", inset: 0 }} />
        <div className="bar-fill" style={{ width: paidPct + "%", background: "var(--primary)", position: "absolute", inset: 0 }} />
      </div>
      <div className="legend" style={{ marginTop: 14 }}>
        <span className="legend-item"><span className="legend-dot" style={{ background: "var(--primary)" }} /> Получено {fmt.rubK(paid)}</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: "var(--primary-soft)" }} /> Прогноз {fmt.rubK(proj - paid)}</span>
      </div>
    </div>
  );
}

/* ---------------- Sector breakdown (minimal table + share bars) ---------------- */
function SectorBreakdown({ P }) {
  const total = P.sectors.reduce((s, x) => s + x.value, 0);
  const rows = P.sectors
    .map((s) => {
      const income = s.value - s.invested;
      return { ...s, income, pct: income / s.invested * 100, share: s.value / total * 100 };
    })
    .sort((a, b) => b.value - a.value);
  const maxShare = rows[0].share;

  return (
    <div className="card col-12">
      <div className="card-head">
        <div>
          <div className="card-title">Портфель</div>
          <div className="card-sub">Распределение по секторам · {fmt.rubK(total)}</div>
        </div>
        <span className="chip flat">{P.sectors.length} секторов</span>
      </div>

      <div className="sect-table">
        <div className="sect-row sect-head">
          <span>Название</span>
          <span>Доля</span>
          <span className="ta-r">Стоимость / Вложено <Icon name="arrowDown" size={13} style={{ verticalAlign: "-2px", color: "var(--fg-faint)" }} /></span>
          <span className="ta-r">Доход</span>
        </div>
        {rows.map((s, i) => {
          const up = s.income >= 0;
          return (
            <div className="sect-row" key={i}>
              <div className="sect-name">
                <span className="sect-ic" style={{ background: colorSoft(s.color), color: s.color }}>
                  <Icon name="coins" size={16} stroke={1.9} />
                </span>
                <span className="sect-tx">
                  <span className="row-name">{s.name}</span>
                  <span className="row-sub">{s.count} шт.</span>
                </span>
              </div>
              <div className="sect-share-cell">
                <span className="sect-pct-big tnum">{s.share.toFixed(1)}<span className="sect-pct-sign">%</span></span>
                <div className="sect-bar">
                  <div className="sect-bar-fill" style={{ width: (s.share / maxShare * 100) + "%", background: s.color }} />
                </div>
              </div>
              <div className="ta-r">
                <div className="row-amt tnum">{fmt.rubFull(s.value)}</div>
                <div className="row-amt-sub tnum">{fmt.rubFull(s.invested)}</div>
              </div>
              <div className="ta-r">
                <div className={"sect-inc tnum " + (up ? "pos" : "neg")}>{fmt.rubFull(s.income, { sign: true })}</div>
                <div className={"delta " + (up ? "up" : "down")} style={{ justifyContent: "flex-end", marginTop: 3 }}>
                  <Tri up={up} /> {fmt.pct(Math.abs(+s.pct.toFixed(2)))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function colorSoft(c) {
  if (c.startsWith("var(")) {
    const map = { "var(--primary)": "var(--primary-soft)", "var(--success)": "var(--success-soft)", "var(--secondary)": "var(--secondary-soft)" };
    return map[c] || "var(--surface-2)";
  }
  return c + "26"; // hex + alpha
}

/* ---------------- Chart tooltip ---------------- */
function ChartTip({ tip }) {
  if (!tip) return null;
  const d = tip.d;
  const total = d.paid + d.announced + d.forecast;
  const rows = [
    { k: "Выплачено", v: d.paid,      c: "var(--success)", hatch: false },
    { k: "Объявлено", v: d.announced, c: "var(--primary)", hatch: false },
    { k: "Прогноз",   v: d.forecast,  c: null,             hatch: true },
  ].filter((r) => r.v > 0);
  return (
    <div className="tip" style={{ left: tip.x, top: tip.y - 14, opacity: 1 }}>
      <div className="tip-title" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>{d.m} 2026</span>
      </div>
      {rows.map((r) => (
        <div className="tip-row" key={r.k}>
          <span className="tip-k">
            <span className={"legend-dot" + (r.hatch ? " hatch" : "")} style={r.hatch ? {} : { background: r.c }} /> {r.k}
          </span>
          <span className="tip-v tnum">{fmt.rub(r.v)}</span>
        </div>
      ))}
      <div className="tip-row" style={{ borderTop: "1px solid var(--divider)", paddingTop: 6, marginTop: 7 }}>
        <span className="tip-k" style={{ color: "var(--fg)" }}>Итого</span>
        <span className="tip-v tnum">{fmt.rub(total)}</span>
      </div>
    </div>
  );
}

/* ---------------- Holdings table (positions + search + sort) ---------------- */
function HoldingsTable({ P }) {
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState({ key: "value", dir: "desc" });

  const rows = (P.holdings || []).map((h) => {
    const value = h.price * h.qty;
    const pl = (h.price - h.entry) * h.qty;
    const plPct = (h.price - h.entry) / h.entry * 100;
    return { ...h, value, pl, plPct };
  });

  const ql = q.trim().toLowerCase();
  const filtered = rows.filter((r) =>
    !ql || r.name.toLowerCase().includes(ql) || r.tkr.toLowerCase().includes(ql)
  );

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    if (sort.key === "name") { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); return sort.dir === "asc" ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0); }
    if (sort.key === "price") { av = a.price; bv = b.price; }
    else if (sort.key === "value") { av = a.value; bv = b.value; }
    else { av = a.plPct; bv = b.plPct; }
    return sort.dir === "asc" ? av - bv : bv - av;
  });

  const setSortKey = (key) => setSort((s) =>
    s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" ? "asc" : "desc" });

  const SortHead = ({ k, children, align }) => (
    <button className={"htbl-th" + (align === "right" ? " right" : "") + (sort.key === k ? " active" : "")} onClick={() => setSortKey(k)}>
      <span>{children}</span>
      <span className="htbl-caret">
        <Icon name={sort.key === k ? (sort.dir === "asc" ? "arrowUp" : "arrowDown") : "sort"} size={13} stroke={2} />
      </span>
    </button>
  );

  const totalValue = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div className="card col-12 htbl-card">
      <div className="card-head htbl-head">
        <div>
          <div className="card-title">Позиции</div>
          <div className="card-sub">{rows.length} активов · {fmt.rubK(totalValue)}</div>
        </div>
        <div className="htbl-search">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по названию или тикеру…" />
          {q && <button className="htbl-clear" onClick={() => setQ("")}><Icon name="close" size={14} /></button>}
        </div>
      </div>

      <div className="htbl">
        <div className="htbl-row htbl-headrow">
          <SortHead k="name">Название</SortHead>
          <SortHead k="price" align="right">Цена</SortHead>
          <SortHead k="value" align="right">Стоимость</SortHead>
          <SortHead k="pl" align="right">За всё время</SortHead>
        </div>

        {sorted.map((r) => {
          const up = r.pl >= 0;
          return (
            <div className="htbl-row" key={r.tkr + r.name}>
              <div className="htbl-asset">
                <span className="htbl-logo" style={{ background: r.color }}>{r.glyph}</span>
                <span className="htbl-asset-tx">
                  <span className="htbl-name">{r.name}</span>
                  <span className="htbl-tkr">{r.tkr}</span>
                </span>
              </div>
              <div className="htbl-c right">
                <span className="htbl-price tnum">
                  <span className="htbl-entry">{fmt.price(r.entry)}</span>
                  <span className="htbl-arrow">→</span>
                  <span className="htbl-cur">{fmt.price(r.price)}</span>
                </span>
              </div>
              <div className="htbl-c right">
                <div className="htbl-val tnum">{fmt.rubFull(r.value)}</div>
                <div className="htbl-sub tnum">{r.qty.toLocaleString("ru-RU")} шт.</div>
              </div>
              <div className="htbl-c right">
                <div className="htbl-pl tnum">{fmt.rubFull(r.pl, { sign: true })}</div>
                <div className={"htbl-sub tnum " + (up ? "pos" : "neg")}>{Math.abs(r.plPct).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="htbl-empty">Ничего не найдено по запросу «{q}»</div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, KpiRow, AllocationCard, TopAssets, TopMovers, Upcoming, TargetCard, ChartTip, AddPortfolioModal, SectorBreakdown, TabsNav, MetricsGrid, YieldComposition, DiversificationView, EmptyState, Welcome, RealYieldModal, HoldingsTable });
