// screens-home.jsx — Home screen with parsing bottom sheet

const HOME_QUICK_ACTIONS = [
  { type: 'feed',   sub: '120 ml' },
  { type: 'sleep',  sub: '시작' },
  { type: 'diaper', sub: '소변' },
  { type: 'temp',   sub: '체온 입력' },
  { type: 'bath',   sub: '시작' },
  { type: 'vit',    sub: '비타민D' },
  { type: 'med',    sub: '약 입력' },
  { type: 'note',   sub: '메모' },
];

function HomeScreen({ onOpenSheet, parseValue, setParseValue, sheetOpen, onCloseSheet, onSaveParse, onQuickAdd, justAddedType }) {
  const last = LAST_RECORD;
  const lastType = RECORD_TYPES[last.type];

  return (
    <div className="td-screen" style={{
      height: '100%', overflow: 'auto', background: 'var(--bg)',
      paddingTop: 56, paddingBottom: 96,
    }}>
      {/* Header */}
      <div style={{ padding: '8px 24px 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: 0.4 }}>TinyDays</div>
      </div>

      {/* Baby identity */}
      <div style={{ padding: '6px 24px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1, color: 'var(--ink)', letterSpacing: -0.5 }}>하루</div>
          <div style={{ marginTop: 4, fontSize: 14, color: 'var(--ink-3)' }}>
            <span className="tnum">D+120</span> · 4개월
          </div>
        </div>
        <LastRecordChip last={last} lastType={lastType} />
      </div>

      {/* Today summary — 4 stats in a single quiet card */}
      <div style={{ margin: '0 16px', padding: '14px 4px',
        background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: 0.3 }}>오늘 · 4월 28일</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }} className="tnum">{TODAY_RECORDS.length}개 기록</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0 }}>
          <SummaryStat type="feed"   value={TODAY_TOTALS.feedMl}    unit="ml"  sub={`${TODAY_TOTALS.feedCount}회`}/>
          <SummaryStat type="sleep"  value={fmtDuration(TODAY_TOTALS.sleepMin)} sub={`${TODAY_TOTALS.sleepCount}회`} long/>
          <SummaryStat type="diaper" value={TODAY_TOTALS.diaperPee + TODAY_TOTALS.diaperPoo} unit="회" sub={`소 ${TODAY_TOTALS.diaperPee} · 대 ${TODAY_TOTALS.diaperPoo}`}/>
          <SummaryStat type="temp"   value="36.8"  unit="°C" sub="11:10"/>
        </div>
      </div>

      {/* Quick record */}
      <div style={{ padding: '24px 24px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>빠른 기록</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>탭 한 번으로 저장</div>
      </div>
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {HOME_QUICK_ACTIONS.map((a) => (
          <QuickButton
            key={a.type}
            type={a.type}
            sub={a.sub}
            flash={justAddedType === a.type}
            onClick={() => onQuickAdd(a.type)}
          />
        ))}
      </div>

      {/* Text record */}
      <div style={{ padding: '28px 24px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>텍스트로 기록</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>자연스럽게 적기</div>
      </div>
      <div style={{ padding: '0 16px' }}>
        <button
          onClick={() => parseValue.trim() && onOpenSheet()}
          style={{
            width: '100%', textAlign: 'left', display: 'block',
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 16, padding: 14, cursor: 'pointer',
          }}
        >
          <input
            value={parseValue}
            onChange={(e) => setParseValue(e.target.value)}
            placeholder="예: 분유 120ml 먹었어"
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: 15, color: 'var(--ink)', fontFamily: 'inherit', padding: '4px 4px 10px',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {['수면 3시 시작', '대변 봤어', '체온 36.8'].map(s => (
              <span key={s} onClick={(e) => { e.stopPropagation(); setParseValue(s); }} style={{
                fontSize: 12, color: 'var(--ink-3)', background: 'var(--surface-sunk)',
                padding: '5px 9px', borderRadius: 99, border: '1px solid var(--line)',
              }}>{s}</span>
            ))}
          </div>
          <div
            onClick={(e) => { e.stopPropagation(); if (parseValue.trim()) onOpenSheet(); }}
            style={{
              padding: '11px', textAlign: 'center', borderRadius: 12,
              background: parseValue.trim() ? 'var(--accent)' : 'var(--surface-sunk)',
              color: parseValue.trim() ? '#fff' : 'var(--ink-4)',
              fontSize: 14, fontWeight: 600,
              transition: 'background .15s',
            }}
          >
            내용 확인
          </div>
        </button>
      </div>

      {/* Recent timeline */}
      <div style={{ padding: '28px 24px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>최근 기록</div>
        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>전체 보기</div>
      </div>
      <div style={{ padding: '0 24px' }}>
        <Timeline records={[...TODAY_RECORDS].slice(-5).reverse()} compact />
      </div>

      {/* Parsing bottom sheet */}
      {sheetOpen && (
        <ParsingSheet
          text={parseValue}
          onClose={onCloseSheet}
          onSave={onSaveParse}
        />
      )}
    </div>
  );
}

function LastRecordChip({ last, lastType }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', borderRadius: 999,
      background: 'var(--surface)', border: '1px solid var(--line)',
      fontSize: 12, color: 'var(--ink-2)',
    }}>
      <TypeDot type={last.type} size={6}/>
      <span>{lastType.label} · {fmtMinAgo(last.t)}</span>
    </div>
  );
}

function SummaryStat({ type, value, unit, sub, long }) {
  const t = RECORD_TYPES[type];
  return (
    <div style={{
      padding: '8px 14px',
      borderRight: '1px solid var(--line)',
      borderRightStyle: 'solid',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 1,
        background: 'var(--line)',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <TypeDot type={type} size={6}/>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.label}</span>
      </div>
      <div style={{
        fontSize: long ? 16 : 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3,
        fontFeatureSettings: '"tnum" 1', whiteSpace: 'nowrap',
      }}>
        {value}{unit && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function QuickButton({ type, sub, onClick, flash }) {
  const t = RECORD_TYPES[type];
  return (
    <button
      onClick={onClick}
      style={{
        background: flash ? t.soft : 'var(--surface)',
        border: '1px solid ' + (flash ? t.color : 'var(--line)'),
        borderRadius: 14,
        padding: '12px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: 'pointer',
        transition: 'background .2s, border-color .2s, transform .1s',
        minHeight: 78,
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 30,
        background: t.soft, color: t.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <RecordIcon type={type} size={18} color={t.color}/>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{t.label}</div>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: -3 }}>{sub}</div>
    </button>
  );
}

function Timeline({ records, compact = false }) {
  if (records.length === 0) {
    return (
      <div style={{
        padding: '24px 16px', borderRadius: 14, border: '1px dashed var(--line-2)',
        textAlign: 'center', color: 'var(--ink-4)', fontSize: 13,
      }}>
        아직 기록이 없어요
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {records.map((r, i) => (
        <TimelineItem key={r.id} r={r} isLast={i === records.length - 1} compact={compact}/>
      ))}
    </div>
  );
}

function TimelineItem({ r, isLast, compact }) {
  const t = RECORD_TYPES[r.type];
  let primary = '';
  let secondary = '';
  if (r.type === 'feed') { primary = `${r.amount}${r.unit}`; secondary = r.note || ''; }
  else if (r.type === 'sleep') { primary = fmtDuration(r.duration); secondary = r.status || ''; }
  else if (r.type === 'diaper') { primary = r.kind; secondary = ''; }
  else if (r.type === 'temp') { primary = `${r.value}${r.unit}`; secondary = ''; }
  else if (r.type === 'note') { primary = r.note; secondary = ''; }
  else if (r.type === 'vit' || r.type === 'med' || r.type === 'bath') { primary = r.note || t.label; }

  return (
    <div style={{ display: 'flex', gap: 12, padding: compact ? '10px 0' : '14px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <div style={{ width: 60, flexShrink: 0, fontSize: 12, color: 'var(--ink-3)', paddingTop: 2 }} className="tnum">
        {fmtTime(r.t)}
      </div>
      <div style={{ paddingTop: 5 }}>
        <TypeDot type={r.type} size={8}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{t.label}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }} className="tnum">{primary}</span>
        </div>
        {secondary && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{secondary}</div>}
      </div>
    </div>
  );
}

// Parsing bottom sheet — appears over the home screen.
function ParsingSheet({ text, onClose, onSave }) {
  // Simple "parse" — pick a record type heuristically from the text.
  const parsed = React.useMemo(() => {
    const t = text.toLowerCase();
    if (/분유|모유|수유|먹|ml/.test(t)) {
      const ml = (t.match(/(\d+)\s*ml/) || [])[1] || '120';
      return { type: 'feed', fields: [
        { k: '양', v: `${ml} ml`, conf: 0.95 },
        { k: '종류', v: t.includes('모유') ? '모유' : '분유', conf: 0.9 },
        { k: '시간', v: '지금', conf: 1 },
      ]};
    }
    if (/수면|잠|잤|시작|종료/.test(t)) {
      return { type: 'sleep', fields: [
        { k: '상태', v: t.includes('종료') ? '종료' : '시작', conf: 0.85 },
        { k: '시간', v: t.match(/\d+시/)?.[0] || '지금', conf: 0.7 },
      ]};
    }
    if (/대변|소변|기저귀|쉬|응가/.test(t)) {
      return { type: 'diaper', fields: [
        { k: '종류', v: /대변|응가/.test(t) ? '대변' : '소변', conf: 0.9 },
        { k: '시간', v: '지금', conf: 1 },
      ]};
    }
    if (/체온|열|°|도/.test(t)) {
      const v = (t.match(/(\d+\.?\d*)/) || [])[1] || '36.8';
      return { type: 'temp', fields: [
        { k: '체온', v: `${v} °C`, conf: 0.9 },
        { k: '시간', v: '지금', conf: 1 },
      ]};
    }
    return { type: 'note', fields: [
      { k: '메모', v: text, conf: 1 },
      { k: '시간', v: '지금', conf: 1 },
    ]};
  }, [text]);

  const t = RECORD_TYPES[parsed.type];
  const lowConf = parsed.fields.some(f => f.conf < 0.85);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(20,18,16,0.4)',
        zIndex: 30, animation: 'tdFade .2s ease-out',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 31,
        background: 'var(--bg)', borderRadius: '24px 24px 0 0',
        padding: '12px 0 28px',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.12)',
        animation: 'tdSlideUp .25s cubic-bezier(.2,.8,.3,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--ink-5)' }}/>
        </div>
        <div style={{ padding: '0 24px 4px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>저장 전 확인</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3 }}>
            맞게 적었나요?
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            아래 내용으로 저장돼요. 다르면 직접 고칠 수 있어요.
          </div>
        </div>

        {/* Original text */}
        <div style={{ margin: '14px 16px 0', padding: '10px 14px',
          background: 'var(--surface-sunk)', border: '1px solid var(--line)',
          borderRadius: 12, fontSize: 13, color: 'var(--ink-2)',
        }}>
          “{text}”
        </div>

        {/* Parsed type pill */}
        <div style={{ padding: '14px 24px 6px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px 6px 8px', borderRadius: 999,
            background: t.soft, color: t.color, fontSize: 13, fontWeight: 600,
          }}>
            <RecordIcon type={parsed.type} size={14} color={t.color}/>
            {t.label}
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
            {parsed.fields.map((f, i) => (
              <div key={f.k} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: i === parsed.fields.length - 1 ? 'none' : '1px solid var(--line)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{f.k}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {f.conf < 0.85 && (
                    <span style={{
                      fontSize: 11, color: '#a5556a',
                      background: 'var(--c-med-soft)', padding: '2px 7px', borderRadius: 99,
                    }}>확인이 필요해요</span>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{f.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {lowConf && (
          <div style={{ padding: '10px 24px 0', fontSize: 11, color: 'var(--ink-3)' }}>
            정확한 시각이나 단위가 빠져 있을 수 있어요.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px', borderRadius: 14,
            background: 'var(--surface)', border: '1px solid var(--line)',
            fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer',
          }}>고치기</button>
          <button onClick={() => onSave(parsed.type)} style={{
            flex: 2, padding: '14px', borderRadius: 14,
            background: 'var(--accent)', border: '1px solid var(--accent)',
            fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
          }}>이대로 저장</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { HomeScreen, Timeline, TimelineItem, QuickButton });
