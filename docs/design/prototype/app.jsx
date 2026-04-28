// app.jsx — TinyDays prototype: 5 phones on a design canvas + Tweaks

const TABS = [
  { id: 'home',      label: '홈' },
  { id: 'records',   label: '기록' },
  { id: 'insights',  label: '인사이트' },
  { id: 'photos',    label: '사진' },
  { id: 'family',    label: '가족' },
];

function TabIcon({ id, active }) {
  const c = active ? 'var(--accent)' : 'var(--ink-4)';
  const sw = 1.6;
  switch (id) {
    case 'home':
      return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l7-5 7 5v7a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V9z"/></svg>;
    case 'records':
      return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h10v14H5z"/><path d="M8 7h6M8 10h6M8 13h4"/></svg>;
    case 'insights':
      return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 16h14"/><path d="M6 16V10M10 16V6M14 16v-4"/></svg>;
    case 'photos':
      return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="14" height="12" rx="2"/><circle cx="7.5" cy="8.5" r="1.2"/><path d="M3 14l4-3 4 3 3-2 3 2"/></svg>;
    case 'family':
      return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="2.5"/><circle cx="13" cy="8" r="2"/><path d="M3 16c0-2.5 2-4 4-4s4 1.5 4 4M11 16c0-2 1.5-3 3-3s3 1 3 3"/></svg>;
    default: return null;
  }
}

function TabBar({ active, onChange }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
      paddingBottom: 22, paddingTop: 8,
      background: 'rgba(250,248,245,0.92)',
      backdropFilter: 'blur(12px) saturate(180%)',
      borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {TABS.map(t => {
        const a = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 10px', minWidth: 56,
          }}>
            <TabIcon id={t.id} active={a}/>
            <div style={{ fontSize: 10, fontWeight: a ? 600 : 500, color: a ? 'var(--accent)' : 'var(--ink-4)' }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// Each phone is an interactive instance, fully self-contained.
function TinyDaysPhone({ initialTab = 'home', initialSheet = false, initialParse = '', initialView = 'timeline' }) {
  const [tab, setTab] = React.useState(initialTab);
  const [parseValue, setParseValue] = React.useState(initialParse || '');
  const [sheetOpen, setSheetOpen] = React.useState(initialSheet);
  const [filter, setFilter] = React.useState('all');
  const [dateOffset, setDateOffset] = React.useState(0);
  const [view, setView] = React.useState(initialView);
  const [familyName, setFamilyName] = React.useState('우리 가족');
  const [babyName, setBabyName] = React.useState('하루');
  const [babyDob, setBabyDob] = React.useState('2025-12-30');
  const [justAddedType, setJustAddedType] = React.useState(null);

  const onQuickAdd = (type) => {
    setJustAddedType(type);
    setTimeout(() => setJustAddedType(null), 600);
  };

  const onSaveParse = (type) => {
    setSheetOpen(false);
    setParseValue('');
    setJustAddedType(type);
    setTimeout(() => setJustAddedType(null), 800);
  };

  return (
    <IOSDevice width={390} height={780}>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        {tab === 'home' && (
          <HomeScreen
            parseValue={parseValue}
            setParseValue={setParseValue}
            onOpenSheet={() => setSheetOpen(true)}
            onCloseSheet={() => setSheetOpen(false)}
            onSaveParse={onSaveParse}
            sheetOpen={sheetOpen}
            onQuickAdd={onQuickAdd}
            justAddedType={justAddedType}
          />
        )}
        {tab === 'records'  && <RecordsScreen filter={filter} setFilter={setFilter} dateOffset={dateOffset} setDateOffset={setDateOffset} view={view} setView={setView}/>}
        {tab === 'insights' && <InsightsScreen/>}
        {tab === 'photos'   && <PhotosScreen/>}
        {tab === 'family'   && <FamilyScreen
          familyName={familyName} setFamilyName={setFamilyName}
          babyName={babyName} setBabyName={setBabyName}
          babyDob={babyDob} setBabyDob={setBabyDob}
        />}
        <TabBar active={tab} onChange={setTab}/>
      </div>
    </IOSDevice>
  );
}

// ──────── Tweaks: theme / accent ────────
const THEME_PRESETS = {
  moss:  { name: '모스 (기본)', accent: '#5b7058', accentSoft: '#e7eee3', accentInk: '#2f3d2c', bg: '#faf8f5', bg2: '#f3efe9' },
  dusk:  { name: '더스크',     accent: '#5e6f8c', accentSoft: '#e6e9f1', accentInk: '#2f3a4d', bg: '#f8f7f4', bg2: '#eeedea' },
  clay:  { name: '클레이',     accent: '#a36850', accentSoft: '#f3e3da', accentInk: '#5a3525', bg: '#faf7f3', bg2: '#f1eae0' },
  ink:   { name: '잉크 (모노)',accent: '#2a2724', accentSoft: '#ece8e1', accentInk: '#1a1816', bg: '#f9f7f3', bg2: '#efebe3' },
};

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-soft', theme.accentSoft);
  root.style.setProperty('--accent-ink', theme.accentInk);
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--bg-2', theme.bg2);
}

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "moss",
    "showLabels": true
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    applyTheme(THEME_PRESETS[tweaks.theme] || THEME_PRESETS.moss);
  }, [tweaks.theme]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="screens" title="TinyDays" subtitle="모바일 기록 앱 — 5개 탭 시안 (탭하면 작동해요)">
          <DCArtboard id="home" label="01 · 홈"        width={390} height={780}>
            <TinyDaysPhone initialTab="home"/>
          </DCArtboard>
          <DCArtboard id="parse" label="02 · 텍스트 → 저장 전 확인" width={390} height={780}>
            <TinyDaysPhone initialTab="home" initialSheet={true} initialParse="분유 130ml 먹었어"/>
          </DCArtboard>
          <DCArtboard id="records" label="03 · 기록"      width={390} height={780}>
            <TinyDaysPhone initialTab="records"/>
          </DCArtboard>
          <DCArtboard id="calendar" label="03b · 캘린더"   width={390} height={780}>
            <TinyDaysPhone initialTab="records" initialView="calendar"/>
          </DCArtboard>
          <DCArtboard id="insights" label="04 · 인사이트"  width={390} height={780}>
            <TinyDaysPhone initialTab="insights"/>
          </DCArtboard>
          <DCArtboard id="photos" label="05 · 사진"       width={390} height={780}>
            <TinyDaysPhone initialTab="photos"/>
          </DCArtboard>
          <DCArtboard id="family" label="06 · 가족"       width={390} height={780}>
            <TinyDaysPhone initialTab="family"/>
          </DCArtboard>
        </DCSection>

        <DCSection id="ds" title="Design System" subtitle="모든 화면이 사용하는 토큰 + 컴포넌트 라이브러리">
          <DCArtboard id="ds-page" label="00 · 디자인 시스템" width={1200} height={3400}>
            <DSShowcase/>
          </DCArtboard>
        </DCSection>

        <DCPostIt top={-30} left={60} rotate={-3} width={220}>
          탭 한 번으로 화면 전환, 빠른 기록, 텍스트 → 저장 전 확인까지 작동합니다.
        </DCPostIt>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="테마">
          <TweakSelect
            label="액센트 컬러"
            value={tweaks.theme}
            options={Object.entries(THEME_PRESETS).map(([k, v]) => ({ value: k, label: v.name }))}
            onChange={(v) => setTweak('theme', v)}
          />
        </TweakSection>
        <TweakSection title="미리보기">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(THEME_PRESETS).map(([k, v]) => (
              <button key={k} onClick={() => setTweak('theme', k)} style={{
                width: 44, height: 44, borderRadius: 12, cursor: 'pointer',
                background: v.bg, border: '2px solid ' + (tweaks.theme === k ? v.accent : 'transparent'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: v.accent }}/>
              </button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
