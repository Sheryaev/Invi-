'use client';

function S({ w, h, r, style }: { w?: string; h?: number; r?: number; style?: React.CSSProperties }) {
  return (
    <div
      className="skel"
      style={{ width: w ?? '100%', height: h ?? 14, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

function SkCard({ col, children }: { col: number; children: React.ReactNode }) {
  return <div className={`card col-${col}`}>{children}</div>;
}

function SkUpcomingRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: '1px solid var(--divider)' }}>
      <S w="44px" h={44} r={10} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <S w="55%" h={13} />
        <S w="30%" h={11} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="65px" h={13} />
        <S w="52px" h={18} r={8} />
      </div>
    </div>
  );
}

function SkMoverRow({ last }: { last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: last ? 'none' : '1px solid var(--divider)' }}>
      <S w="38px" h={38} r={10} />
      <div style={{ flex: 1 }}>
        <S w="60%" h={13} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="72px" h={13} />
        <S w="90px" h={11} />
      </div>
    </div>
  );
}

function SkHoldingRow() {
  return (
    <div className="htbl-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <S w="42px" h={42} r={21} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
          <S w="55%" h={13} />
          <S w="30%" h={11} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><S w="110px" h={13} /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="75px" h={13} />
        <S w="45px" h={11} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
        <S w="65px" h={13} />
        <S w="42px" h={11} />
      </div>
    </div>
  );
}

export default function SkeletonDashboard() {
  return (
    <div className="grid">
      {/* KPI 1 — Стоимость */}
      <SkCard col={3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
          <S w="20px" h={20} r={6} />
          <S w="80px" h={13} />
        </div>
        <S w="58%" h={28} style={{ marginBottom: 12 }} />
        <S w="42%" h={12} />
      </SkCard>

      {/* KPI 2 — Результат */}
      <SkCard col={6}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
          <S w="20px" h={20} r={6} />
          <S w="120px" h={13} />
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <S w="52%" h={34} style={{ marginBottom: 10 }} />
            <S w="38%" h={13} />
          </div>
          <div style={{ width: 1, background: 'var(--divider)', alignSelf: 'stretch' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[80, 60, 80].map((w, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <S w="55px" h={12} />
                <S w={`${w}px`} h={12} />
              </div>
            ))}
          </div>
        </div>
      </SkCard>

      {/* KPI 3 — Пассивный доход */}
      <SkCard col={3}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
          <S w="20px" h={20} r={6} />
          <S w="100px" h={13} />
        </div>
        <S w="48%" h={28} style={{ marginBottom: 12 }} />
        <S w="65%" h={12} />
      </SkCard>

      {/* График */}
      <SkCard col={8}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <S w="190px" h={15} />
            <S w="130px" h={12} />
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <S w="65px" h={12} />
            <S w="65px" h={12} />
            <S w="65px" h={12} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingBottom: 4 }}>
          {[55, 10, 28, 88, 42, 128, 168, 68, 16, 20, 14, 9].map((h, i) => (
            <S key={i} style={{ flex: 1 }} h={h} r={4} />
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--divider)', margin: '14px 0 16px' }} />
        <div style={{ display: 'flex' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: 1, paddingLeft: 16 }}>
              <S w="50px" h={12} style={{ marginBottom: 8 }} />
              <S w="65px" h={18} />
            </div>
          ))}
        </div>
      </SkCard>

      {/* Ближайшие выплаты */}
      <SkCard col={4}>
        <div style={{ marginBottom: 16 }}>
          <S w="125px" h={15} style={{ marginBottom: 6 }} />
          <S w="85px" h={12} />
        </div>
        {[1, 2, 3].map(i => <SkUpcomingRow key={i} />)}
        <div style={{ borderBottom: 'none' }}><SkUpcomingRow /></div>
      </SkCard>

      {/* Топ роста / Топ падений */}
      {[1, 2].map(i => (
        <SkCard col={6} key={i}>
          <S w="135px" h={15} style={{ marginBottom: 16 }} />
          {[1, 2, 3].map(j => <SkMoverRow key={j} last={j === 3} />)}
        </SkCard>
      ))}

      {/* Таблица позиций */}
      <SkCard col={12}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <S w="75px" h={15} />
          <S w="260px" h={38} r={12} />
        </div>
        <div className="htbl">
          {[1, 2, 3, 4].map(i => <SkHoldingRow key={i} />)}
        </div>
      </SkCard>
    </div>
  );
}
