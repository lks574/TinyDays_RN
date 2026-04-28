import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BabyLog } from '../../src/domain/baby-logs';
import { createWeeklyInsights } from '../../src/domain/insights';
import { localBabyLogRepository } from '../../src/features/logging';
import { theme } from '../../src/shared/ui/theme';

export default function InsightsScreen() {
  const [logs, setLogs] = useState<BabyLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [storageError, setStorageError] = useState('');
  const insights = useMemo(
    () => createWeeklyInsights(logs, new Date().toISOString()),
    [logs],
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
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>인사이트</Text>
            <Text style={styles.title}>최근 7일 패턴</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {isLoadingLogs ? '불러오는 중' : `${insights.totalLogCount}개`}
            </Text>
          </View>
        </View>

        {storageError.length > 0 ? (
          <Text style={styles.errorText}>{storageError}</Text>
        ) : null}

        <View style={styles.rangePanel}>
          <Text style={styles.rangeLabel}>
            {formatDateKey(insights.startDateKey)} -{' '}
            {formatDateKey(insights.endDateKey)}
          </Text>
          <Text style={styles.rangeDescription}>
            수유, 수면, 기저귀 기록만 기본 패턴에 반영합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>다음 행동 안내</Text>
          <View style={styles.nextActionPanel}>
            <Text style={styles.nextActionTitle}>{insights.nextAction.title}</Text>
            <Text style={styles.nextActionDescription}>
              {insights.nextAction.description}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7일 요약</Text>
          <View style={styles.metricGrid}>
            <MetricCard
              label="수유"
              value={`${insights.feeding.count}회`}
              detail={`총 ${formatAmount(
                insights.feeding.totalAmount,
                insights.feeding.unit,
              )} · 하루 ${formatAverage(insights.feeding.averageCountPerDay)}회`}
            />
            <MetricCard
              label="수면"
              value={formatDuration(insights.sleep.totalMinutes)}
              detail={`${insights.sleep.count}회 · 하루 ${formatDuration(
                insights.sleep.averageMinutesPerDay,
              )}`}
            />
            <MetricCard
              label="기저귀"
              value={`${insights.diaper.totalCount}회`}
              detail={`소변 ${insights.diaper.peeCount} · 대변 ${
                insights.diaper.poopCount
              } · 하루 ${formatAverage(insights.diaper.averageCountPerDay)}회`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function formatDateKey(dateKey: string): string {
  const [, month, day] = dateKey.split('-');

  return `${Number(month)}월 ${Number(day)}일`;
}

function formatAmount(amount: number, unit: string | null): string {
  if (amount === 0 || unit === null) {
    return '0';
  }

  return `${amount}${unit}`;
}

function formatAverage(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDuration(totalMinutes: number): string {
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
  rangePanel: {
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  rangeLabel: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  rangeDescription: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  nextActionPanel: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFD8CC',
    backgroundColor: '#EDF6F1',
    padding: 16,
  },
  nextActionTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  nextActionDescription: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  metricGrid: {
    marginTop: 12,
    gap: 12,
  },
  metricCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  metricValue: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  metricDetail: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
