'use client';

function S({ w, h, r, style }: { w?: string; h?: number; r?: number; style?: React.CSSProperties }) {
  return (
    <div
      className="skel"
      style={{ width: w ?? '100%', height: h ?? 14, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

function SkCard({ col, children, style }: { col: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={`card col-${col}`} style={style}>
      {children}
    </div>
  );
}

function SkRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: '1px solid var(--divider)' }}>
      <S w="44px" h={44} r={10} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <S w="60%" h={13} />
        <S w="35%" h={11} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="70px" h={13} />
        <S w="48px" h={18} r={8} />
      </div>
    </div>
  );
}

function SkHoldingRow() {
  return (
    <div className="htbl-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <S w="42px" h={42} r={21} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
          <S w="55%" h={13} />
          <S w="30%" h={11} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="120px" h={13} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="80px" h={13} />
        <S w="50px" h={11} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="70px" h={13} />
        <S w="45px" h={11} />
      </div>
    </div>
  );
}

export default function SkeletonDashboard() {
  return (
    <div className="grid">
      {/* KPI card 1 — Стоимость */}
      <SkCard col={3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
          <S w="22px" h={22} r={6} />
          <S w="90px" h={13} />
        </div>
        <S w="60%" h={28} style={{ marginBottom: 12 }} />
        <S w="45%" h={12} />
      </SkCard>

      {/* KPI card 2 — Результат (col-6) */}
      <SkCard col={6}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
          <S w="22px" h={22} r={6} />
          <S w="130px" h={13} />
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <S w="55%" h={34} style={{ marginBottom: 10 }} />
            <S w="40%" h={13} />
          </div>
          <div style={{ width: 1, background: 'var(--divider)', alignSelf: 'stretch', margin: '0 4px' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <S w="60px" h={12} />
                <S w="80px" h={12} />
              </div>
            ))}
          </div>
        </div>
      </SkCard>

      {/* KPI card 3 — Пассивный доход */}
      <SkCard col={3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
          <S w="22px" h={22} r={6} />
          <S w="110px" h={13} />
        </div>
        <S w="50%" h={28} style={{ marginBottom: 12 }} />
        <S w="70%" h={12} />
      </SkCard>

      {/* Chart card */}
      <SkCard col={8}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <S w="200px" h={15} />
            <S w="140px" h={12} />
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <S w="70px" h={12} />
            <S w="70px" h={12} />
            <S w="70px" h={12} />
          </div>
        </div>
        {/* Bar chart skeleton */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingBottom: 4 }}>
          {[60, 12, 30, 90, 45, 130, 170, 70, 18, 22, 15, 10].map((h, i) => (
            <S key={i} style={{ flex: 1 }} h={h} r={4} />
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--divider)', margin: '14px 0 16px' }} />
        <div style={{ display: 'flex', gap: 0 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, paddingLeft: 16 }}>
              <S w="55px" h={12} style={{ marginBottom: 8 }} />
              <S w="70px" h={18} />
            </div>
          ))}
        </div>
      </SkCard>

      {/* Upcoming */}
      <SkCard col={4}>
        <div style={{ marginBottom: 16 }}>
          <S w="130px" h={15} style={{ marginBottom: 6 }} />
          <S w="90px" h={12} />
        </div>
        {[1, 2, 3, 4, 5].map(i => <SkRow key={i} />)}
      </SkCard>

      {/* TopMovers x2 */}
      {[1, 2].map(i => (
        <SkCard col={6} key={i}>
          <S w="140px" h={15} style={{ marginBottom: 16 }} />
          {[1, 2, 3, 4, 5].map(j => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: j < 5 ? '1px solid var(--divider)' : 'none' }}>
              <S w="38px" h={38} r={10} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <S w="55%" h={13} />
                <S w="35%" h={11} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
                <S w="55px" h={13} />
                <S w="40px" h={11} />
              </div>
            </div>
          ))}
        </SkCard>
      ))}

      {/* Holdings table */}
      <SkCard col={12}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <S w="80px" h={15} />
          <S w="280px" h={38} r={12} />
        </div>
        <div className="htbl">
          {[1, 2, 3, 4, 5, 6].map(i => <SkHoldingRow key={i} />)}
        </div>
      </SkCard>
    </div>
  );
}
