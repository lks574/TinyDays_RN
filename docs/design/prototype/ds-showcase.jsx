// ds-showcase.jsx — TinyDays design system reference page.
// Lives inside a wide DCArtboard. NOT a phone screen — it's a documentation surface.

function DSShowcase() {
  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'var(--bg)',
      padding: '40px 48px 80px',
      fontFamily: 'var(--font-sans)',
    }}>
      <DSHeader/>
      <DSSection id="00" title="시스템 개요" sub="TinyDays UI 전체에서 동일한 토큰과 컴포넌트를 사용합니다.">
        <DSPrincipleGrid/>
      </DSSection>

      <DSSection id="01" title="컬러" sub="용도 기반으로 정리된 컬러 토큰. 각 토큰은 CSS 변수로 노출됩니다.">
        <DSSubhead>표면 (Surface)</DSSubhead>
        <SwatchGrid items={TOKENS.color.surface}/>
        <DSSubhead>잉크 / 외곽선 (Ink &amp; Lines)</DSSubhead>
        <SwatchGrid items={TOKENS.color.ink} ink/>
        <DSSubhead>액센트 (Accent · 테마 변경 시 함께 변함)</DSSubhead>
        <SwatchGrid items={TOKENS.color.accent}/>
        <DSSubhead>기록 타입 컬러 (Record Type)</DSSubhead>
        <RecordSwatchGrid/>
      </DSSection>

      <DSSection id="02" title="타이포그래피" sub="Pretendard. 9개 스타일이 모든 텍스트 결정에 쓰여요.">
        <TypeSpecimen/>
      </DSSection>

      <DSSection id="03" title="모서리 / 간격" sub="고정된 스케일에서 골라요.">
        <DSSubhead>둥근 모서리 (Radius)</DSSubhead>
        <RadiusGrid/>
        <DSSubhead>간격 (Spacing)</DSSubhead>
        <SpacingScale/>
      </DSSection>

      <DSSection id="04" title="버튼" sub="Primary / Accent / Secondary / Soft / Ghost · 3가지 크기.">
        <ButtonShowcase/>
      </DSSection>

      <DSSection id="05" title="칩 · 세그먼트 · 배지" sub="필터, 토글, 작은 라벨에 두루 쓰여요.">
        <ChipsShowcase/>
      </DSSection>

      <DSSection id="06" title="입력 · 폼" sub="설정 시트 안의 인라인 필드와 자유 입력.">
        <FormShowcase/>
      </DSSection>

      <DSSection id="07" title="카드 · 리스트 · 빈 상태" sub="모든 화면의 콘텐츠는 이 셋의 조합이에요.">
        <SurfaceShowcase/>
      </DSSection>

      <DSSection id="08" title="기록 타입 시각 시스템" sub="컬러 닷 + 픽토그램. 라벨과 항상 함께 나타나요.">
        <RecordTypeShowcase/>
      </DSSection>

      <DSSection id="09" title="아이콘셋" sub="단순한 1.6 stroke. 색은 currentColor.">
        <IconsetShowcase/>
      </DSSection>

      <DSSection id="10" title="작성 가이드 (Voice)" sub="속닥이는 톤. 의학적/판단 표현은 피해요.">
        <VoiceShowcase/>
      </DSSection>

      <DSFooter/>
    </div>
  );
}

// ── Page chrome ─────────────────────────────────────────────────────────────
function DSHeader() {
  return (
    <div style={{ marginBottom: 56, paddingBottom: 32, borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, letterSpacing: -0.4,
        }}>td</div>
        <Eyebrow tone="ink-3">TinyDays · Design System</Eyebrow>
      </div>
      <div style={{ fontSize: 44, fontWeight: 700, color: 'var(--ink)', letterSpacing: -1, marginTop: 16 }}>
        TinyDays 디자인 시스템
      </div>
      <div style={{ fontSize: 16, color: 'var(--ink-3)', marginTop: 12, maxWidth: 640, lineHeight: 1.55 }}>
        조용한 뉴트럴 베이스 위에서, 기록 타입만 컬러로 구분합니다.
        모든 화면은 이 페이지의 컴포넌트를 조합해 만들어요.
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
        <Badge tone="accent">v0.1</Badge>
        <Badge tone="soft">Pretendard</Badge>
        <Badge tone="soft">iOS · 390×780</Badge>
        <Badge tone="soft">한국어</Badge>
      </div>
    </div>
  );
}

function DSSection({ id, title, sub, children }) {
  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 4 }}>
        <Mono tone="ink-4" size={12} weight={600} style={{ letterSpacing: 0.6 }}>{id}</Mono>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.4 }}>{title}</div>
      </div>
      <Body tone="ink-3" style={{ marginBottom: 20, marginLeft: 36, maxWidth: 580 }}>{sub}</Body>
      <div style={{ marginLeft: 36 }}>{children}</div>
    </div>
  );
}

function DSSubhead({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase',
      color: 'var(--ink-3)', margin: '20px 0 12px',
    }}>{children}</div>
  );
}

function DSFooter() {
  return (
    <div style={{
      marginTop: 80, paddingTop: 32, borderTop: '1px solid var(--line)',
      fontSize: 12, color: 'var(--ink-4)',
    }}>
      TinyDays v0.1 · 2026.04 · 디자인 시스템 변경 시 styles.css의 토큰과 ds.jsx의 컴포넌트를 함께 수정해주세요.
    </div>
  );
}

// ── 00 Principles ───────────────────────────────────────────────────────────
function DSPrincipleGrid() {
  const items = [
    { n: '01', t: '조용함이 기본', d: '뉴트럴 베이스. 컬러는 의미가 있을 때만.' },
    { n: '02', t: '한 가지 액센트', d: '주요 액션 = 액센트 컬러 1개. 테마 토글로 변경.' },
    { n: '03', t: '컬러 = 분류',    d: '기록 타입은 컬러 닷으로만 구분.  배경 채우지 않음.' },
    { n: '04', t: '숫자는 모노',    d: '모든 숫자는 tnum + 약간의 weight로 정렬감.' },
    { n: '05', t: '판단하지 않기',  d: '"잘 자고 있어요" 대신 "어제와 비슷해요".' },
    { n: '06', t: '터치 44px+',    d: '모든 인터랙션은 44px 이상 히트 타겟.' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {items.map(i => (
        <Card key={i.n} padding={20}>
          <Mono tone="ink-4" size={11} weight={700} style={{ letterSpacing: 0.6 }}>{i.n}</Mono>
          <Heading size="M" style={{ marginTop: 6 }}>{i.t}</Heading>
          <Body size="S" tone="ink-3" style={{ marginTop: 8 }}>{i.d}</Body>
        </Card>
      ))}
    </div>
  );
}

// ── 01 Color ────────────────────────────────────────────────────────────────
function SwatchGrid({ items, ink }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {items.map(s => <Swatch key={s.name} {...s} ink={ink}/>)}
    </div>
  );
}

function Swatch({ name, cssVar, role, ink }) {
  return (
    <Card padding={0}>
      <div style={{
        height: 88,
        background: `var(${cssVar})`,
        borderBottom: '1px solid var(--line)',
        position: 'relative',
      }}>
        {/* tiny check pattern shows transparency on near-white surfaces */}
        {ink && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.6,
            backgroundImage: 'linear-gradient(45deg, var(--bg-2) 25%, transparent 25%), linear-gradient(-45deg, var(--bg-2) 25%, transparent 25%)',
            backgroundSize: '12px 12px', mixBlendMode: 'multiply',
          }}/>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
        <Mono tone="ink-4" size={10}>{cssVar}</Mono>
        {role && <Body size="S" tone="ink-3" style={{ marginTop: 6, fontSize: 11 }}>{role}</Body>}
      </div>
    </Card>
  );
}

function RecordSwatchGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {TOKENS.color.record.map(r => (
        <Card key={r.name} padding={0}>
          <div style={{ display: 'flex', height: 88 }}>
            <div style={{ flex: 2, background: `var(${r.cssVar})` }}/>
            <div style={{ flex: 1, background: `var(${r.soft})` }}/>
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RecordIcon type={r.name} size={14} color={`var(${r.cssVar})`}/>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{r.label}</div>
              <Caption tone="ink-4" style={{ marginLeft: 'auto' }}>{r.name}</Caption>
            </div>
            <Mono tone="ink-4" size={10} style={{ marginTop: 4, display: 'block' }}>{r.cssVar} · {r.soft}</Mono>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── 02 Type ─────────────────────────────────────────────────────────────────
const TYPE_SAMPLES = {
  Display: '오늘도 잘 보내고 있어요',
  'Title-L': '날짜별 타임라인',
  'Title-M': '오늘 요약',
  'Title-S': '오후 4시 16분 · 메모',
  Body: '눈 맞추고 옹알이 — 길게 응답해줬어요',
  'Body-S': '가족 안에서만 보는 비공개 기록이에요',
  Caption: '4월 28일 · 화요일',
  Eyebrow: 'Insights',
  Mono: '247 · 36.8°C · 18:42',
};

function TypeSpecimen() {
  return (
    <Card padding={0} flush>
      {TOKENS.type.map((s, i) => (
        <div key={s.name} style={{
          display: 'grid', gridTemplateColumns: '120px 80px 1fr',
          padding: '18px 20px', alignItems: 'baseline', gap: 16,
          borderBottom: i < TOKENS.type.length - 1 ? '1px solid var(--line)' : 'none',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div>
            <Mono tone="ink-4" size={10} style={{ marginTop: 2, display: 'block' }}>
              {s.size}/{Math.round(s.size * s.lh)} · {s.weight}
            </Mono>
          </div>
          <Caption tone="ink-3">{s.use}</Caption>
          <div style={{
            fontSize: s.size, fontWeight: s.weight, lineHeight: s.lh,
            letterSpacing: s.letter,
            color: 'var(--ink)',
            textTransform: s.upper ? 'uppercase' : 'none',
            fontFeatureSettings: s.mono ? '"tnum" 1' : undefined,
          }}>
            {TYPE_SAMPLES[s.name]}
          </div>
        </div>
      ))}
    </Card>
  );
}

// ── 03 Radius / Spacing ─────────────────────────────────────────────────────
function RadiusGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
      {TOKENS.radius.map(r => (
        <div key={r.name} style={{ textAlign: 'center' }}>
          <div style={{
            height: 80, background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: r.value === 99 ? 80 : r.value,
          }}/>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          <Mono tone="ink-4" size={10}>{r.value}px</Mono>
          <Caption tone="ink-4" style={{ marginTop: 2 }}>{r.use}</Caption>
        </div>
      ))}
    </div>
  );
}

function SpacingScale() {
  const max = Math.max(...TOKENS.space.map(s => s.value));
  return (
    <Card padding={20}>
      {TOKENS.space.map(s => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 0' }}>
          <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{s.name}</div>
          <Mono tone="ink-4" size={11} style={{ width: 40 }}>{s.value}</Mono>
          <div style={{
            height: 8, background: 'var(--accent)',
            width: `${(s.value / max) * 100}%`, borderRadius: 4,
          }}/>
        </div>
      ))}
    </Card>
  );
}

// ── 04 Buttons ──────────────────────────────────────────────────────────────
function ButtonShowcase() {
  const variants = ['primary', 'accent', 'soft', 'secondary', 'ghost'];
  const sizes = ['sm', 'md', 'lg'];
  return (
    <Card padding={24}>
      <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: 16, alignItems: 'center' }}>
        <div/>
        {variants.map(v => (
          <div key={v} style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{v}</div>
        ))}
        {sizes.map(s => (
          <React.Fragment key={s}>
            <Caption>{s}</Caption>
            {variants.map(v => (
              <div key={v}><Button variant={v} size={s}>저장하기</Button></div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
        <DSSubhead>전체 너비 / 아이콘</DSSubhead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Button variant="primary" full leading={<PlusGlyph/>}>새 기록</Button>
          <Button variant="secondary" full>취소</Button>
        </div>
      </div>
    </Card>
  );
}

function PlusGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 2v8M2 6h8"/>
    </svg>
  );
}

// ── 05 Chips ────────────────────────────────────────────────────────────────
function ChipsShowcase() {
  const [seg, setSeg] = React.useState('timeline');
  const [chip, setChip] = React.useState('feed');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card padding={20}>
        <DSSubhead>Chip — 필터</DSSubhead>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip active={chip==='all'} onClick={()=>setChip('all')}>전체</Chip>
          <Chip active={chip==='feed'} dot dotColor="var(--c-feed)" onClick={()=>setChip('feed')}>수유</Chip>
          <Chip active={chip==='sleep'} dot dotColor="var(--c-sleep)" onClick={()=>setChip('sleep')}>수면</Chip>
          <Chip active={chip==='diaper'} dot dotColor="var(--c-diaper)" onClick={()=>setChip('diaper')}>기저귀</Chip>
        </div>
        <DSSubhead>Chip — 이벤트 (개수 + 커스텀)</DSSubhead>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip icon="100" count={3}>100일</Chip>
          <Chip icon="🔄" count={1}>뒤집기</Chip>
          <Chip icon="💬" count={2}>옹알이</Chip>
          <Chip icon="🛁" count={1} dashed>첫 목욕</Chip>
          <Chip dashed>＋ 새 이벤트</Chip>
        </div>
      </Card>
      <Card padding={20}>
        <DSSubhead>Segmented — 뷰 토글</DSSubhead>
        <Segmented value={seg} onChange={setSeg} options={[
          { id: 'timeline', label: '타임라인' },
          { id: 'calendar', label: '캘린더' },
        ]}/>
        <DSSubhead style={{ marginTop: 24 }}>Badge</DSSubhead>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge tone="ink">참고</Badge>
          <Badge tone="accent">새로움</Badge>
          <Badge tone="info">정보</Badge>
          <Badge tone="warn">주의</Badge>
          <Badge tone="soft">D+120</Badge>
        </div>
      </Card>
    </div>
  );
}

// ── 06 Forms ────────────────────────────────────────────────────────────────
function FormShowcase() {
  const [name, setName] = React.useState('하루');
  const [text, setText] = React.useState('분유 130ml 먹었어');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card padding={0} flush>
        <DSSubhead style={{ padding: '14px 16px 0' }}>Field — 인라인 (Card 내부)</DSSubhead>
        <Field label="가족 이름"   value={'우리 가족'}  onChange={()=>{}}/>
        <Field label="아기 이름"   value={name}        onChange={setName}/>
        <Field label="생년월일"   value={'2025-12-30'} onChange={()=>{}} suffix="D+120"/>
        <Field label="별명"       value={''}          onChange={()=>{}} placeholder="없음" noBorder/>
      </Card>
      <Card padding={20}>
        <DSSubhead>Input — 자유 입력</DSSubhead>
        <Input value={text} onChange={setText} multiline rows={3}/>
        <Spacer size={12}/>
        <Caption>오타가 있어도 괜찮아요. 저장 전에 확인할 수 있어요.</Caption>
      </Card>
    </div>
  );
}

// ── 07 Surface · List · Empty ───────────────────────────────────────────────
function SurfaceShowcase() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      <div>
        <DSSubhead>Card</DSSubhead>
        <Card>
          <Heading size="M">오늘 요약</Heading>
          <Body size="S" tone="ink-3" style={{ marginTop: 6 }}>4월 28일 · 화요일</Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
            <Stat label="수유" value="4" sub="회"/>
            <Stat label="수면" value="2.7" sub="시간"/>
            <Stat label="기저귀" value="3" sub="번"/>
          </div>
        </Card>
      </div>
      <div>
        <DSSubhead>ListRow (flush Card)</DSSubhead>
        <Card flush>
          <ListRow leading={<RecordIcon type="feed" size={18} color="var(--c-feed)"/>}
            title="수유 130ml" sub="오후 1:30"
            trailing={<Caption tone="ink-4">완료</Caption>}/>
          <ListRow leading={<RecordIcon type="sleep" size={18} color="var(--c-sleep)"/>}
            title="낮잠 1시간 5분" sub="오후 12:20 시작"
            trailing={<Caption tone="ink-4">완료</Caption>}/>
          <ListRow leading={<RecordIcon type="note" size={18} color="var(--c-note)"/>}
            title="눈 맞추고 옹알이" sub="오후 4시"
            divider={false}
            trailing={<Caption tone="ink-4">메모</Caption>}/>
        </Card>
      </div>
      <div>
        <DSSubhead>EmptyState</DSSubhead>
        <EmptyState
          title="이 필터에는 기록이 없어요"
          sub="다른 타입을 골라보거나 홈에서 기록을 남겨보세요."
          action={<Button variant="secondary" size="sm">전체 보기</Button>}
        />
      </div>
    </div>
  );
}

// ── 08 Record types ─────────────────────────────────────────────────────────
function RecordTypeShowcase() {
  return (
    <Card padding={24}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {Object.values(RECORD_TYPES).map(t => (
          <div key={t.id} style={{
            padding: 16, border: '1px solid var(--line)', borderRadius: 12,
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TypeDot type={t.id} size={8}/>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{t.label}</div>
              <Caption tone="ink-4" style={{ marginLeft: 'auto' }}>{t.id}</Caption>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: t.soft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RecordIcon type={t.id} size={20} color={t.color}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Chip dot dotColor={t.color}>{t.label}</Chip>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg-2)', borderRadius: 12 }}>
        <Caption tone="ink-3">
          닷은 항상 <b style={{color:'var(--ink-2)'}}>라벨</b>과 함께. 단독 사용 금지.
          픽토그램은 <b style={{color:'var(--ink-2)'}}>soft</b> 배경 위에서만 색을 입혀요.
        </Caption>
      </div>
    </Card>
  );
}

// ── 09 Iconset ──────────────────────────────────────────────────────────────
function IconsetShowcase() {
  // The minimum set of UI icons used in the app.
  const set = [
    { name: 'plus',    svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M10 4v12M4 10h12"/></svg> },
    { name: 'check',   svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg> },
    { name: 'close',   svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg> },
    { name: 'left',    svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l-6 6 6 6"/></svg> },
    { name: 'right',   svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4l6 6-6 6"/></svg> },
    { name: 'lock',    svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="9" width="10" height="7" rx="1.5"/><path d="M7.5 9V7a2.5 2.5 0 1 1 5 0v2"/></svg> },
    { name: 'calendar',svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="13" height="11" rx="1.5"/><path d="M3.5 8.5h13M7 3v3M13 3v3"/></svg> },
    { name: 'list',    svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5" cy="6" r="1"/><circle cx="5" cy="14" r="1"/><path d="M9 6h7M9 14h7"/></svg> },
    { name: 'search',  svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/></svg> },
    { name: 'settings',svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="2.5"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.5 1.5M13.5 13.5L15 15M5 15l1.5-1.5M13.5 6.5L15 5"/></svg> },
  ];
  return (
    <Card padding={20}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {set.map(i => (
          <div key={i.name} style={{
            padding: 16, border: '1px solid var(--line)', borderRadius: 10,
            display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 8,
            background: 'var(--surface)',
          }}>
            <div style={{ color: 'var(--ink-2)' }}>{i.svg}</div>
            <Mono tone="ink-4" size={10}>{i.name}</Mono>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── 10 Voice ────────────────────────────────────────────────────────────────
function VoiceShowcase() {
  const lines = [
    { good: '오늘 분유 4번, 수면 2시간 40분.', bad: '수유가 부족합니다.', why: '평가 X · 사실만' },
    { good: '확인이 필요해요.',                bad: 'low confidence',  why: '한국어 · 평이한 표현' },
    { good: '기록 잘 들어왔어요.',              bad: '저장 성공!',       why: '느낌표 줄이기' },
    { good: '어제와 비슷해요.',                bad: '수면 패턴이 안정적입니다.', why: '진단처럼 들리지 않게' },
    { good: '의학적 안내가 아니에요.',          bad: '질병 가능성 있음', why: '건강 데이터 면책' },
  ];
  return (
    <Card padding={0} flush>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr',
        padding: '12px 20px', borderBottom: '1px solid var(--line)',
        background: 'var(--surface-sunk)',
      }}>
        <Caption tone="ink-3" style={{ fontWeight: 600 }}>분류</Caption>
        <Caption tone="ink-3" style={{ fontWeight: 600 }}>좋은 예</Caption>
        <Caption tone="ink-3" style={{ fontWeight: 600 }}>피할 표현</Caption>
        <Caption tone="ink-3" style={{ fontWeight: 600 }}>이유</Caption>
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr',
          padding: '14px 20px', alignItems: 'baseline', gap: 12,
          borderBottom: i < lines.length - 1 ? '1px solid var(--line)' : 'none',
        }}>
          <Body size="S" tone="ink-4">{['사실만','평이한','담담','비교형','면책'][i]}</Body>
          <Body size="S" tone="ink">{l.good}</Body>
          <Body size="S" tone="ink-4" style={{ textDecoration: 'line-through' }}>{l.bad}</Body>
          <Caption tone="ink-3">{l.why}</Caption>
        </div>
      ))}
    </Card>
  );
}

Object.assign(window, { DSShowcase });
