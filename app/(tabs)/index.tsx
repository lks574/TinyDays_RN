import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BabyLog, BabyLogType } from '../../src/domain/baby-logs';
import {
  calculateDayCount,
  createDefaultFamilyContext,
  getLogOwnerContext,
  getSelectedChild,
  type FamilyContext,
} from '../../src/domain/family';
import { createTodaySummary } from '../../src/domain/insights';
import { parseBabyLogText } from '../../src/domain/parser';
import {
  localFamilyContextRepository,
  remoteFamilyMappingRepository,
} from '../../src/features/family';
import {
  createEditableParsedLog,
  createQuickLogCandidate,
  createTextLogCandidate,
  type EditableParsedLog,
  getLastSleepLogType,
  localBabyLogRepository,
  QUICK_LOG_ACTIONS,
  saveBabyLogWithRemoteBackup,
  sortLogsByRecent,
  TEXT_LOG_TYPE_OPTIONS,
  type QuickLogActionId,
} from '../../src/features/logging';
import { APP_NAME } from '../../src/shared/app-info';
import {
  Body,
  Button,
  Caption,
  Card,
  Chip,
  EmptyState,
  Field,
  Heading,
  Input,
  RecordDot,
  SectionLabel,
  type RecordTone,
} from '../../src/shared/ui';
import { theme } from '../../src/shared/ui/theme';

export default function HomeScreen() {
  const [logs, setLogs] = useState<BabyLog[]>([]);
  const [familyContext, setFamilyContext] = useState<FamilyContext>(() =>
    createDefaultFamilyContext(new Date().toISOString()),
  );
  const [textInput, setTextInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [backupStatusMessage, setBackupStatusMessage] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [pendingLog, setPendingLog] = useState<EditableParsedLog | null>(null);

  const recentLogs = useMemo(() => sortLogsByRecent(logs).slice(0, 5), [logs]);
  const todaySummary = useMemo(
    () => createTodaySummary(logs, new Date().toISOString()),
    [logs],
  );
  const selectedChild = useMemo(
    () => getSelectedChild(familyContext),
    [familyContext],
  );
  const dayCount = useMemo(
    () => calculateDayCount(selectedChild.birth_date, new Date().toISOString()),
    [selectedChild.birth_date],
  );
  const logOwnerContext = useMemo(
    () => getLogOwnerContext(familyContext),
    [familyContext],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoadingLogs(true);
      Promise.all([
        localBabyLogRepository.listLogs(),
        localFamilyContextRepository.getContext(new Date().toISOString()),
      ])
        .then(([storedLogs, storedFamilyContext]) => {
          if (!isActive) {
            return;
          }

          setLogs(storedLogs);
          setFamilyContext(storedFamilyContext);
          setStorageError('');
          setBackupStatusMessage('');
        })
        .catch(() => {
          if (!isActive) {
            return;
          }

          setStorageError('저장된 정보를 불러오지 못했습니다.');
        })
        .finally(() => {
          if (isActive) {
            setIsLoadingLogs(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  async function handleQuickLog(actionId: QuickLogActionId) {
    const now = new Date().toISOString();
    const nextLog = createQuickLogCandidate({
      actionId,
      now,
      sequence: logs.length + 1,
      id: createClientLogId('quick'),
      ownerContext: logOwnerContext,
      lastSleepLogType: getLastSleepLogType(recentLogs),
    });

    await saveLog(nextLog, '빠른 기록을 저장하지 못했습니다.');
  }

  function handleParseText() {
    const trimmedText = textInput.trim();

    if (trimmedText.length === 0) {
      setParseError('기록할 내용을 입력해 주세요.');
      return;
    }

    const parsedResult = parseBabyLogText(trimmedText, {
      now: new Date().toISOString(),
    });

    setPendingLog(createEditableParsedLog(parsedResult.parsedLog));
    setParseError('');
  }

  function handlePendingLogChange(nextFields: Partial<EditableParsedLog>) {
    setPendingLog((currentPendingLog) =>
      currentPendingLog === null
        ? null
        : {
            ...currentPendingLog,
            ...nextFields,
          },
    );
  }

  async function handleSavePendingLog() {
    if (pendingLog === null) {
      return;
    }

    const now = new Date().toISOString();
    const nextLog = createTextLogCandidate({
      parsedLog: pendingLog,
      now,
      sequence: logs.length + 1,
      id: createClientLogId('text'),
      ownerContext: logOwnerContext,
    });

    const saved = await saveLog(nextLog, '텍스트 기록을 저장하지 못했습니다.');

    if (saved) {
      setPendingLog(null);
      setTextInput('');
      setParseError('');
    }
  }

  function handleCancelPendingLog() {
    setPendingLog(null);
  }

  async function saveLog(log: BabyLog, errorMessage: string): Promise<boolean> {
    try {
      const result = await saveBabyLogWithRemoteBackup(log, {
        localRepository: localBabyLogRepository,
        mappingRepository: remoteFamilyMappingRepository,
      });

      setLogs(result.logs);
      setStorageError('');
      setBackupStatusMessage('');

      if (result.remoteBackup !== null) {
        void result.remoteBackup
          .then((remoteBackupStatus) => {
            if (remoteBackupStatus === 'queued') {
              setBackupStatusMessage('원격 백업은 나중에 다시 시도합니다.');
            }
          })
          .catch(() => {
            setBackupStatusMessage('원격 백업 상태를 확인하지 못했습니다.');
          });
      }

      return true;
    } catch {
      setStorageError(errorMessage);

      return false;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Caption tone="accent" style={styles.appName}>
          {APP_NAME}
        </Caption>
        <View style={styles.header}>
          <View>
            <Heading size="D">{selectedChild.name}</Heading>
            <Body size="S" tone="ink3" style={styles.dayCount}>
              {formatDayCount(dayCount)}
            </Body>
          </View>
          <View style={styles.statusPill}>
            {todaySummary.lastLog === null ? null : (
              <RecordDot
                type={getRecordTone(todaySummary.lastLog.log_type)}
                size={6}
              />
            )}
            <Caption tone="ink2" style={styles.statusText}>
              {isLoadingLogs
                ? '불러오는 중'
                : todaySummary.lastLog
                  ? getLogTypeLabel(todaySummary.lastLog.log_type)
                  : '기록 대기'}
            </Caption>
          </View>
        </View>
        {storageError.length > 0 ? (
          <Text style={styles.storageErrorText}>{storageError}</Text>
        ) : null}
        {backupStatusMessage.length > 0 ? (
          <Caption tone="ink4" style={styles.backupStatusText}>
            {backupStatusMessage}
          </Caption>
        ) : null}

        <Card padding={0} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Caption tone="ink3">{formatTodayLabel()}</Caption>
            <Caption tone="ink4">{todaySummary.totalLogCount}개 기록</Caption>
          </View>
          <View style={styles.summaryGrid}>
            <SummaryStat
              tone="feed"
              label="수유"
              value={`${todaySummary.feeding.count}회`}
              sub={formatFeedingTotal(todaySummary.feeding)}
            />
            <SummaryStat
              tone="sleep"
              label="수면"
              value={formatSleepTotal(todaySummary.sleep.totalMinutes)}
              sub={`${todaySummary.sleep.count}회`}
            />
            <SummaryStat
              tone="diaper"
              label="기저귀"
              value={`${todaySummary.diaper.totalCount}회`}
              sub={`소 ${todaySummary.diaper.peeCount} · 대 ${todaySummary.diaper.poopCount}`}
            />
            <SummaryStat
              tone={
                todaySummary.lastLog === null
                  ? 'note'
                  : getRecordTone(todaySummary.lastLog.log_type)
              }
              label="마지막"
              value={
                todaySummary.lastLog
                  ? getLogTypeLabel(todaySummary.lastLog.log_type)
                  : '-'
              }
              sub={
                todaySummary.lastLog
                  ? formatLogTime(todaySummary.lastLog.recorded_at)
                  : '기록 없음'
              }
              last
            />
          </View>
        </Card>

        <View style={styles.section}>
          <SectionLabel action={<Caption tone="ink4">자연스럽게 적기</Caption>}>
            텍스트로 기록
          </SectionLabel>
          <Card padding={theme.spacing[5]}>
            <Input
              multiline
              value={textInput}
              placeholder="예: 분유 120ml 먹었어"
              style={styles.textLogInput}
              onChangeText={(nextText) => {
                setTextInput(nextText);
                setParseError('');
              }}
            />
            <View style={styles.suggestionRow}>
              {['수면 3시 시작', '대변 봤어', '체온 36.8'].map((suggestion) => (
                <Chip
                  key={suggestion}
                  onPress={() => {
                    setTextInput(suggestion);
                    setParseError('');
                  }}
                  style={styles.suggestionChip}
                >
                  {suggestion}
                </Chip>
              ))}
            </View>
            {parseError.length > 0 ? (
              <Text style={styles.errorText}>{parseError}</Text>
            ) : null}
            <Button
              full
              size="lg"
              variant={textInput.trim().length > 0 ? 'accent' : 'secondary'}
              onPress={handleParseText}
              style={styles.textConfirmButton}
            >
              내용 확인
            </Button>
          </Card>
        </View>

        {pendingLog === null ? null : (
          <View style={styles.section}>
            <SectionLabel action={<Caption tone="ink4">저장 전 확인</Caption>}>
              파싱 결과 확인
            </SectionLabel>
            <Card padding={theme.spacing[5]} style={styles.confirmPanel}>
              <View style={styles.confirmHeader}>
                <Heading size="S">
                  {getLogTypeLabel(pendingLog.log_type)}
                </Heading>
                <Chip active style={styles.confidenceChip}>
                  신뢰도 {formatConfidence(pendingLog.confidence)}
                </Chip>
              </View>
              <Body size="S" tone="ink3" style={styles.originalText}>
                {pendingLog.original_text}
              </Body>

              <View style={styles.typeGrid}>
                {TEXT_LOG_TYPE_OPTIONS.map((logType) => (
                  <Chip
                    key={logType}
                    active={pendingLog.log_type === logType}
                    dotColor={getRecordToneColor(logType)}
                    onPress={() => handlePendingLogChange({ log_type: logType })}
                  >
                    {getLogTypeLabel(logType)}
                  </Chip>
                ))}
              </View>

              <View style={styles.editRow}>
                <Field
                  compact
                  label="수치"
                  value={pendingLog.amountText}
                  keyboardType="decimal-pad"
                  placeholder="120"
                  style={styles.editField}
                  onChangeText={(amountText) =>
                    handlePendingLogChange({ amountText })
                  }
                />
                <Field
                  compact
                  label="단위"
                  value={pendingLog.unit}
                  placeholder="ml"
                  style={styles.editField}
                  onChangeText={(unit) => handlePendingLogChange({ unit })}
                />
              </View>

              <Field
                compact
                noBorder
                label="메모"
                value={pendingLog.memo}
                placeholder="메모를 추가하세요"
                onChangeText={(memo) => handlePendingLogChange({ memo })}
              />

              <View style={styles.confirmActions}>
                <Button
                  variant="secondary"
                  size="lg"
                  full
                  style={styles.confirmActionButton}
                  onPress={handleCancelPendingLog}
                >
                  취소
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  full
                  style={styles.confirmActionButton}
                  onPress={handleSavePendingLog}
                >
                  저장
                </Button>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <SectionLabel action={<Caption tone="ink4">탭 한 번으로 저장</Caption>}>
            빠른 기록
          </SectionLabel>
          <View style={styles.quickGrid}>
            {QUICK_LOG_ACTIONS.map((action) => (
              <QuickActionButton
                key={action.id}
                actionId={action.id}
                label={action.label}
                detail={action.detail}
                onPress={() => handleQuickLog(action.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel action={<Caption tone="accent">전체 보기</Caption>}>
            최근 기록
          </SectionLabel>
          {recentLogs.length === 0 ? (
            <EmptyState title="아직 기록이 없어요" sub="첫 기록을 남기면 여기에 표시됩니다." />
          ) : (
            <Card padding={0}>
              {recentLogs.map((log, index) => (
                <TimelineRow
                  key={log.id}
                  log={log}
                  isLast={index === recentLogs.length - 1}
                />
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryStat({
  tone,
  label,
  value,
  sub,
  last = false,
}: {
  tone: RecordTone;
  label: string;
  value: string;
  sub: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.summaryStat, !last && styles.summaryStatDivider]}>
      <View style={styles.summaryStatLabel}>
        <RecordDot type={tone} size={6} />
        <Caption tone="ink3">{label}</Caption>
      </View>
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.summarySub} numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );
}

function QuickActionButton({
  actionId,
  label,
  detail,
  onPress,
}: {
  actionId: QuickLogActionId;
  label: string;
  detail: string;
  onPress: () => void;
}) {
  const tone = getQuickActionTone(actionId);
  const toneStyle = getRecordToneStyle(tone);

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.quickButton,
        {
          borderColor: pressed ? toneStyle.color : theme.colors.line,
          backgroundColor: pressed ? toneStyle.soft : theme.colors.surface,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickIcon, { backgroundColor: toneStyle.soft }]}>
        <RecordDot type={tone} size={10} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickDetail} numberOfLines={1}>
        {detail}
      </Text>
    </Pressable>
  );
}

function TimelineRow({ log, isLast }: { log: BabyLog; isLast: boolean }) {
  const tone = getRecordTone(log.log_type);

  return (
    <View style={[styles.timelineItem, !isLast && styles.timelineItemDivider]}>
      <Text style={styles.timelineTime}>{formatLogTime(log.recorded_at)}</Text>
      <RecordDot type={tone} size={8} />
      <View style={styles.timelineContent}>
        <View style={styles.timelineTitleRow}>
          <Text style={styles.timelineTitle}>{getLogTypeLabel(log.log_type)}</Text>
          <Text style={styles.timelineValue}>{formatLogValue(log)}</Text>
        </View>
        {log.memo === null ? null : (
          <Caption tone="ink3" style={styles.timelineMemo}>
            {log.memo}
          </Caption>
        )}
      </View>
    </View>
  );
}

function getLogTypeLabel(logType: BabyLogType): string {
  switch (logType) {
    case 'feeding':
      return '수유';
    case 'sleep_start':
      return '수면 시작';
    case 'sleep_end':
      return '수면 종료';
    case 'diaper_pee':
      return '기저귀 소변';
    case 'diaper_poop':
      return '기저귀 대변';
    case 'temperature':
      return '체온';
    case 'bath':
      return '목욕';
    case 'memo':
      return '메모';
    case 'vitamin':
      return '비타민';
    case 'medicine':
      return '약';
    case 'unknown':
      return '확인 필요';
  }
}

function getRecordTone(logType: BabyLogType): RecordTone {
  switch (logType) {
    case 'feeding':
      return 'feed';
    case 'sleep_start':
    case 'sleep_end':
      return 'sleep';
    case 'diaper_pee':
    case 'diaper_poop':
      return 'diaper';
    case 'temperature':
      return 'temp';
    case 'bath':
      return 'bath';
    case 'vitamin':
      return 'vitamin';
    case 'medicine':
      return 'medicine';
    case 'memo':
    case 'unknown':
      return 'note';
  }
}

function getQuickActionTone(actionId: QuickLogActionId): RecordTone {
  switch (actionId) {
    case 'feeding':
      return 'feed';
    case 'sleep':
      return 'sleep';
    case 'diaper_pee':
    case 'diaper_poop':
      return 'diaper';
    case 'temperature':
      return 'temp';
    case 'bath':
      return 'bath';
    case 'memo':
      return 'note';
  }
}

function getRecordToneStyle(tone: RecordTone): { color: string; soft: string } {
  switch (tone) {
    case 'feed':
      return { color: theme.colors.feed, soft: theme.colors.feedSoft };
    case 'sleep':
      return { color: theme.colors.sleep, soft: theme.colors.sleepSoft };
    case 'diaper':
      return { color: theme.colors.diaper, soft: theme.colors.diaperSoft };
    case 'temp':
      return { color: theme.colors.temp, soft: theme.colors.tempSoft };
    case 'bath':
      return { color: theme.colors.bath, soft: theme.colors.bathSoft };
    case 'vitamin':
      return { color: theme.colors.vitamin, soft: theme.colors.vitaminSoft };
    case 'medicine':
      return { color: theme.colors.medicine, soft: theme.colors.medicineSoft };
    case 'note':
      return { color: theme.colors.note, soft: theme.colors.noteSoft };
  }
}

function getRecordToneColor(logType: BabyLogType): string {
  return getRecordToneStyle(getRecordTone(logType)).color;
}

function formatTodayLabel(): string {
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return `오늘 · ${formattedDate}`;
}

function formatLogTime(recordedAt: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(recordedAt));
}

function formatLogValue(log: BabyLog): string {
  if (log.amount === null || log.unit === null) {
    return '';
  }

  return `${log.amount}${log.unit}`;
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function formatFeedingTotal(feeding: {
  totalAmount: number;
  unit: string | null;
}): string {
  if (feeding.unit === null || feeding.totalAmount === 0) {
    return '총량 없음';
  }

  return `${feeding.totalAmount}${feeding.unit}`;
}

function formatSleepTotal(totalMinutes: number): string {
  if (totalMinutes === 0) {
    return '0분';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}분`;
  }

  if (minutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${minutes}분`;
}

function formatDayCount(dayCount: number | null): string {
  return dayCount === null ? '생년월일 미등록' : `D+${dayCount}`;
}

function createClientLogId(kind: 'quick' | 'text'): string {
  const randomPart = Math.random().toString(36).slice(2, 8);

  return `local-${kind}-log-${Date.now()}-${randomPart}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    paddingTop: theme.spacing[6],
    paddingBottom: 40,
    backgroundColor: theme.colors.bg,
  },
  appName: {
    paddingHorizontal: theme.spacing[7],
  },
  header: {
    paddingHorizontal: theme.spacing[7],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[5],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  dayCount: {
    marginTop: theme.spacing[1],
  },
  statusPill: {
    minHeight: 34,
    maxWidth: 144,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  statusText: {
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[7],
  },
  summaryHeader: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: 14,
    paddingBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryGrid: {
    flexDirection: 'row',
  },
  summaryStat: {
    width: '25%',
    minHeight: 82,
    paddingHorizontal: theme.spacing[3],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[4],
    justifyContent: 'center',
  },
  summaryStatDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: theme.colors.line,
  },
  summaryStatLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[1],
  },
  summaryValue: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summarySub: {
    marginTop: 2,
    color: theme.colors.ink4,
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[7],
  },
  textLogInput: {
    minHeight: 68,
    backgroundColor: theme.colors.surfaceSunk,
  },
  suggestionRow: {
    marginTop: theme.spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  suggestionChip: {
    backgroundColor: theme.colors.surfaceSunk,
  },
  errorText: {
    marginTop: theme.spacing[3],
    color: '#B42318',
    fontSize: 13,
    fontWeight: '600',
  },
  storageErrorText: {
    marginHorizontal: theme.spacing[7],
    marginBottom: theme.spacing[4],
    color: '#B42318',
    fontSize: 13,
    fontWeight: '600',
  },
  backupStatusText: {
    paddingHorizontal: theme.spacing[7],
    marginTop: -theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  textConfirmButton: {
    marginTop: theme.spacing[4],
  },
  confirmPanel: {
    borderColor: theme.colors.accent,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
  },
  confidenceChip: {
    flexShrink: 0,
  },
  originalText: {
    marginTop: theme.spacing[2],
  },
  typeGrid: {
    marginTop: theme.spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  editRow: {
    marginTop: theme.spacing[4],
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  editField: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing[3],
  },
  confirmActions: {
    marginTop: theme.spacing[2],
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  confirmActionButton: {
    flex: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  quickButton: {
    width: '22.9%',
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[3],
  },
  quickIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  quickLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickDetail: {
    marginTop: 2,
    color: theme.colors.ink4,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  timelineItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  timelineItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
  },
  timelineTime: {
    width: 58,
    color: theme.colors.ink3,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  timelineContent: {
    flex: 1,
    minWidth: 0,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing[2],
  },
  timelineTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  timelineValue: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timelineMemo: {
    marginTop: 2,
  },
});
