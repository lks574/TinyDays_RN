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

import type { BabyLog } from '../../src/domain/baby-logs';
import { localBabyLogRepository } from '../../src/features/logging';
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

export default function LogsScreen() {
  const [logs, setLogs] = useState<BabyLog[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getTimelineDateKey(new Date().toISOString()),
  );
  const [typeFilter, setTypeFilter] = useState<TimelineTypeFilter>('all');
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [storageError, setStorageError] = useState('');

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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoadingLogs(true);
      localBabyLogRepository
        .listLogs()
        .then((storedLogs) => {
          if (!isActive) {
            return;
          }

          setLogs(storedLogs);
          setStorageError('');

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
          <View>
            <Text style={styles.eyebrow}>기록</Text>
            <Text style={styles.title}>날짜별 타임라인</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {isLoadingLogs ? '불러오는 중' : `${visibleLogs.length}개`}
            </Text>
          </View>
        </View>

        {storageError.length > 0 ? (
          <Text style={styles.errorText}>{storageError}</Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>날짜</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          >
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
                    {option.count}개
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>필터</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {TIMELINE_TYPE_FILTERS.map((filter) => {
              const isSelected = filter === typeFilter;

              return (
                <Pressable
                  key={filter}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.filterButton,
                    isSelected && styles.filterButtonActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setTypeFilter(filter)}
                >
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
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.timelineHeader}>
            <Text style={styles.sectionTitle}>
              {selectedDateOption?.label ?? selectedDateKey}
            </Text>
            <Text style={styles.timelineCount}>{visibleLogs.length}개 기록</Text>
          </View>

          {visibleLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>표시할 기록이 없습니다</Text>
              <Text style={styles.emptyDescription}>
                홈에서 빠른 기록이나 텍스트 기록을 남기면 이 날짜에 표시됩니다.
              </Text>
            </View>
          ) : (
            <View style={styles.timelineList}>
              {visibleLogs.map((log) => (
                <View key={log.id} style={styles.timelineItem}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeText}>
                      {formatLogTime(log.recorded_at)}
                    </Text>
                    <View style={styles.timelineDot} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>
                      {getBabyLogTypeLabel(log.log_type)}
                    </Text>
                    <Text style={styles.timelineMeta}>{formatLogMeta(log)}</Text>
                    {log.memo === null ? null : (
                      <Text style={styles.timelineMemo}>{log.memo}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  statusPill: {
    minWidth: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  dateList: {
    gap: 10,
    paddingTop: 12,
    paddingRight: 20,
  },
  dateButton: {
    minWidth: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EDF6F1',
  },
  dateButtonLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  dateButtonLabelActive: {
    color: theme.colors.primary,
  },
  dateButtonMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  dateButtonMetaActive: {
    color: theme.colors.primary,
  },
  filterList: {
    gap: 8,
    paddingTop: 12,
    paddingRight: 20,
  },
  filterButton: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: theme.colors.surface,
  },
  pressed: {
    opacity: 0.82,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineCount: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 18,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDescription: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  timelineList: {
    marginTop: 12,
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    width: 58,
    alignItems: 'center',
  },
  timeText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  timelineDot: {
    marginTop: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  timelineContent: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  timelineMeta: {
    marginTop: 5,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  timelineMemo: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
