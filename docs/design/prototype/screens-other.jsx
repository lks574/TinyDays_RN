// screens-other.jsx — Records, Insights, Photos, Family screens

// ────────── Records (기록) ──────────
function RecordsScreen({ filter, setFilter, dateOffset, setDateOffset, view, setView }) {
  const filtered = filter === 'all'
    ? TODAY_RECORDS
    : TODAY_RECORDS.filter(r => r.type === filter);

  const dates = [
    { off: -2, label: '4/26', sub: '일' },
    { off: -1, label: '4/27', sub: '월' },
    { off:  0, label: '오늘', sub: '화' },
  ];

  return (
    <div className="td-screen" style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingTop: 56, paddingBottom: 96 }}>
      <div style={{ padding: '8px 24px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: 0.4 }}>기록</div>
        {/* View toggle: timeline / calendar */}
        <div style={{
          display: 'inline-flex', padding: 2, background: 'var(--surface-sunk)',
          border: '1px solid var(--line)', borderRadius: 99,
        }}>
          {[
            { id: 'timeline', label: '타임라인', icon: (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="2.5" cy="3" r="1"/><circle cx="2.5" cy="8" r="1"/><path d="M5 3h4M5 8h4"/></svg>
            )},
            { id: 'calendar', label: '캘린더', icon: (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="2.5" width="8" height="7" rx="1"/><path d="M1.5 4.5h8M3.5 1.5v2M7.5 1.5v2"/></svg>
            )},
          ].map(v => {
            const a = view === v.id;
            return (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 99, border: 'none',
                background: a ? 'var(--ink)' : 'transparent',
                color: a ? '#fff' : 'var(--ink-3)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                {v.icon}{v.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView setView={setView} setDateOffset={setDateOffset}/>
      ) : (
        <>
          <div style={{ padding: '6px 24px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.4 }}>날짜별 타임라인</div>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }} className="tnum">
                {filtered.length}개 · 4월 28일
              </div>
            </div>
          </div>

          {/* Date selector — compact horizontal */}
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6 }}>
            {dates.map(d => {
              const active = d.off === dateOffset;
              return (
                <button key={d.off} onClick={() => setDateOffset(d.off)} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12,
                  background: active ? 'var(--ink)' : 'var(--surface)',
                  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
                  color: active ? '#fff' : 'var(--ink-2)',
                  cursor: 'pointer', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{d.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Filter chips */}
          <div style={{ padding: '4px 16px 14px', display: 'flex', gap: 6, overflowX: 'auto' }}>
            <FilterChip label="전체" active={filter==='all'} onClick={()=>setFilter('all')}/>
            {Object.values(RECORD_TYPES).slice(0, 6).map(t => (
              <FilterChip key={t.id} type={t.id} label={t.label}
                active={filter===t.id} onClick={()=>setFilter(t.id)}/>
            ))}
          </div>

          {/* Timeline grouped */}
          <div style={{ padding: '0 24px' }}>
            {filtered.length === 0 ? (
              <EmptyBlock title="이 필터에는 기록이 없어요" sub="다른 타입을 골라보거나 홈에서 기록을 남겨보세요."/>
            ) : (
              <Timeline records={[...filtered].reverse()} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ────────── Calendar view ──────────
// Mock per-day record activity: counts by type. Drives the dot density rendering.
const CAL_DATA = (() => {
  // April 2026: starts Wed (1st = Wed). Show full month.
  // For each day, give a small record summary (or null for future days).
  const data = {};
  const today = 28;
  for (let d = 1; d <= 30; d++) {
    if (d > today) { data[d] = null; continue; }
    // Vary intensity gently by day
    const seed = (d * 9301 + 49297) % 233280;
    const r = seed / 233280;
    data[d] = {
      feed:   5 + Math.floor(r * 5),
      sleep:  3 + Math.floor(((r*3) % 1) * 3),
      diaper: 6 + Math.floor(((r*7) % 1) * 5),
      total:  0,
    };
    data[d].total = data[d].feed + data[d].sleep + data[d].diaper;
  }
  // Highlight a couple of days with notes
  if (data[24]) data[24].flag = 'temp';   // 체온 기록
  if (data[26]) data[26].flag = 'med';    // 약 기록
  if (data[28]) data[28].today = true;
  return data;
})();

function CalendarView({ setView, setDateOffset }) {
  const days = ['일','월','화','수','목','금','토'];
  // April 2026: 1st is Wednesday → leading offset = 3
  const lead = 3;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push({ empty: true });
  for (let d = 1; d <= 30; d++) cells.push({ d, ...(CAL_DATA[d] || {}) });

  return (
    <div>
      <div style={{ padding: '6px 24px 12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.4 }}>2026년 4월</div>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }}>
            날짜를 누르면 그날 기록이 보여요
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <NavBtn dir="left"/>
          <NavBtn dir="right"/>
        </div>
      </div>

      {/* Weekday header */}
      <div style={{ padding: '0 16px 6px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 500,
            color: i === 0 ? 'var(--c-temp)' : i === 6 ? 'var(--c-sleep)' : 'var(--ink-4)',
            letterSpacing: 0.3, padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((c, i) => (
          <CalendarDay key={i} cell={c} weekday={i % 7}
            onClick={() => {
              if (c.d && !c.empty) {
                if (c.d === 28) setDateOffset(0);
                else if (c.d === 27) setDateOffset(-1);
                else if (c.d === 26) setDateOffset(-2);
                setView('timeline');
              }
            }}/>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        margin: '18px 16px 0', padding: '12px 14px',
        background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14,
      }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8, fontWeight: 500 }}>도트 안내</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
          {[
            { type: 'feed',   label: '수유' },
            { type: 'sleep',  label: '수면' },
            { type: 'diaper', label: '기저귀' },
            { type: 'temp',   label: '체온' },
            { type: 'med',    label: '약' },
          ].map(l => (
            <div key={l.type} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <TypeDot type={l.type} size={6}/>
              <span style={{ fontSize: 11, color: 'var(--ink-2)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Month summary */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8, padding: '0 8px', fontWeight: 500 }}>이번 달 요약</div>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14,
          padding: '12px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        }}>
          <MonthStat label="기록일" value="28" sub="일 / 30일 중"/>
          <MonthStat label="총 기록" value="247" sub="개" border/>
          <MonthStat label="하루 평균" value="8.8" sub="개"/>
        </div>
      </div>
    </div>
  );
}

function CalendarDay({ cell, weekday, onClick }) {
  if (cell.empty) {
    return <div style={{ aspectRatio: '1', minHeight: 44 }}/>;
  }
  const isToday = cell.today;
  const isFuture = cell.total === undefined || cell.total === 0 && !cell.feed;
  const dayColor = weekday === 0 ? 'var(--c-temp)' : weekday === 6 ? 'var(--c-sleep)' : 'var(--ink-2)';

  // Render up to 3 type dots based on activity
  const dots = [];
  if (cell.feed)   dots.push('feed');
  if (cell.sleep)  dots.push('sleep');
  if (cell.diaper) dots.push('diaper');
  if (cell.flag)   dots.unshift(cell.flag); // surface flagged types first
  const visible = dots.slice(0, 3);

  return (
    <button onClick={onClick} disabled={isFuture} style={{
      aspectRatio: '1', minHeight: 44, padding: '5px 4px 4px',
      borderRadius: 10,
      background: isToday ? 'var(--accent)' : (isFuture ? 'transparent' : 'var(--surface)'),
      border: isToday ? '1px solid var(--accent)' : (isFuture ? '1px dashed var(--line)' : '1px solid var(--line)'),
      color: isToday ? '#fff' : dayColor,
      cursor: isFuture ? 'default' : 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      opacity: isFuture ? 0.4 : 1,
    }}>
      <div style={{
        fontSize: 13, fontWeight: isToday ? 700 : 500,
        fontFeatureSettings: '"tnum" 1', letterSpacing: -0.2,
      }}>{cell.d}</div>
      <div style={{ display: 'flex', gap: 2.5, minHeight: 6, alignItems: 'center' }}>
        {visible.map((t, i) => (
          <span key={i} style={{
            display: 'inline-block', width: 5, height: 5, borderRadius: 5,
            background: isToday ? 'rgba(255,255,255,0.9)' : `var(--c-${t})`,
          }}/>
        ))}
      </div>
    </button>
  );
}

function NavBtn({ dir }) {
  return (
    <button style={{
      width: 32, height: 32, borderRadius: 99,
      background: 'var(--surface)', border: '1px solid var(--line)',
      color: 'var(--ink-3)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === 'left' ? 'M6 2L3 5l3 3' : 'M4 2l3 3-3 3'}/>
      </svg>
    </button>
  );
}

function MonthStat({ label, value, sub, border }) {
  return (
    <div style={{
      padding: '4px 14px', textAlign: 'left',
      borderLeft: border ? '1px solid var(--line)' : 'none',
      borderRight: border ? '1px solid var(--line)' : 'none',
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3, marginTop: 2 }} className="tnum">
        {value}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', marginLeft: 3 }}>{sub}</span>
      </div>
    </div>
  );
}

function FilterChip({ type, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 99,
      background: active ? 'var(--ink)' : 'var(--surface)',
      border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
      color: active ? '#fff' : 'var(--ink-2)',
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
    }}>
      {type && <TypeDot type={type} size={6}/>}
      {label}
    </button>
  );
}

function EmptyBlock({ title, sub }) {
  return (
    <div style={{
      padding: '32px 18px', borderRadius: 14, border: '1px dashed var(--line-2)',
      textAlign: 'center', background: 'var(--surface)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

// ────────── Insights (인사이트) ──────────
function InsightsScreen() {
  // 7-day mock data
  const days = ['수','목','금','토','일','월','화'];
  const feedBars  = [7, 6, 8, 7, 7, 8, 6];   // count per day
  const sleepBars = [620, 580, 640, 600, 660, 580, 615]; // minutes
  const diaperBars= [9, 8, 10, 9, 11, 9, 10];

  return (
    <div className="td-screen" style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingTop: 56, paddingBottom: 96 }}>
      <div style={{ padding: '8px 24px 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: 0.4 }}>인사이트</div>
      </div>
      <div style={{ padding: '6px 24px 18px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.4 }}>최근 7일 패턴</div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }}>
          4월 22일 — 4월 28일 · 기록 기반 참고
        </div>
      </div>

      {/* Tone banner — explicitly says it's a hint, not advice */}
      <div style={{ margin: '0 16px', padding: 14,
        background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontSize: 10, color: 'var(--ink-3)', background: 'var(--surface-sunk)',
            padding: '3px 7px', borderRadius: 99, border: '1px solid var(--line)',
          }}>참고</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>다음 수유 시점</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          최근 평균 간격은 <b className="tnum">3시간 10분</b>. 마지막 수유로부터 <b className="tnum">2시간 45분</b> 지났어요.
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 8 }}>
          기록을 모아 만든 단순 평균이에요. 의학적 안내가 아니에요.
        </div>
      </div>

      {/* 7-day cards */}
      <div style={{ padding: '20px 16px 0' }}>
        <InsightCard
          type="feed" title="수유"
          headline="하루 평균 7회 · 855ml"
          sub="가장 자주 마신 시간대 오전 6–9시"
          bars={feedBars} max={10} days={days} unit="회"
        />
      </div>
      <div style={{ padding: '12px 16px 0' }}>
        <InsightCard
          type="sleep" title="수면"
          headline="하루 평균 10시간 13분"
          sub="밤 수면 9시간 · 낮잠 1시간 13분"
          bars={sleepBars} max={720} days={days} unit="" formatter={(v) => `${Math.round(v/60*10)/10}h`}
        />
      </div>
      <div style={{ padding: '12px 16px 0' }}>
        <InsightCard
          type="diaper" title="기저귀"
          headline="하루 평균 9회"
          sub="소변 7 · 대변 2"
          bars={diaperBars} max={12} days={days} unit="회"
        />
      </div>
    </div>
  );
}

function InsightCard({ type, title, headline, sub, bars, max, days, unit, formatter }) {
  const t = RECORD_TYPES[type];
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 16, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <TypeDot type={type} size={8}/>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3 }} className="tnum">{headline}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>{sub}</div>

      {/* Bar chart */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 4, height: 56 }}>
        {bars.map((v, i) => {
          const isToday = i === bars.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', height: `${(v/max) * 100}%`, minHeight: 3,
                background: isToday ? t.color : t.soft,
                borderRadius: 3,
              }}/>
              <div style={{ fontSize: 9, color: isToday ? 'var(--ink-2)' : 'var(--ink-4)', fontWeight: isToday ? 600 : 400 }}>{days[i]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────── Photos (사진) ──────────
// Built-in milestone events + user-defined custom events.
// In a real product these come from the family's settings; mocked here.
const MILESTONE_EVENTS = [
  { id: 'm100',     label: '100일',       icon: '100', kind: 'builtin' },
  { id: 'mDol',     label: '돌',           icon: '돌',  kind: 'builtin' },
  { id: 'mFlip',    label: '뒤집기',       icon: '🔄',  kind: 'builtin' },
  { id: 'mBabble',  label: '옹알이',       icon: '💬',  kind: 'builtin' },
  { id: 'mTooth',   label: '첫 이',        icon: '🦷',  kind: 'builtin' },
  { id: 'mSit',     label: '혼자 앉기',    icon: '🪑',  kind: 'builtin' },
  { id: 'mWalk',    label: '걸음마',       icon: '👣',  kind: 'builtin' },
  { id: 'mWord',    label: '첫 단어',      icon: '🗣',  kind: 'builtin' },
  // Custom user-added
  { id: 'cBath',    label: '첫 목욕',      icon: '🛁',  kind: 'custom' },
  { id: 'cTrip',    label: '첫 외출',      icon: '🌳',  kind: 'custom' },
];

function PhotosScreen() {
  const [period, setPeriod] = React.useState('all');     // time filter
  const [event, setEvent]   = React.useState(null);       // event filter (id) or null
  const [showEventMgr, setShowEventMgr] = React.useState(false);

  // Mock photo grid — color blocks as placeholders.
  // Each group tagged with period; each tile may have an event id.
  const photos = [
    { id: 1, day: '오늘',     date: '4월 28일',  period: 'today', tiles: [
      { c1: '#d8c9b4', c2: '#bba88c', cap: '낮잠 후' },
      { c1: '#cfb89a', c2: '#a8916f', cap: '옹알이', event: 'mBabble' },
      { c1: '#e0d5c0', c2: '#bea98b', cap: '' },
    ]},
    { id: 2, day: '어제',     date: '4월 27일',  period: 'week', tiles: [
      { c1: '#c4cdd6', c2: '#9ba9b8', cap: '목욕 후' },
      { c1: '#d0d4cb', c2: '#a5aea1', cap: '' },
    ]},
    { id: 3, day: '4월 26일', date: '일요일',    period: 'week', tiles: [
      { c1: '#e4d9c8', c2: '#b9a78b', cap: '뒤집기!', event: 'mFlip' },
      { c1: '#cab8a0', c2: '#a08a6b', cap: '' },
      { c1: '#d4c5b0', c2: '#a89373', cap: '' },
      { c1: '#dcd0b8', c2: '#b09c7a', cap: '낮' },
    ]},
    { id: 4, day: '4월 22일', date: '수요일',    period: 'week',  tiles: [
      { c1: '#cdbfa8', c2: '#a08e72', cap: '' },
      { c1: '#d8cab2', c2: '#ad9b7d', cap: '첫 외출', event: 'cTrip' },
    ]},
    { id: 5, day: '4월 14일', date: '화요일',    period: 'month', tiles: [
      { c1: '#bdc7d3', c2: '#8e9bab', cap: '100일', event: 'm100' },
      { c1: '#c8d0d9', c2: '#9aa6b4', cap: '100일', event: 'm100' },
      { c1: '#cfd6dd', c2: '#a4afba', cap: '', event: 'm100' },
    ]},
    { id: 6, day: '3월 28일', date: '금요일',    period: 'older', tiles: [
      { c1: '#d4c0a8', c2: '#a78a6a', cap: '첫 목욕', event: 'cBath' },
    ]},
  ];

  // Filter by period first, then by event.
  const filtered = photos
    .filter(g => period === 'all' ? true
      : period === 'today' ? g.period === 'today'
      : period === 'week'  ? (g.period === 'today' || g.period === 'week')
      : period === 'month' ? g.period !== 'older'
      : true
    )
    .map(g => ({ ...g, tiles: event ? g.tiles.filter(t => t.event === event) : g.tiles }))
    .filter(g => g.tiles.length > 0);

  const totalCount = filtered.reduce((s, g) => s + g.tiles.length, 0);

  // Count photos per event for badge display
  const eventCounts = MILESTONE_EVENTS.reduce((acc, ev) => {
    acc[ev.id] = photos.reduce((n, g) => n + g.tiles.filter(t => t.event === ev.id).length, 0);
    return acc;
  }, {});

  const periods = [
    { id: 'all',   label: '전체' },
    { id: 'today', label: '오늘' },
    { id: 'week',  label: '최근 7일' },
    { id: 'month', label: '이번 달' },
  ];

  const activeEvent = MILESTONE_EVENTS.find(e => e.id === event);

  return (
    <div className="td-screen" style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingTop: 56, paddingBottom: 96 }}>
      <div style={{ padding: '8px 24px 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: 0.4 }}>사진</div>
      </div>
      <div style={{ padding: '6px 24px 12px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.4 }}>하루 사진</div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          가족 안에서만 보는 비공개 기록이에요.
        </div>
      </div>

      {/* Privacy + add row */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, padding: '8px 12px', borderRadius: 99,
          background: 'var(--surface)', border: '1px solid var(--line)',
          fontSize: 11, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="2.5" y="5.5" width="7" height="5" rx="1"/>
            <path d="M4 5.5V4a2 2 0 1 1 4 0v1.5"/>
          </svg>
          가족만 볼 수 있어요
        </div>
        <button style={{
          padding: '8px 16px', borderRadius: 99,
          background: 'var(--ink)', border: 'none', color: '#fff',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 2v8M2 6h8"/>
          </svg>
          사진 추가
        </button>
      </div>

      {/* Filters: period (compact) + event (chip strip) */}
      <div style={{ padding: '0 16px 6px', display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto' }}>
        {periods.map(f => (
          <FilterChip key={f.id} label={f.label} active={period===f.id} onClick={()=>setPeriod(f.id)}/>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-4)', flexShrink: 0, paddingRight: 8 }} className="tnum">
          {totalCount}장
        </div>
      </div>

      {/* Event/milestone filter */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.3, paddingLeft: 4 }}>이벤트</div>
        <button onClick={() => setShowEventMgr(v => !v)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 11, color: 'var(--accent)', fontWeight: 500, padding: '4px 4px',
        }}>
          {showEventMgr ? '완료' : '＋ 이벤트 관리'}
        </button>
      </div>
      <div style={{
        padding: '0 16px 6px', display: 'flex', gap: 6,
        overflowX: 'auto', flexWrap: 'nowrap',
      }}>
        <EventChip
          label="모두" active={!event}
          onClick={() => setEvent(null)}
        />
        {MILESTONE_EVENTS.map(ev => {
          const c = eventCounts[ev.id];
          if (c === 0 && !showEventMgr) return null;
          return (
            <EventChip
              key={ev.id} label={ev.label} icon={ev.icon} count={c}
              custom={ev.kind === 'custom'}
              active={event === ev.id}
              onClick={() => setEvent(event === ev.id ? null : ev.id)}
            />
          );
        })}
        {showEventMgr && (
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '7px 12px', borderRadius: 99,
            background: 'var(--surface)', border: '1px dashed var(--line-2)',
            color: 'var(--ink-3)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
          }}>＋ 새 이벤트</button>
        )}
      </div>

      {/* Active event banner */}
      {activeEvent && (
        <div style={{
          margin: '8px 16px 0', padding: '10px 14px',
          background: 'var(--accent-soft)', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>{activeEvent.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-ink)' }}>{activeEvent.label}</div>
              <div style={{ fontSize: 11, color: 'var(--accent-ink)', opacity: 0.7 }} className="tnum">
                {totalCount}장의 사진
              </div>
            </div>
          </div>
          <button onClick={() => setEvent(null)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--accent-ink)', fontSize: 16, padding: 4, lineHeight: 1,
          }}>×</button>
        </div>
      )}

      <div style={{ height: 12 }}/>

      {/* Photo days */}
      {filtered.length === 0 ? (
        <div style={{ padding: '0 24px' }}>
          <EmptyBlock title="해당하는 사진이 없어요" sub="다른 기간이나 이벤트를 골라보세요."/>
        </div>
      ) : filtered.map(group => (
        <div key={group.id} style={{ padding: '0 24px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{group.day}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{group.date}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-4)' }} className="tnum">{group.tiles.length}장</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {group.tiles.map((p, i) => {
              const ev = p.event && MILESTONE_EVENTS.find(e => e.id === p.event);
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                  background: `linear-gradient(135deg, ${p.c1}, ${p.c2})`,
                  position: 'relative',
                }}>
                  {ev && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      padding: '2px 7px', borderRadius: 99,
                      background: 'rgba(255,255,255,0.92)',
                      fontSize: 9, fontWeight: 600, color: 'var(--ink)',
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <span style={{ fontSize: 9 }}>{ev.icon}</span>
                      {ev.label}
                    </div>
                  )}
                  {p.cap && (
                    <div style={{
                      position: 'absolute', bottom: 6, left: 6,
                      fontSize: 9, color: 'rgba(255,255,255,0.95)', fontWeight: 500,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}>{p.cap}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// EventChip — like FilterChip but supports an icon glyph and a count badge.
function EventChip({ label, icon, count, active, custom, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '7px 12px', borderRadius: 99,
      background: active ? 'var(--ink)' : 'var(--surface)',
      border: '1px solid ' + (active ? 'var(--ink)' : (custom ? 'var(--line-2)' : 'var(--line)')),
      color: active ? '#fff' : 'var(--ink-2)',
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
    }}>
      {icon && (
        <span style={{
          fontSize: icon.length > 1 ? 9 : 11,
          fontWeight: icon.length > 1 ? 700 : 400,
          fontFamily: icon.length > 1 ? 'inherit' : 'inherit',
        }}>{icon}</span>
      )}
      {label}
      {count > 0 && (
        <span style={{
          fontSize: 10,
          color: active ? 'rgba(255,255,255,0.6)' : 'var(--ink-4)',
          fontVariantNumeric: 'tabular-nums',
        }}>{count}</span>
      )}
    </button>
  );
}

// ────────── Family (가족) ──────────
const ROLE_PRESETS = [
  { id: 'guardian',   label: '보호자',     desc: '모든 기능 사용 가능',          color: 'var(--accent)' },
  { id: 'caregiver',  label: '돌봄 도우미', desc: '기록만 가능 · 설정 변경 불가', color: 'var(--c-sleep)' },
  { id: 'family',     label: '가족',       desc: '기록 보기 · 사진만 조회',     color: 'var(--c-vit)' },
];

function FamilyScreen({ familyName, setFamilyName, babyName, setBabyName, babyDob, setBabyDob }) {
  const [members, setMembers] = React.useState([
    { id: 'm1', name: '엄마',    sub: '현재 사용자 · 모든 권한',        role: 'guardian', initial: '엄', isMe: true },
    { id: 'm2', name: '아빠',    sub: '4월 22일 가입',                role: 'guardian', initial: '아', isMe: false },
    { id: 'm3', name: '외할머니', sub: '4월 25일 가입 · 사진 보기 가능', role: 'family',   initial: '할', isMe: false },
  ]);
  const [invites, setInvites] = React.useState([
    { id: 'i1', name: '아빠의 동생', role: 'family', code: 'TD-4F2K', sentAt: '오늘 오전' },
  ]);
  const [adding, setAdding] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(null); // member id

  const addInvite = (name, role, method) => {
    const code = 'TD-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    setInvites(prev => [...prev, { id: 'i' + Date.now(), name, role, code, sentAt: '방금', method }]);
    setAdding(false);
  };
  const cancelInvite = (id) => setInvites(prev => prev.filter(i => i.id !== id));
  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setConfirmRemove(null);
  };

  return (
    <div className="td-screen" style={{ height: '100%', overflow: 'auto', background: 'var(--bg)', paddingTop: 56, paddingBottom: 96 }}>
      <div style={{ padding: '8px 24px 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: 0.4 }}>가족</div>
      </div>
      <div style={{ padding: '6px 24px 18px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.4 }}>가족 설정</div>
      </div>

      {/* Family info */}
      <SectionLabel>가족 정보</SectionLabel>
      <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        <Field label="가족 이름" value={familyName} onChange={setFamilyName}/>
      </div>

      {/* Baby */}
      <SectionLabel style={{ marginTop: 22 }}>등록된 아기</SectionLabel>
      <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 44,
            background: 'linear-gradient(135deg, #d8c9b4, #bba88c)',
          }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{babyName}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }} className="tnum">{babyDob} · D+120</div>
          </div>
          <button style={{
            padding: '6px 12px', borderRadius: 99,
            background: 'var(--surface-sunk)', border: '1px solid var(--line)',
            fontSize: 12, color: 'var(--ink-2)', fontWeight: 500, cursor: 'pointer',
          }}>편집</button>
        </div>
        <Field label="아기 이름" value={babyName} onChange={setBabyName} compact/>
        <Field label="생년월일" value={babyDob} onChange={setBabyDob} compact noBorder/>
      </div>

      {/* Members */}
      <div style={{ marginTop: 22, padding: '0 24px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.3 }}>
          구성원 <span className="tnum" style={{ color: 'var(--ink-4)' }}>· {members.length}명</span>
        </div>
        <button onClick={() => setAdding(true)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 12, color: 'var(--accent)', fontWeight: 600, padding: '2px 0',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5.5 2v7M2 5.5h7"/>
          </svg>
          구성원 추가
        </button>
      </div>
      <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        {members.map((m, i) => (
          <MemberRow key={m.id} member={m} divider={i < members.length - 1}
            onRemove={() => setConfirmRemove(m.id)}/>
        ))}
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: 22 }}>
            대기 중인 초대 <span className="tnum" style={{ color: 'var(--ink-4)' }}>· {invites.length}건</span>
          </SectionLabel>
          <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
            {invites.map((inv, i) => (
              <InviteRow key={inv.id} invite={inv} divider={i < invites.length - 1}
                onCancel={() => cancelInvite(inv.id)}/>
            ))}
          </div>
        </>
      )}

      <div style={{ padding: '14px 32px 0', fontSize: 11, color: 'var(--ink-4)', lineHeight: 1.6 }}>
        TinyDays는 가족 단위 비공개 앱이에요. 사진과 건강 기록은 외부에 공유되지 않아요.
      </div>

      {/* Add Member sheet */}
      {adding && (
        <AddMemberSheet onClose={() => setAdding(false)} onConfirm={addInvite}/>
      )}

      {/* Remove confirmation */}
      {confirmRemove && (
        <ConfirmRemoveSheet
          member={members.find(m => m.id === confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => removeMember(confirmRemove)}
        />
      )}
    </div>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{ padding: '0 24px 6px', fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.3, ...style }}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, compact, noBorder }) {
  return (
    <div style={{
      padding: compact ? '10px 16px' : '14px 16px',
      borderBottom: noBorder ? 'none' : '1px solid var(--line)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', width: 70, flexShrink: 0 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit', textAlign: 'right',
        }} className="tnum"/>
    </div>
  );
}

function MemberRow({ member, divider, onRemove }) {
  const role = ROLE_PRESETS.find(r => r.id === member.role) || ROLE_PRESETS[0];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      borderBottom: divider ? '1px solid var(--line)' : 'none',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 36,
        background: 'var(--accent-soft)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 600, flexShrink: 0,
      }}>{member.initial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{member.name}</div>
          {member.isMe && (
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: 0.4,
              padding: '1px 6px', borderRadius: 99,
              background: 'var(--surface-sunk)', color: 'var(--ink-3)',
            }}>나</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{member.sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 9px', borderRadius: 99,
          background: 'var(--surface-sunk)',
          fontSize: 10, fontWeight: 600, color: 'var(--ink-2)',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 5, background: role.color, display: 'inline-block' }}/>
          {role.label}
        </div>
        {!member.isMe && (
          <button onClick={onRemove} style={{
            width: 28, height: 28, borderRadius: 99, border: 'none',
            background: 'transparent', color: 'var(--ink-4)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} aria-label="구성원 내보내기">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="7" cy="3" r="0.8"/><circle cx="7" cy="7" r="0.8"/><circle cx="7" cy="11" r="0.8"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function InviteRow({ invite, divider, onCancel }) {
  const role = ROLE_PRESETS.find(r => r.id === invite.role) || ROLE_PRESETS[0];
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
    try { navigator.clipboard && navigator.clipboard.writeText(invite.code); } catch (_) {}
  };
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: divider ? '1px solid var(--line)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 36,
          background: 'var(--bg-2)', border: '1px dashed var(--line-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-4)', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M2.5 4.8l5.5 4 5.5-4"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>{invite.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
            <span style={{ width: 5, height: 5, borderRadius: 5, background: role.color, display: 'inline-block', marginRight: 5, verticalAlign: 'middle' }}/>
            {role.label} · {invite.sentAt} 초대
          </div>
        </div>
        <button onClick={onCancel} style={{
          padding: '5px 10px', borderRadius: 99,
          background: 'transparent', border: '1px solid var(--line)',
          fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, cursor: 'pointer',
          flexShrink: 0,
        }}>취소</button>
      </div>
      <button onClick={copy} style={{
        marginTop: 10, marginLeft: 48, display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', borderRadius: 8,
        background: 'var(--surface-sunk)', border: '1px dashed var(--line-2)',
        cursor: 'pointer', fontFamily: 'inherit',
      }}>
        <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: 0.5 }}>{invite.code}</span>
        <span style={{ fontSize: 10, color: copied ? 'var(--accent)' : 'var(--ink-4)', fontWeight: 600 }}>
          {copied ? '복사됨' : '코드 복사'}
        </span>
      </button>
    </div>
  );
}

function AddMemberSheet({ onClose, onConfirm }) {
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('family');
  const [method, setMethod] = React.useState('code'); // code | link | message

  const canConfirm = name.trim().length > 0;
  const submit = () => { if (canConfirm) onConfirm(name.trim(), role, method); };

  return (
    <>
      {/* Scrim */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(26,24,22,0.36)',
        animation: 'tdFade 200ms ease-out',
      }}/>
      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--surface)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: '8px 20px 24px',
        animation: 'tdSlideUp 280ms cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -8px 32px rgba(26,24,22,0.18)',
      }}>
        {/* grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 14px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--line-2)' }}/>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>구성원 추가</div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--ink-3)', padding: 4, fontFamily: 'inherit',
          }}>닫기</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.5 }}>
          초대받은 사람만 가족의 기록을 볼 수 있어요.
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6, letterSpacing: 0.3 }}>이름 / 호칭</div>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="예) 아빠, 외할머니, 이모"
            autoFocus
            style={{
              width: '100%', padding: '12px 14px',
              border: '1px solid var(--line)', borderRadius: 12,
              background: 'var(--surface)', fontSize: 14, color: 'var(--ink)',
              fontFamily: 'inherit', outline: 'none',
            }}/>
        </div>

        {/* Role */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8, letterSpacing: 0.3 }}>권한</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ROLE_PRESETS.map(r => {
              const active = r.id === role;
              return (
                <button key={r.id} onClick={() => setRole(r.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', textAlign: 'left',
                  background: active ? 'var(--surface-sunk)' : 'var(--surface)',
                  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
                  borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 99,
                    border: '1.5px solid ' + (active ? 'var(--ink)' : 'var(--line-2)'),
                    background: active ? 'var(--ink)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {active && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4.5l1.7 1.7L7 3"/>
                      </svg>
                    )}
                  </span>
                  <span style={{ width: 6, height: 6, borderRadius: 6, background: r.color, flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Method */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8, letterSpacing: 0.3 }}>초대 방법</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[
              { id: 'code', label: '초대 코드', sub: '6자리' },
              { id: 'link', label: '초대 링크', sub: 'URL' },
              { id: 'message', label: '메시지', sub: 'SMS · 카톡' },
            ].map(m => {
              const active = m.id === method;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  padding: '12px 6px',
                  background: active ? 'var(--ink)' : 'var(--surface)',
                  color: active ? '#fff' : 'var(--ink-2)',
                  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
                  borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{m.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px', borderRadius: 99,
            background: 'var(--surface)', border: '1px solid var(--line)',
            fontSize: 14, fontWeight: 600, color: 'var(--ink-2)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>취소</button>
          <button onClick={submit} disabled={!canConfirm} style={{
            flex: 2, padding: '14px', borderRadius: 99,
            background: canConfirm ? 'var(--ink)' : 'var(--surface-sunk)',
            color: canConfirm ? '#fff' : 'var(--ink-4)',
            border: '1px solid ' + (canConfirm ? 'var(--ink)' : 'var(--line)'),
            fontSize: 14, fontWeight: 600,
            cursor: canConfirm ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>초대 보내기</button>
        </div>
      </div>
    </>
  );
}

function ConfirmRemoveSheet({ member, onCancel, onConfirm }) {
  if (!member) return null;
  return (
    <>
      <div onClick={onCancel} style={{
        position: 'absolute', inset: 0, background: 'rgba(26,24,22,0.36)',
        animation: 'tdFade 200ms ease-out',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--surface)',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: '20px 20px 24px',
        animation: 'tdSlideUp 280ms cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -8px 32px rgba(26,24,22,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 16px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--line-2)' }}/>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
          {member.name}님을 내보낼까요?
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 18 }}>
          내보내면 더 이상 가족의 기록과 사진을 볼 수 없어요. 기존에 남긴 기록은 그대로 남아요.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '14px', borderRadius: 99,
            background: 'var(--surface)', border: '1px solid var(--line)',
            fontSize: 14, fontWeight: 600, color: 'var(--ink-2)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>취소</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '14px', borderRadius: 99,
            background: 'var(--c-temp)', color: '#fff',
            border: '1px solid var(--c-temp)',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>내보내기</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  RecordsScreen, InsightsScreen, PhotosScreen, FamilyScreen,
});
