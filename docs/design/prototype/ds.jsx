// ds.jsx — TinyDays Design System
// Reusable primitives, all colors/spacing/radii referenced via CSS vars from styles.css.
// Components below are the ONLY way screens should compose surfaces, type, fields and chips.

// ── Token catalog (mirrors :root vars in styles.css) ─────────────────────────
// Keep this in sync with styles.css. Used by the DS showcase page.
const TOKENS = {
  color: {
    surface: [
      { name: 'bg',           cssVar: '--bg',           role: '앱 배경 (가장 바깥)' },
      { name: 'bg-2',         cssVar: '--bg-2',         role: '섹션 배경 (한 단계 안쪽)' },
      { name: 'surface',      cssVar: '--surface',      role: '카드 / 시트 / 입력' },
      { name: 'surface-sunk', cssVar: '--surface-sunk', role: '카드 안의 들어간 면' },
    ],
    ink: [
      { name: 'ink',   cssVar: '--ink',   role: '주요 텍스트 (Display, Title)' },
      { name: 'ink-2', cssVar: '--ink-2', role: '본문' },
      { name: 'ink-3', cssVar: '--ink-3', role: '보조 텍스트 / 캡션' },
      { name: 'ink-4', cssVar: '--ink-4', role: '비활성 / 메타' },
      { name: 'ink-5', cssVar: '--ink-5', role: '연한 외곽선' },
      { name: 'line',  cssVar: '--line',  role: '기본 외곽선' },
      { name: 'line-2',cssVar: '--line-2',role: '진한 외곽선' },
    ],
    accent: [
      { name: 'accent',      cssVar: '--accent',      role: '주요 액션 (테마에 따라 변경)' },
      { name: 'accent-soft', cssVar: '--accent-soft', role: '액센트 배경 (배너 등)' },
      { name: 'accent-ink',  cssVar: '--accent-ink',  role: '액센트 위 텍스트' },
    ],
    record: [
      { name: 'feed',   label: '수유',   cssVar: '--c-feed',   soft: '--c-feed-soft' },
      { name: 'sleep',  label: '수면',   cssVar: '--c-sleep',  soft: '--c-sleep-soft' },
      { name: 'diaper', label: '기저귀', cssVar: '--c-diaper', soft: '--c-diaper-soft' },
      { name: 'temp',   label: '체온',   cssVar: '--c-temp',   soft: '--c-temp-soft' },
      { name: 'bath',   label: '목욕',   cssVar: '--c-bath',   soft: '--c-bath-soft' },
      { name: 'note',   label: '메모',   cssVar: '--c-note',   soft: '--c-note-soft' },
      { name: 'vit',    label: '비타민', cssVar: '--c-vit',    soft: '--c-vit-soft' },
      { name: 'med',    label: '약',     cssVar: '--c-med',    soft: '--c-med-soft' },
    ],
  },
  type: [
    { name: 'Display',  size: 32, weight: 700, lh: 1.15, letter: -0.6, use: '큰 화면 헤더 (잘 안 씀)' },
    { name: 'Title-L',  size: 26, weight: 700, lh: 1.2,  letter: -0.4, use: '화면 제목 (탭 안의 H1)' },
    { name: 'Title-M',  size: 20, weight: 700, lh: 1.25, letter: -0.3, use: '카드 제목' },
    { name: 'Title-S',  size: 16, weight: 700, lh: 1.3,  letter: -0.2, use: '리스트 행 제목' },
    { name: 'Body',     size: 14, weight: 500, lh: 1.45, letter: 0,    use: '본문' },
    { name: 'Body-S',   size: 13, weight: 500, lh: 1.45, letter: 0,    use: '보조 본문' },
    { name: 'Caption',  size: 11, weight: 500, lh: 1.4,  letter: 0.1,  use: '메타 / 캡션' },
    { name: 'Eyebrow',  size: 10, weight: 600, lh: 1.3,  letter: 0.6,  use: '대문자 라벨', upper: true },
    { name: 'Mono',     size: 13, weight: 500, lh: 1.4,  letter: 0,    use: '숫자 (tnum)', mono: true },
  ],
  radius: [
    { name: 'r-xs', value: 6,  use: '아주 작은 요소' },
    { name: 'r-sm', value: 8,  use: '인풋 / 작은 칩' },
    { name: 'r-md', value: 12, use: '버튼 / 칩' },
    { name: 'r-lg', value: 14, use: '카드' },
    { name: 'r-xl', value: 18, use: '시트 상단' },
    { name: 'r-pill', value: 99, use: '필 (둥근 끝)' },
  ],
  space: [
    { name: 's-1', value: 4 },
    { name: 's-2', value: 6 },
    { name: 's-3', value: 8 },
    { name: 's-4', value: 12 },
    { name: 's-5', value: 16 },
    { name: 's-6', value: 20 },
    { name: 's-7', value: 24 },
    { name: 's-8', value: 32 },
  ],
};

// ── Type primitives ──────────────────────────────────────────────────────────
function Heading({ size = 'L', children, style, ...p }) {
  // 'L' = Title-L, 'M' = Title-M, 'S' = Title-S, 'D' = Display
  const map = {
    D: { fontSize: 32, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.6 },
    L: { fontSize: 26, fontWeight: 700, lineHeight: 1.2,  letterSpacing: -0.4 },
    M: { fontSize: 20, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.3 },
    S: { fontSize: 16, fontWeight: 700, lineHeight: 1.3,  letterSpacing: -0.2 },
  };
  return <div style={{ color: 'var(--ink)', ...map[size], ...style }} {...p}>{children}</div>;
}

function Body({ size = 'M', tone = 'ink-2', children, style, ...p }) {
  const fs = size === 'S' ? 13 : 14;
  return (
    <div style={{
      fontSize: fs, fontWeight: 500, lineHeight: 1.45,
      color: `var(--${tone})`,
      ...style,
    }} {...p}>{children}</div>
  );
}

function Caption({ tone = 'ink-3', children, style, ...p }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.1,
      color: `var(--${tone})`,
      ...style,
    }} {...p}>{children}</div>
  );
}

function Eyebrow({ tone = 'accent', children, style, ...p }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: `var(--${tone})`,
      ...style,
    }} {...p}>{children}</div>
  );
}

function Mono({ children, tone = 'ink-2', size = 13, weight = 500, style, ...p }) {
  return (
    <span className="tnum" style={{
      fontSize: size, fontWeight: weight,
      color: `var(--${tone})`, ...style,
    }} {...p}>{children}</span>
  );
}

// ── Layout primitives ────────────────────────────────────────────────────────
function Stack({ gap = 8, dir = 'col', align, justify, style, children, ...p }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: dir === 'col' ? 'column' : 'row',
      gap, alignItems: align, justifyContent: justify,
      ...style,
    }} {...p}>{children}</div>
  );
}

function Spacer({ size = 12, axis = 'y' }) {
  return <div style={axis === 'y' ? { height: size } : { width: size }}/>;
}

function Divider({ inset = 0 }) {
  return <div style={{ height: 1, background: 'var(--line)', marginLeft: inset, marginRight: inset }}/>;
}

// ── Surfaces ─────────────────────────────────────────────────────────────────
// Card: the default container. Use `flush` when content owns its own padding (e.g. ListRows).
function Card({ children, padding = 16, flush = false, sunk = false, style, ...p }) {
  return (
    <div style={{
      background: sunk ? 'var(--surface-sunk)' : 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 14,
      padding: flush ? 0 : padding,
      overflow: 'hidden',
      ...style,
    }} {...p}>{children}</div>
  );
}

function SectionLabel({ children, action, style, ...p }) {
  return (
    <div style={{
      padding: '0 8px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      ...style,
    }} {...p}>
      <Eyebrow tone="ink-3">{children}</Eyebrow>
      {action}
    </div>
  );
}

// A whole "section" = label + card. Use as the standard pattern in screens.
function Section({ label, action, children, padding, flush }) {
  return (
    <div style={{ padding: '0 16px', marginBottom: 18 }}>
      {label && <SectionLabel action={action}>{label}</SectionLabel>}
      <Card padding={padding} flush={flush}>{children}</Card>
    </div>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
function Button({ variant = 'primary', size = 'md', icon, leading, trailing, full, children, style, ...p }) {
  const sizeMap = {
    sm: { padding: '7px 12px', fontSize: 12, height: 30 },
    md: { padding: '10px 16px', fontSize: 13, height: 38 },
    lg: { padding: '14px 18px', fontSize: 14, height: 48 },
  };
  const variants = {
    primary: { background: 'var(--ink)',           color: '#fff',           border: '1px solid var(--ink)' },
    accent:  { background: 'var(--accent)',        color: '#fff',           border: '1px solid var(--accent)' },
    secondary: { background: 'var(--surface)',     color: 'var(--ink)',     border: '1px solid var(--line)' },
    ghost:   { background: 'transparent',          color: 'var(--ink-2)',   border: '1px solid transparent' },
    soft:    { background: 'var(--accent-soft)',   color: 'var(--accent-ink)', border: '1px solid transparent' },
    danger:  { background: 'var(--c-temp)',        color: '#fff',           border: '1px solid var(--c-temp)' },
  };
  return (
    <button style={{
      ...variants[variant], ...sizeMap[size],
      borderRadius: 99, cursor: 'pointer',
      fontWeight: 600, fontFamily: 'inherit',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      width: full ? '100%' : undefined,
      whiteSpace: 'nowrap',
      ...style,
    }} {...p}>
      {leading}
      {children}
      {trailing}
    </button>
  );
}

// IconButton: square, used for nav arrows etc.
function IconButton({ children, size = 32, variant = 'secondary', style, ...p }) {
  const v = {
    primary: { background: 'var(--ink)', color: '#fff', border: '1px solid var(--ink)' },
    secondary: { background: 'var(--surface)', color: 'var(--ink-3)', border: '1px solid var(--line)' },
    ghost: { background: 'transparent', color: 'var(--ink-3)', border: 'none' },
  }[variant];
  return (
    <button style={{
      width: size, height: size, borderRadius: 99,
      ...v, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }} {...p}>{children}</button>
  );
}

// ── Chips ────────────────────────────────────────────────────────────────────
// One unified Chip — used as filter, tag, segmented option.
function Chip({ active, dot, dotColor, icon, count, dashed, full, onClick, children, style, ...p }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: 99,
      background: active ? 'var(--ink)' : 'var(--surface)',
      border: '1px ' + (dashed ? 'dashed' : 'solid') + ' ' +
              (active ? 'var(--ink)' : (dashed ? 'var(--line-2)' : 'var(--line)')),
      color: active ? '#fff' : 'var(--ink-2)',
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
      cursor: onClick ? 'pointer' : 'default', flexShrink: 0,
      width: full ? '100%' : undefined,
      justifyContent: full ? 'center' : 'flex-start',
      fontFamily: 'inherit',
      ...style,
    }} {...p}>
      {dot && <span style={{
        display: 'inline-block', width: 6, height: 6, borderRadius: 6,
        background: dotColor || 'var(--ink-3)', flexShrink: 0,
      }}/>}
      {icon && (
        <span style={{
          fontSize: typeof icon === 'string' && icon.length > 1 ? 9 : 11,
          fontWeight: typeof icon === 'string' && icon.length > 1 ? 700 : 400,
          display: 'inline-flex', alignItems: 'center',
        }}>{icon}</span>
      )}
      {children}
      {count > 0 && (
        <span style={{
          fontSize: 10, fontVariantNumeric: 'tabular-nums',
          color: active ? 'rgba(255,255,255,0.6)' : 'var(--ink-4)',
        }}>{count}</span>
      )}
    </button>
  );
}

// Segmented control — the toggle group used for view switchers.
function Segmented({ value, onChange, options, style }) {
  return (
    <div style={{
      display: 'inline-flex', padding: 2,
      background: 'var(--surface-sunk)',
      border: '1px solid var(--line)',
      borderRadius: 99,
      ...style,
    }}>
      {options.map(o => {
        const a = o.id === value;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 99, border: 'none',
            background: a ? 'var(--ink)' : 'transparent',
            color: a ? '#fff' : 'var(--ink-3)',
            fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}

// Badge — a small inline marker (e.g. "참고", "경고")
function Badge({ tone = 'ink', children, style, ...p }) {
  const tones = {
    ink:    { bg: 'var(--surface-sunk)', fg: 'var(--ink-2)' },
    accent: { bg: 'var(--accent-soft)',  fg: 'var(--accent-ink)' },
    warn:   { bg: 'var(--c-temp-soft)',  fg: 'var(--c-temp)' },
    info:   { bg: 'var(--c-sleep-soft)', fg: 'var(--c-sleep)' },
    soft:   { bg: 'var(--bg-2)',         fg: 'var(--ink-3)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99,
      background: tones.bg, color: tones.fg,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.2,
      ...style,
    }} {...p}>{children}</span>
  );
}

// ── Form fields ──────────────────────────────────────────────────────────────
// Inline ListRow-style field used inside a flush Card.
function Field({ label, value, onChange, compact = false, noBorder = false, placeholder, suffix, ...p }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: compact ? '10px 14px' : '14px 16px',
      borderBottom: noBorder ? 'none' : '1px solid var(--line)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-3)', minWidth: 84 }}>{label}</div>
      <input value={value} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, fontWeight: 500, color: 'var(--ink)', textAlign: 'right',
          fontFamily: 'inherit',
        }} {...p}/>
      {suffix && <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{suffix}</span>}
    </label>
  );
}

// Free-standing input (e.g. text area for parsing).
function Input({ value, onChange, placeholder, multiline, rows = 2, style, ...p }) {
  const Cmp = multiline ? 'textarea' : 'input';
  return (
    <Cmp
      value={value} onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      rows={multiline ? rows : undefined}
      style={{
        width: '100%', border: '1px solid var(--line)',
        background: 'var(--surface)', borderRadius: 12,
        padding: '12px 14px',
        fontSize: 14, fontWeight: 500, color: 'var(--ink)',
        fontFamily: 'inherit', outline: 'none',
        resize: multiline ? 'none' : undefined,
        ...style,
      }} {...p}
    />
  );
}

// ── List rows ────────────────────────────────────────────────────────────────
// Used inside a flush Card to build settings-style lists.
function ListRow({ leading, title, sub, trailing, onClick, divider = true, padding = '12px 16px' }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding,
      borderBottom: divider ? '1px solid var(--line)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{title}</div>}
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {trailing}
    </div>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, align = 'left' }) {
  return (
    <div style={{ textAlign: align }}>
      <Caption>{label}</Caption>
      <div style={{ marginTop: 4, fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3 }} className="tnum">
        {value}
        {sub && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', marginLeft: 4 }}>{sub}</span>}
      </div>
    </div>
  );
}

// Empty state block (dashed)
function EmptyState({ title, sub, action }) {
  return (
    <div style={{
      padding: '32px 18px', borderRadius: 14, border: '1px dashed var(--line-2)',
      textAlign: 'center', background: 'var(--surface)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>{sub}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

// Top app bar — used inside each phone screen.
function ScreenHeader({ eyebrow, title, sub, trailing }) {
  return (
    <div style={{ padding: '8px 24px 18px' }}>
      {eyebrow && <Eyebrow tone="accent">{eyebrow}</Eyebrow>}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ flex: 1 }}>
          <Heading size="L">{title}</Heading>
          {sub && <Body size="S" tone="ink-3" style={{ marginTop: 4 }}>{sub}</Body>}
        </div>
        {trailing}
      </div>
    </div>
  );
}

Object.assign(window, {
  TOKENS,
  // type
  Heading, Body, Caption, Eyebrow, Mono,
  // layout
  Stack, Spacer, Divider,
  // surfaces
  Card, Section, SectionLabel, ScreenHeader,
  // controls
  Button, IconButton, Chip, Segmented, Badge,
  // forms
  Field, Input,
  // lists/data
  ListRow, Stat, EmptyState,
});
