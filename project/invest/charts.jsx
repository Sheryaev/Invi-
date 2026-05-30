/* Charts: PassiveIncomeChart (stacked bars, факт/прогноз), Donut, AreaSpark */
const { useState, useRef, useLayoutEffect, useEffect } = React;

/* measure container width */
function useMeasure() {
  const ref = useRef(null);
  const [w, setW] = useState(720);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0].contentRect.width;
      if (cw > 0) setW(cw);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function niceMax(v) {
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / step;
  let m;
  if (n <= 2) m = 2; else if (n <= 4) m = 4; else if (n <= 5) m = 5; else m = 10;
  return m * step;
}

/* ---------------- Passive income — stacked bars ---------------- */
function PassiveIncomeChart({ months, chartType = "stacked", tip, setTip }) {
  const [ref, W] = useMeasure();
  const H = 300;
  const padL = 52, padR = 14, padT = 14, padB = 30;
  const plotW = Math.max(10, W - padL - padR);
  const plotH = H - padT - padB;

  const SEGMENTS = [
    { key: "paid",      label: "Выплачено", fill: "var(--success)", soft: "var(--success-soft)" },
    { key: "announced", label: "Объявлено", fill: "var(--primary)", soft: "var(--primary-soft)" },
    { key: "forecast",  label: "Прогноз",   fill: "url(#hatchF)",   soft: "transparent" },
  ];

  const totals = months.map((d) => d.paid + d.announced + d.forecast);
  const ymax = niceMax(Math.max(...totals) * 1.08);
  const y = (v) => padT + plotH - (v / ymax) * plotH;
  const band = plotW / months.length;
  const grouped = chartType === "grouped";
  const bw = band * (grouped ? 0.62 : 0.5);

  const ticks = 4;

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={W} height={H} style={{ display: "block" }}
        onMouseLeave={() => setTip(null)}>
        <defs>
          <pattern id="hatchF" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="var(--surface-3)" opacity="0.5" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--fg-faint)" strokeWidth="2.2" opacity="0.7" />
          </pattern>
        </defs>

        {/* gridlines + y labels */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (ymax / ticks) * i;
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={padL} y1={yy} x2={W - padR} y2={yy}
                stroke="var(--divider)" strokeWidth="1" />
              <text x={padL - 9} y={yy + 4} textAnchor="end"
                fill="var(--fg-faint)" fontSize="11" className="tnum">
                {v === 0 ? "0" : (v / 1000) + "к"}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {months.map((d, i) => {
          const cx = padL + band * i + band / 2;
          const hov = tip && tip.i === i;
          const onEnter = (e) => setTip({ i, x: e.clientX, y: e.clientY, d });
          const total = d.paid + d.announced + d.forecast;

          if (grouped) {
            const present = SEGMENTS.filter((s) => d[s.key] > 0);
            const n = Math.max(1, present.length);
            const gw = (bw - (n - 1) * 3) / n;
            let gx = cx - bw / 2;
            return (
              <g key={i} onMouseMove={onEnter} onMouseEnter={onEnter} style={{ cursor: "pointer" }}>
                <rect x={cx - band / 2} y={padT} width={band} height={plotH} fill="transparent" />
                {present.map((s) => {
                  const h = (d[s.key] / ymax) * plotH;
                  const rx = <rect key={s.key} x={gx} y={y(d[s.key])} width={gw} height={h} rx="3"
                    fill={s.fill} stroke={s.key === "forecast" ? "var(--fg-faint)" : "none"}
                    strokeWidth="1" strokeDasharray={s.key === "forecast" ? "2 2" : "0"}
                    opacity={hov ? 1 : 0.95} />;
                  gx += gw + 3;
                  return rx;
                })}
              </g>
            );
          }

          // stacked: paid (bottom) → announced → forecast (top)
          let acc = 0;
          return (
            <g key={i} onMouseMove={onEnter} onMouseEnter={onEnter} style={{ cursor: "pointer" }}>
              <rect x={cx - band / 2} y={padT} width={band} height={plotH} fill="transparent" />
              {SEGMENTS.map((s) => {
                const v = d[s.key];
                if (v <= 0) return null;
                const h = (v / ymax) * plotH;
                const yy = y(acc + v);
                acc += v;
                return (
                  <rect key={s.key} x={cx - bw / 2} y={yy} width={bw} height={h} rx="3"
                    fill={s.fill} stroke={s.key === "forecast" ? "var(--fg-faint)" : "none"}
                    strokeWidth="1" strokeDasharray={s.key === "forecast" ? "2 2" : "0"}
                    opacity={hov ? 1 : 0.95} />
                );
              })}
              {hov && total > 0 && (
                <rect x={cx - bw / 2 - 3} y={y(total) - 3} width={bw + 6}
                  height={(total / ymax) * plotH + 6} rx="5" fill="none"
                  stroke="var(--divider-strong)" strokeWidth="1" />
              )}
            </g>
          );
        })}

        {/* x labels */}
        {months.map((d, i) => {
          const cx = padL + band * i + band / 2;
          const hov = tip && tip.i === i;
          return (
            <text key={i} x={cx} y={H - 10} textAnchor="middle"
              fill={hov ? "var(--fg)" : "var(--fg-muted)"} fontSize="11.5"
              fontWeight={hov ? 700 : 500}>
              {d.m}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Donut ---------------- */
function Donut({ data, size = 132, thickness = 16, centerTop, centerBottom }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const gap = 1.4; // deg gap → px
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--track)" strokeWidth={thickness} />
      {data.map((s, i) => {
        const len = (s.pct / 100) * c;
        const gpx = (gap / 360) * c;
        const dash = `${Math.max(0, len - gpx)} ${c - Math.max(0, len - gpx)}`;
        const off = -acc;
        acc += len;
        return (
          <circle key={i} cx={cx} cy={cx} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={dash} strokeDashoffset={off}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cx})`} />
        );
      })}
      <text x={cx} y={cx - 2} textAnchor="middle" className="tnum"
        fill="var(--fg)" fontSize="19" fontWeight="700" letterSpacing="-0.02em">
        {centerTop}
      </text>
      <text x={cx} y={cx + 15} textAnchor="middle"
        fill="var(--fg-muted)" fontSize="11">
        {centerBottom}
      </text>
    </svg>
  );
}

/* ---------------- Area sparkline ---------------- */
function AreaSpark({ data, w = 200, h = 56, color = "var(--primary)", id = "sp" }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pad = 4;
  const sx = (i) => (i / (data.length - 1)) * (w - pad * 2) + pad;
  const sy = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${sx(data.length - 1)} ${h} L ${sx(0)} ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- Value history area chart (with axes) ---------------- */
function ValueChart({ data, months }) {
  const [ref, W] = useMeasure();
  const H = 290;
  const padL = 54, padR = 14, padT = 16, padB = 28;
  const plotW = Math.max(10, W - padL - padR);
  const plotH = H - padT - padB;
  const [hov, setHov] = useState(null);

  const min = Math.min(...data) * 0.985;
  const max = Math.max(...data) * 1.01;
  const x = (i) => padL + (i / (data.length - 1)) * plotW;
  const y = (v) => padT + (1 - (v - min) / (max - min || 1)) * plotH;
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${x(data.length - 1)} ${padT + plotH} L ${x(0)} ${padT + plotH} Z`;
  const ticks = 4;

  const labels = months || data.map(() => "");

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={W} height={H} style={{ display: "block" }}
        onMouseLeave={() => setHov(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rel = e.clientX - rect.left - padL;
          let i = Math.round((rel / plotW) * (data.length - 1));
          i = Math.max(0, Math.min(data.length - 1, i));
          setHov({ i, x: e.clientX, y: e.clientY });
        }}>
        <defs>
          <linearGradient id="vh-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.26" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = min + (max - min) / ticks * (ticks - i);
          const yy = padT + (plotH / ticks) * i;
          return (
            <g key={i}>
              <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="var(--divider)" strokeWidth="1" />
              <text x={padL - 9} y={yy + 4} textAnchor="end" fill="var(--fg-faint)" fontSize="11" className="tnum">
                {v.toFixed(1).replace(".", ",")}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#vh-grad)" />
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {hov && (
          <g>
            <line x1={x(hov.i)} y1={padT} x2={x(hov.i)} y2={padT + plotH} stroke="var(--divider-strong)" strokeWidth="1" />
            <circle cx={x(hov.i)} cy={y(data[hov.i])} r="5" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2.5" />
          </g>
        )}
        {labels.map((m, i) => (
          (i % 2 === 0 || i === labels.length - 1) ? (
            <text key={i} x={x(i)} y={H - 9} textAnchor="middle" fill="var(--fg-muted)" fontSize="11">{m}</text>
          ) : null
        ))}
      </svg>
      {hov && (
        <div className="tip" style={{ left: hov.x, top: hov.y - 14, opacity: 1, minWidth: 120 }}>
          <div className="tip-title">{labels[hov.i]} 2026</div>
          <div className="tip-row" style={{ marginTop: 6 }}>
            <span className="tip-k">Стоимость</span>
            <span className="tip-v tnum">₽{data[hov.i].toFixed(2).replace(".", ",")} млн</span>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PassiveIncomeChart, Donut, AreaSpark, ValueChart });
