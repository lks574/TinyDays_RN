// app-state.jsx — record types, sample data, shared helpers

const RECORD_TYPES = {
  feed:   { id: 'feed',   label: '수유',   color: 'var(--c-feed)',   soft: 'var(--c-feed-soft)' },
  sleep:  { id: 'sleep',  label: '수면',   color: 'var(--c-sleep)',  soft: 'var(--c-sleep-soft)' },
  diaper: { id: 'diaper', label: '기저귀', color: 'var(--c-diaper)', soft: 'var(--c-diaper-soft)' },
  temp:   { id: 'temp',   label: '체온',   color: 'var(--c-temp)',   soft: 'var(--c-temp-soft)' },
  bath:   { id: 'bath',   label: '목욕',   color: 'var(--c-bath)',   soft: 'var(--c-bath-soft)' },
  note:   { id: 'note',   label: '메모',   color: 'var(--c-note)',   soft: 'var(--c-note-soft)' },
  vit:    { id: 'vit',    label: '비타민', color: 'var(--c-vit)',    soft: 'var(--c-vit-soft)' },
  med:    { id: 'med',    label: '약',     color: 'var(--c-med)',    soft: 'var(--c-med-soft)' },
};

// Tiny pictograms — kept geometric and minimal.
function RecordIcon({ type, size = 16, color = 'currentColor' }) {
  const s = size;
  const stroke = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'feed': // bottle
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <path d="M7 3h6M8 3v2M12 3v2M7.5 5h5l.5 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7l.5-2z" {...stroke}/>
          <path d="M8 10h4" {...stroke}/>
        </svg>
      );
    case 'sleep': // moon
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <path d="M15 12.5A6 6 0 0 1 7.5 5a6 6 0 1 0 7.5 7.5z" {...stroke}/>
        </svg>
      );
    case 'diaper': // diaper trapezoid
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <path d="M3 7l3-2h8l3 2-2 7a2 2 0 0 1-2 1.5H7a2 2 0 0 1-2-1.5L3 7z" {...stroke}/>
          <path d="M7 8.5h6" {...stroke}/>
        </svg>
      );
    case 'temp': // thermometer
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <path d="M10 3a1.5 1.5 0 0 1 1.5 1.5v7.2a3 3 0 1 1-3 0V4.5A1.5 1.5 0 0 1 10 3z" {...stroke}/>
          <circle cx="10" cy="14" r="1.3" fill={color}/>
        </svg>
      );
    case 'bath': // tub
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <path d="M3 11h14l-1 3.5a2 2 0 0 1-2 1.5H6a2 2 0 0 1-2-1.5L3 11z" {...stroke}/>
          <path d="M5 11V6a1.5 1.5 0 0 1 3 0" {...stroke}/>
          <path d="M9.5 7.5h-3" {...stroke}/>
        </svg>
      );
    case 'note': // note lines
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <rect x="4" y="4" width="12" height="12" rx="2" {...stroke}/>
          <path d="M7 8h6M7 11h6M7 14h3" {...stroke}/>
        </svg>
      );
    case 'vit': // capsule
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <rect x="3.5" y="7.5" width="13" height="5" rx="2.5" {...stroke}/>
          <path d="M10 7.5v5" {...stroke}/>
        </svg>
      );
    case 'med': // pill droplet
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <path d="M10 3.5c2.5 3 4 5 4 7.5a4 4 0 1 1-8 0c0-2.5 1.5-4.5 4-7.5z" {...stroke}/>
        </svg>
      );
    default:
      return null;
  }
}

// Color dot used everywhere as the visual key for record type.
function TypeDot({ type, size = 8 }) {
  const t = RECORD_TYPES[type];
  if (!t) return null;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: size,
      background: t.color, flexShrink: 0,
    }}/>
  );
}

// Sample timeline data — rich enough to show real patterns.
// Times are in minutes from midnight on "today" (today = 2026-04-28).
const TODAY_RECORDS = [
  { id: 't1',  t: 6*60+10,  type: 'feed',   amount: 110, unit: 'ml', note: '분유' },
  { id: 't2',  t: 6*60+50,  type: 'diaper', kind: '소변' },
  { id: 't3',  t: 8*60+5,   type: 'sleep',  duration: 95, status: '완료' },
  { id: 't4',  t: 9*60+45,  type: 'feed',   amount: 130, unit: 'ml', note: '분유' },
  { id: 't5',  t: 10*60+30, type: 'diaper', kind: '대변' },
  { id: 't6',  t: 11*60+10, type: 'temp',   value: 36.8, unit: '°C' },
  { id: 't7',  t: 12*60+20, type: 'sleep',  duration: 65, status: '완료' },
  { id: 't8',  t: 13*60+30, type: 'feed',   amount: 120, unit: 'ml' },
  { id: 't9',  t: 14*60+0,  type: 'vit',    note: '비타민D 1방울' },
  { id: 't10', t: 15*60+15, type: 'diaper', kind: '소변' },
  { id: 't11', t: 16*60+0,  type: 'note',   note: '눈 맞추고 옹알이' },
];

// Last record is the most recent.
const LAST_RECORD = TODAY_RECORDS[TODAY_RECORDS.length - 1];

// Time-of-day formatter
function fmtTime(min) {
  const h = Math.floor(min / 60), m = min % 60;
  const period = h < 12 ? '오전' : '오후';
  const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
  return `${period} ${h12}:${String(m).padStart(2,'0')}`;
}
function fmtMinAgo(min, now = 16*60+30) {
  const d = now - min;
  if (d < 1) return '방금';
  if (d < 60) return `${d}분 전`;
  return `${Math.floor(d/60)}시간 전`;
}
function fmtDuration(min) {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min/60), m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

// Today's totals
const TODAY_TOTALS = {
  feedCount: TODAY_RECORDS.filter(r => r.type === 'feed').length,
  feedMl:    TODAY_RECORDS.filter(r => r.type === 'feed').reduce((s,r)=>s+(r.amount||0),0),
  sleepMin:  TODAY_RECORDS.filter(r => r.type === 'sleep').reduce((s,r)=>s+(r.duration||0),0),
  sleepCount:TODAY_RECORDS.filter(r => r.type === 'sleep').length,
  diaperPee: TODAY_RECORDS.filter(r => r.type === 'diaper' && r.kind === '소변').length,
  diaperPoo: TODAY_RECORDS.filter(r => r.type === 'diaper' && r.kind === '대변').length,
};

Object.assign(window, {
  RECORD_TYPES, RecordIcon, TypeDot,
  TODAY_RECORDS, LAST_RECORD, TODAY_TOTALS,
  fmtTime, fmtMinAgo, fmtDuration,
});
