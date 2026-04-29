import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BabyLog } from '../../src/domain/baby-logs';
import {
  createDailyInsightBars,
  createWeeklyInsights,
} from '../../src/domain/insights';
import { localBabyLogRepository } from '../../src/features/logging';
import { theme } from '../../src/shared/ui/theme';

type InsightType = 'feed' | 'sleep' | 'diaper';

type InsightCardProps = {
  type: InsightType;
  title: string;
  headline: string;
  sub: string;
  bars: readonly number[];
  max: number;
  days: readonly string[];
  formatter?: (value: number) => string;
};

const insightTone: Record<InsightType, { color: string; soft: string }> = {
  feed: { color: theme.colors.feed, soft: theme.colors.feedSoft },
  sleep: { color: theme.colors.sleep, soft: theme.colors.sleepSoft },
  diaper: { color: theme.colors.diaper, soft: theme.colors.diaperSoft },
};

export default function InsightsScreen() {
  const [logs, setLogs] = useState<BabyLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [storageError, setStorageError] = useState('');
  const now = new Date().toISOString();
  const insights = useMemo(() => createWeeklyInsights(logs, now), [logs, now]);
  const dailyBars = useMemo(() => createDailyInsightBars(logs, now), [logs, now]);

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
          <Text style={styles.eyebrow}>인사이트</Text>
          <Text style={styles.title}>최근 7일 패턴</Text>
          <Text style={styles.subtitle}>
            {formatDateKey(insights.startDateKey)} -{' '}
            {formatDateKey(insights.endDateKey)} ·{' '}
            {isLoadingLogs ? '불러오는 중' : `${insights.totalLogCount}개 기록`}
          </Text>
        </View>

        {storageError.length > 0 ? (
          <Text style={styles.errorText}>{storageError}</Text>
        ) : null}

        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeBadge}>참고</Text>
            <Text style={styles.noticeTitle}>{insights.nextAction.title}</Text>
          </View>
          <Text style={styles.noticeBody}>{insights.nextAction.description}</Text>
          <Text style={styles.noticeFootnote}>
            기록을 모아 만든 단순 규칙이에요. 의학적 안내가 아니에요.
          </Text>
        </View>

        <View style={styles.cardStack}>
          <InsightCard
            type="feed"
            title="수유"
            headline={`하루 평균 ${formatAverage(
              insights.feeding.averageCountPerDay,
            )}회 · ${formatAmount(
              insights.feeding.averageAmountPerDay,
              insights.feeding.unit,
            )}`}
            sub={`7일 합계 ${insights.feeding.count}회 · ${formatAmount(
              insights.feeding.totalAmount,
              insights.feeding.unit,
            )}`}
            bars={dailyBars.feed}
            max={Math.max(1, ...dailyBars.feed)}
            days={dailyBars.days}
          />
          <InsightCard
            type="sleep"
            title="수면"
            headline={`하루 평균 ${formatDuration(
              insights.sleep.averageMinutesPerDay,
            )}`}
            sub={`7일 합계 ${insights.sleep.count}회 · ${formatDuration(
              insights.sleep.totalMinutes,
            )}`}
            bars={dailyBars.sleep}
            max={Math.max(60, ...dailyBars.sleep)}
            days={dailyBars.days}
            formatter={(value) => formatDuration(value)}
          />
          <InsightCard
            type="diaper"
            title="기저귀"
            headline={`하루 평균 ${formatAverage(
              insights.diaper.averageCountPerDay,
            )}회`}
            sub={`소변 ${insights.diaper.peeCount} · 대변 ${insights.diaper.poopCount}`}
            bars={dailyBars.diaper}
            max={Math.max(1, ...dailyBars.diaper)}
            days={dailyBars.days}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InsightCard({
  type,
  title,
  headline,
  sub,
  bars,
  max,
  days,
  formatter,
}: InsightCardProps) {
  const tone = insightTone[type];

  return (
    <View style={styles.insightCard}>
      <View style={styles.cardTitleRow}>
        <View style={[styles.typeDot, { backgroundColor: tone.color }]} />
        <Text style={styles.cardLabel}>{title}</Text>
      </View>
      <Text style={styles.cardHeadline}>{headline}</Text>
      <Text style={styles.cardSub}>{sub}</Text>

      <View style={styles.chart}>
        {bars.map((value, index) => {
          const isToday = index === bars.length - 1;
          const heightPercent = Math.max(6, Math.round((value / max) * 100));

          return (
            <View key={`${days[index]}-${index}`} style={styles.barSlot}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isToday ? tone.color : tone.soft,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
                {days[index]}
              </Text>
              <Text style={styles.barValue}>
                {formatter === undefined ? value : formatter(value)}
              </Text>
            </View>
          );
        })}
      </View>
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

  return `${formatAverage(amount)}${unit}`;
}

function formatAverage(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDuration(totalMinutes: number): string {
  if (totalMinutes === 0) {
    return '0분';
  }

  const roundedMinutes = Math.round(totalMinutes);
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

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
    marginBottom: 12,
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
  noticeCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  noticeBadge: {
    overflow: 'hidden',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surfaceSunk,
    paddingHorizontal: 7,
    paddingVertical: 3,
    color: theme.colors.ink3,
    fontSize: 10,
    fontWeight: '500',
  },
  noticeTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  noticeBody: {
    color: theme.colors.ink2,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  noticeFootnote: {
    marginTop: 8,
    color: theme.colors.ink4,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },
  cardStack: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardLabel: {
    color: theme.colors.ink3,
    fontSize: 12,
    fontWeight: '500',
  },
  cardHeadline: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0,
  },
  cardSub: {
    marginTop: 3,
    color: theme.colors.ink3,
    fontSize: 12,
    fontWeight: '500',
  },
  chart: {
    height: 92,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 14,
  },
  barSlot: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    width: '100%',
    height: 56,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 3,
    borderRadius: 3,
  },
  dayLabel: {
    color: theme.colors.ink4,
    fontSize: 9,
    fontWeight: '500',
  },
  dayLabelActive: {
    color: theme.colors.ink2,
    fontWeight: '600',
  },
  barValue: {
    color: theme.colors.ink4,
    fontSize: 9,
    fontWeight: '500',
  },
});
