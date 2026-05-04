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
import { remoteFamilyMappingRepository } from '../../src/features/family';
import {
  loadBabyLogsWithRemotePull,
  localBabyLogRepository,
} from '../../src/features/logging';
import {
  createTimelineDateOptions,
  getBabyLogTypeLabel,
  getLogsForTimelineDate,
  getTimelineDateKey,
  getTimelineTypeFilterLabel,
  TIMELINE_TYPE_FILTERS,
  type TimelineTypeFilter,
} from '../../src/features/timeline';
import { theme } from '../../src/shared/ui/theme';

type RecordToneKey =
  | 'feed'
  | 'sleep'
  | 'diaper'
  | 'vitamin'
  | 'medicine'
  | 'temp'
  | 'bath'
  | 'note'
  | 'unknown';

type RecordsViewMode = 'timeline' | 'calendar';

const recordTone: Record<RecordToneKey, { color: string; soft: string }> = {
  feed: { color: theme.colors.feed, soft: theme.colors.feedSoft },
  sleep: { color: theme.colors.sleep, soft: theme.colors.sleepSoft },
  diaper: { color: theme.colors.diaper, soft: theme.colors.diaperSoft },
  vitamin: { color: theme.colors.vitamin, soft: theme.colors.vitaminSoft },
  medicine: { color: theme.colors.medicine, soft: theme.colors.medicineSoft },
  temp: { color: theme.colors.temp, soft: theme.colors.tempSoft },
  bath: { color: theme.colors.bath, soft: theme.colors.bathSoft },
  note: { color: theme.colors.note, soft: theme.colors.noteSoft },
  unknown: { color: theme.colors.ink4, soft: theme.colors.surfaceSunk },
};

export default function LogsScreen() {
  const [logs, setLogs] = useState<BabyLog[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getTimelineDateKey(new Date().toISOString()),
  );
  const [typeFilter, setTypeFilter] = useState<TimelineTypeFilter>('all');
  const [viewMode, setViewMode] = useState<RecordsViewMode>('timeline');
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [storageError, setStorageError] = useState('');
  const [remoteStatusMessage, setRemoteStatusMessage] = useState('');

  const dateOptions = useMemo(
    () => createTimelineDateOptions(logs, new Date().toISOString()),
    [logs],
  );
  const selectedDateOption = dateOptions.find(
    (option) => option.key === selectedDateKey,
  );
  const visibleLogs = useMemo(
    () => getLogsForTimelineDate(logs, selectedDateKey, typeFilter),
    [logs, selectedDateKey, typeFilter],
  );
  const calendarDays = useMemo(
    () => createCalendarDays(logs, selectedDateKey),
    [logs, selectedDateKey],
  );
  const calendarMonthStats = useMemo(
    () => createCalendarMonthStats(logs, selectedDateKey),
    [logs, selectedDateKey],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoadingLogs(true);
      loadBabyLogsWithRemotePull({
        dateKey: selectedDateKey,
        localRepository: localBabyLogRepository,
        mappingRepository: remoteFamilyMappingRepository,
      })
        .then((result) => {
          if (!isActive) {
            return;
          }

          const storedLogs = result.logs;

          setLogs(storedLogs);
          setStorageError('');
          setRemoteStatusMessage(
            result.remoteStatus === 'failed'
              ? '원격 기록을 불러오지 못해 이 기기의 기록만 표시합니다.'
              : '',
          );

          const nextDateOptions = createTimelineDateOptions(
            storedLogs,
            new Date().toISOString(),
          );

          if (!nextDateOptions.some((option) => option.key === selectedDateKey)) {
            setSelectedDateKey(nextDateOptions[0]?.key ?? selectedDateKey);
          }
        })
        .catch(() => {
          if (isActive) {
            setStorageError('저장된 기록을 불러오지 못했습니다.');
            setRemoteStatusMessage('');
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoadingLogs(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, [selectedDateKey]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.eyebrow}>기록</Text>
              <Text style={styles.title}>
                {viewMode === 'timeline'
                  ? '날짜별 타임라인'
                  : formatMonthTitle(selectedDateKey)}
              </Text>
              <Text style={styles.subtitle}>
                {isLoadingLogs
                  ? '저장된 기록을 불러오는 중'
                  : viewMode === 'timeline'
                    ? `${visibleLogs.length}개 · ${
                        selectedDateOption?.label ??
                        formatDateKeyLabel(selectedDateKey)
                      }`
                    : '날짜를 누르면 그날 기록이 보여요'}
              </Text>
            </View>
            <View style={styles.viewToggle}>
              {(['timeline', 'calendar'] as const).map((mode) => {
                const isSelected = mode === viewMode;

                return (
                  <Pressable
                    key={mode}
                    accessibilityRole="button"
                    style={[
                      styles.viewToggleButton,
                      isSelected && styles.viewToggleButtonActive,
                    ]}
                    onPress={() => setViewMode(mode)}
                  >
                    <Text
                      style={[
                        styles.viewToggleText,
                        isSelected && styles.viewToggleTextActive,
                      ]}
                    >
                      {mode === 'timeline' ? '타임라인' : '캘린더'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {storageError.length > 0 ? (
          <Text style={styles.errorText}>{storageError}</Text>
        ) : null}
        {remoteStatusMessage.length > 0 ? (
          <Text style={styles.remoteStatusText}>{remoteStatusMessage}</Text>
        ) : null}

        {viewMode === 'calendar' ? (
          <CalendarView
            days={calendarDays}
            stats={calendarMonthStats}
            selectedDateKey={selectedDateKey}
            onSelectDate={(dateKey) => {
              setSelectedDateKey(dateKey);
              setViewMode('timeline');
            }}
          />
        ) : (
          <>
            <View style={styles.dateSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dateList}>
                  {dateOptions.map((option) => {
                    const isSelected = option.key === selectedDateKey;

                    return (
                      <Pressable
                        key={option.key}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                          styles.dateButton,
                          isSelected && styles.dateButtonActive,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => setSelectedDateKey(option.key)}
                      >
                        <Text
                          style={[
                            styles.dateButtonLabel,
                            isSelected && styles.dateButtonLabelActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.dateButtonMeta,
                            isSelected && styles.dateButtonMetaActive,
                          ]}
                        >
                          {formatWeekday(option.key)} · {option.count}개
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterList}>
                  {TIMELINE_TYPE_FILTERS.map((filter) => {
                    const isSelected = filter === typeFilter;
                    const tone =
                      filter === 'all'
                        ? null
                        : recordTone[getRecordToneKey(filter)];

                    return (
                      <Pressable
                        key={filter}
                        accessibilityRole="button"
                        style={[
                          styles.filterButton,
                          isSelected && styles.filterButtonActive,
                        ]}
                        onPress={() => setTypeFilter(filter)}
                      >
                        {tone === null ? null : (
                          <View
                            style={[
                              styles.filterDot,
                              {
                                backgroundColor: isSelected
                                  ? theme.colors.white
                                  : tone.color,
                              },
                            ]}
                          />
                        )}
                        <Text
                          style={[
                            styles.filterButtonText,
                            isSelected && styles.filterButtonTextActive,
                          ]}
                        >
                          {getTimelineTypeFilterLabel(filter)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.timelineSection}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineHeaderTitle}>
                  {selectedDateOption?.label ?? formatDateKeyLabel(selectedDateKey)}
                </Text>
                <Text style={styles.timelineCount}>
                  {visibleLogs.length}개 기록
                </Text>
              </View>

              {visibleLogs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>이 필터에는 기록이 없어요</Text>
                  <Text style={styles.emptyDescription}>
                    다른 타입을 골라보거나 홈에서 기록을 남겨보세요.
                  </Text>
                </View>
              ) : (
                <View style={styles.timelineList}>
                  {visibleLogs.map((log) => (
                    <TimelineLogItem key={log.id} log={log} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type CalendarDayItem = {
  dateKey: string;
  day: number;
  isEmpty: boolean;
  isFuture: boolean;
  isSelected: boolean;
  tones: RecordToneKey[];
};

type CalendarMonthStats = {
  recordedDays: number;
  totalLogs: number;
  averagePerRecordedDay: number;
};

function CalendarView({
  days,
  stats,
  selectedDateKey,
  onSelectDate,
}: {
  days: CalendarDayItem[];
  stats: CalendarMonthStats;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
}) {
  return (
    <View style={styles.calendarSection}>
      <View style={styles.weekdayRow}>
        {['일', '월', '화', '수', '목', '금', '토'].map((weekday, index) => (
          <Text
            key={weekday}
            style={[
              styles.weekdayText,
              index === 0 && styles.weekdaySunday,
              index === 6 && styles.weekdaySaturday,
            ]}
          >
            {weekday}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {days.map((day, index) => (
          <CalendarDay
            key={day.isEmpty ? `empty-${index}` : day.dateKey}
            day={day}
            onPress={() => onSelectDate(day.dateKey)}
          />
        ))}
      </View>

      <View style={styles.calendarLegend}>
        {[
          ['feed', '수유'],
          ['sleep', '수면'],
          ['diaper', '기저귀'],
          ['temp', '체온'],
          ['medicine', '약'],
        ].map(([toneKey, label]) => (
          <View key={toneKey} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: recordTone[toneKey as RecordToneKey].color },
              ]}
            />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.monthSummary}>
        <MonthStat label="기록일" value={`${stats.recordedDays}`} sub="일" />
        <MonthStat label="총 기록" value={`${stats.totalLogs}`} sub="개" border />
        <MonthStat
          label="기록일 평균"
          value={formatAverage(stats.averagePerRecordedDay)}
          sub="개"
        />
      </View>

      <Text style={styles.calendarHint}>
        선택한 날짜: {formatDateKeyLabel(selectedDateKey)}
      </Text>
    </View>
  );
}

function CalendarDay({
  day,
  onPress,
}: {
  day: CalendarDayItem;
  onPress: () => void;
}) {
  if (day.isEmpty) {
    return <View style={styles.calendarDayEmpty} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={day.isFuture}
      style={({ pressed }) => [
        styles.calendarDay,
        day.isSelected && styles.calendarDaySelected,
        day.isFuture && styles.calendarDayFuture,
        pressed && !day.isFuture && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.calendarDayText,
          day.isSelected && styles.calendarDayTextSelected,
        ]}
      >
        {day.day}
      </Text>
      <View style={styles.calendarDots}>
        {day.tones.slice(0, 3).map((toneKey) => (
          <View
            key={toneKey}
            style={[
              styles.calendarDot,
              {
                backgroundColor: day.isSelected
                  ? theme.colors.white
                  : recordTone[toneKey].color,
              },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

function MonthStat({
  label,
  value,
  sub,
  border,
}: {
  label: string;
  value: string;
  sub: string;
  border?: boolean;
}) {
  return (
    <View style={[styles.monthStat, border && styles.monthStatBorder]}>
      <Text style={styles.monthStatLabel}>{label}</Text>
      <Text style={styles.monthStatValue}>
        {value}
        <Text style={styles.monthStatSub}> {sub}</Text>
      </Text>
    </View>
  );
}

function TimelineLogItem({ log }: { log: BabyLog }) {
  const tone = recordTone[getRecordToneKey(log.log_type)];
  const details = getTimelineDetails(log);

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{formatLogTime(log.recorded_at)}</Text>
        <View style={[styles.timelineDot, { backgroundColor: tone.color }]} />
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineTitleRow}>
          <View style={[styles.typeSoftDot, { backgroundColor: tone.soft }]}>
            <View style={[styles.typeInnerDot, { backgroundColor: tone.color }]} />
          </View>
          <Text style={styles.timelineTitle}>
            {getBabyLogTypeLabel(log.log_type)}
          </Text>
        </View>
        {details.primary.length > 0 ? (
          <Text style={styles.timelinePrimary}>{details.primary}</Text>
        ) : null}
        <Text style={styles.timelineMeta}>{details.secondary}</Text>
        {details.memo.length > 0 ? (
          <Text style={styles.timelineMemo}>{details.memo}</Text>
        ) : null}
      </View>
    </View>
  );
}

function formatLogTime(recordedAt: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(recordedAt));
}

function formatLogMeta(log: BabyLog): string {
  const parts = [getSourceLabel(log.source)];

  if (log.amount !== null && log.unit !== null) {
    parts.push(`${log.amount}${log.unit}`);
  }

  return parts.join(' · ');
}

function getTimelineDetails(log: BabyLog): {
  primary: string;
  secondary: string;
  memo: string;
} {
  const hasAmount = log.amount !== null && log.unit !== null;
  const primary = hasAmount ? `${log.amount}${log.unit}` : '';
  const memo = log.memo ?? '';
  const source = getSourceLabel(log.source);

  if (primary.length === 0 && memo.length > 0) {
    return { primary: memo, secondary: source, memo: '' };
  }

  return {
    primary,
    secondary: formatLogMeta(log),
    memo,
  };
}

function getRecordToneKey(logType: BabyLogType): RecordToneKey {
  switch (logType) {
    case 'feeding':
      return 'feed';
    case 'sleep_start':
    case 'sleep_end':
      return 'sleep';
    case 'diaper_pee':
    case 'diaper_poop':
      return 'diaper';
    case 'vitamin':
      return 'vitamin';
    case 'medicine':
      return 'medicine';
    case 'temperature':
      return 'temp';
    case 'bath':
      return 'bath';
    case 'memo':
      return 'note';
    case 'unknown':
      return 'unknown';
  }
}

function createCalendarDays(
  logs: readonly BabyLog[],
  selectedDateKey: string,
): CalendarDayItem[] {
  const selectedDate = createDateFromKey(selectedDateKey);
  const todayKey = getTimelineDateKey(new Date().toISOString());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();
  const cells: CalendarDayItem[] = Array.from(
    { length: leadingEmptyDays },
    (_, index) => ({
      dateKey: `empty-${index}`,
      day: 0,
      isEmpty: true,
      isFuture: false,
      isSelected: false,
      tones: [],
    }),
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = getTimelineDateKey(date.toISOString());
    const dayLogs = logs.filter((log) => getTimelineDateKey(log.recorded_at) === dateKey);

    cells.push({
      dateKey,
      day,
      isEmpty: false,
      isFuture: dateKey > todayKey,
      isSelected: dateKey === selectedDateKey,
      tones: getCalendarToneKeys(dayLogs),
    });
  }

  return cells;
}

function createCalendarMonthStats(
  logs: readonly BabyLog[],
  selectedDateKey: string,
): CalendarMonthStats {
  const monthKey = selectedDateKey.slice(0, 7);
  const logsInMonth = logs.filter(
    (log) => getTimelineDateKey(log.recorded_at).slice(0, 7) === monthKey,
  );
  const recordedDays = new Set(
    logsInMonth.map((log) => getTimelineDateKey(log.recorded_at)),
  ).size;

  return {
    recordedDays,
    totalLogs: logsInMonth.length,
    averagePerRecordedDay:
      recordedDays === 0 ? 0 : logsInMonth.length / recordedDays,
  };
}

function getCalendarToneKeys(logs: readonly BabyLog[]): RecordToneKey[] {
  const toneKeys = logs.map((log) => getRecordToneKey(log.log_type));

  return [...new Set(toneKeys)];
}

function formatWeekday(dateKey: string): string {
  return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(
    createDateFromKey(dateKey),
  );
}

function formatDateKeyLabel(dateKey: string): string {
  const [, month, day] = dateKey.split('-');

  return `${Number(month)}월 ${Number(day)}일`;
}

function formatMonthTitle(dateKey: string): string {
  const [year, month] = dateKey.split('-');

  return `${year}년 ${Number(month)}월`;
}

function formatAverage(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function createDateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function getSourceLabel(source: BabyLog['source']): string {
  switch (source) {
    case 'quick_button':
      return '빠른 기록';
    case 'manual':
      return '직접 입력';
    case 'voice':
      return '음성';
    case 'siri':
      return 'Siri';
    case 'imported':
      return '가져오기';
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    paddingTop: 28,
    paddingBottom: 40,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  title: {
    marginTop: 10,
    color: theme.colors.ink,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.ink3,
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    marginHorizontal: 24,
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
  remoteStatusText: {
    marginTop: 8,
    marginHorizontal: 24,
    color: theme.colors.ink4,
    fontSize: 12,
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surfaceSunk,
    padding: 2,
  },
  viewToggleButton: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewToggleButtonActive: {
    backgroundColor: theme.colors.ink,
  },
  viewToggleText: {
    color: theme.colors.ink3,
    fontSize: 11,
    fontWeight: '600',
  },
  viewToggleTextActive: {
    color: theme.colors.white,
  },
  dateSection: {
    paddingHorizontal: 16,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  dateList: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 8,
  },
  dateButton: {
    minWidth: 106,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  dateButtonActive: {
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
  },
  dateButtonLabel: {
    color: theme.colors.ink2,
    fontSize: 13,
    fontWeight: '600',
  },
  dateButtonLabelActive: {
    color: theme.colors.white,
  },
  dateButtonMeta: {
    marginTop: 2,
    color: theme.colors.ink4,
    fontSize: 10,
    fontWeight: '500',
  },
  dateButtonMetaActive: {
    color: theme.colors.white,
    opacity: 0.72,
  },
  filterList: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  filterButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterButtonActive: {
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterButtonText: {
    color: theme.colors.ink2,
    fontSize: 12,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  pressed: {
    opacity: 0.82,
  },
  timelineSection: {
    marginTop: 18,
    paddingHorizontal: 24,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineHeaderTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  timelineCount: {
    color: theme.colors.ink4,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.line2,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.ink2,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyDescription: {
    marginTop: 6,
    color: theme.colors.ink3,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  timelineList: {
    marginTop: 6,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-start',
  },
  timeText: {
    color: theme.colors.ink3,
    fontSize: 12,
    fontWeight: '500',
  },
  timelineDot: {
    marginTop: 8,
    marginLeft: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineContent: {
    flex: 1,
    minWidth: 0,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeSoftDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  timelineTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  timelinePrimary: {
    marginTop: 5,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  timelineMeta: {
    marginTop: 3,
    color: theme.colors.ink3,
    fontSize: 12,
    fontWeight: '500',
  },
  timelineMemo: {
    marginTop: 4,
    color: theme.colors.ink3,
    fontSize: 12,
    lineHeight: 18,
  },
  calendarSection: {
    paddingHorizontal: 16,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  weekdayText: {
    flex: 1,
    paddingVertical: 4,
    textAlign: 'center',
    color: theme.colors.ink4,
    fontSize: 10,
    fontWeight: '500',
  },
  weekdaySunday: {
    color: theme.colors.temp,
  },
  weekdaySaturday: {
    color: theme.colors.sleep,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.2857%',
    aspectRatio: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  calendarDaySelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent,
  },
  calendarDayFuture: {
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    opacity: 0.4,
  },
  calendarDayEmpty: {
    width: '14.2857%',
    aspectRatio: 1,
  },
  calendarDayText: {
    color: theme.colors.ink2,
    fontSize: 13,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  calendarDots: {
    minHeight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  calendarDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  calendarLegend: {
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: theme.colors.ink2,
    fontSize: 11,
    fontWeight: '500',
  },
  monthSummary: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  monthStat: {
    flex: 1,
    paddingHorizontal: 14,
  },
  monthStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.line,
  },
  monthStatLabel: {
    color: theme.colors.ink3,
    fontSize: 11,
    fontWeight: '500',
  },
  monthStatValue: {
    marginTop: 2,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  monthStatSub: {
    color: theme.colors.ink3,
    fontSize: 11,
    fontWeight: '500',
  },
  calendarHint: {
    marginTop: 10,
    paddingHorizontal: 8,
    color: theme.colors.ink4,
    fontSize: 11,
    fontWeight: '500',
  },
});
