import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BabyLog, BabyLogType } from '../../src/domain/baby-logs';
import { parseBabyLogText } from '../../src/domain/parser';
import {
  createEditableParsedLog,
  createQuickLogCandidate,
  createTextLogCandidate,
  type EditableParsedLog,
  getLastSleepLogType,
  QUICK_LOG_ACTIONS,
  sortLogsByRecent,
  TEXT_LOG_TYPE_OPTIONS,
  type QuickLogActionId,
} from '../../src/features/logging';
import { APP_NAME } from '../../src/shared/app-info';
import { theme } from '../../src/shared/ui/theme';

export default function HomeScreen() {
  const [logs, setLogs] = useState<BabyLog[]>([]);
  const [textInput, setTextInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [pendingLog, setPendingLog] = useState<EditableParsedLog | null>(null);

  const recentLogs = useMemo(() => sortLogsByRecent(logs).slice(0, 5), [logs]);

  function handleQuickLog(actionId: QuickLogActionId) {
    setLogs((currentLogs) => {
      const now = new Date().toISOString();
      const nextLog = createQuickLogCandidate({
        actionId,
        now,
        sequence: currentLogs.length + 1,
        lastSleepLogType: getLastSleepLogType(sortLogsByRecent(currentLogs)),
      });

      return sortLogsByRecent([nextLog, ...currentLogs]);
    });
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

  function handleSavePendingLog() {
    if (pendingLog === null) {
      return;
    }

    setLogs((currentLogs) => {
      const now = new Date().toISOString();
      const nextLog = createTextLogCandidate({
        parsedLog: pendingLog,
        now,
        sequence: currentLogs.length + 1,
      });

      return sortLogsByRecent([nextLog, ...currentLogs]);
    });
    setPendingLog(null);
    setTextInput('');
    setParseError('');
  }

  function handleCancelPendingLog() {
    setPendingLog(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <View style={styles.header}>
          <View>
            <Text style={styles.childName}>하루</Text>
            <Text style={styles.dayCount}>D+120</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {logs.length > 0 ? '방금 기록됨' : '기록 대기'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{logs.length}</Text>
            <Text style={styles.summaryLabel}>오늘 기록</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {recentLogs[0] ? getLogTypeLabel(recentLogs[0].log_type) : '-'}
            </Text>
            <Text style={styles.summaryLabel}>마지막 기록</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>텍스트 기록</Text>
          <View style={styles.textLogPanel}>
            <TextInput
              multiline
              value={textInput}
              placeholder="예: 분유 120ml 먹었어"
              placeholderTextColor={theme.colors.muted}
              style={styles.textLogInput}
              textAlignVertical="top"
              onChangeText={(nextText) => {
                setTextInput(nextText);
                setParseError('');
              }}
            />
            {parseError.length > 0 ? (
              <Text style={styles.errorText}>{parseError}</Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleParseText}
            >
              <Text style={styles.primaryButtonText}>파싱하기</Text>
            </Pressable>
          </View>
        </View>

        {pendingLog === null ? null : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>파싱 결과 확인</Text>
            <View style={styles.confirmPanel}>
              <View style={styles.confirmHeader}>
                <Text style={styles.confirmTitle}>
                  {getLogTypeLabel(pendingLog.log_type)}
                </Text>
                <Text style={styles.confidenceText}>
                  신뢰도 {formatConfidence(pendingLog.confidence)}
                </Text>
              </View>
              <Text style={styles.originalText}>{pendingLog.original_text}</Text>

              <View style={styles.typeGrid}>
                {TEXT_LOG_TYPE_OPTIONS.map((logType) => (
                  <Pressable
                    key={logType}
                    accessibilityRole="button"
                    style={[
                      styles.typeButton,
                      pendingLog.log_type === logType && styles.typeButtonActive,
                    ]}
                    onPress={() => handlePendingLogChange({ log_type: logType })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        pendingLog.log_type === logType &&
                          styles.typeButtonTextActive,
                      ]}
                    >
                      {getLogTypeLabel(logType)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.editRow}>
                <View style={styles.editField}>
                  <Text style={styles.inputLabel}>수치</Text>
                  <TextInput
                    value={pendingLog.amountText}
                    keyboardType="decimal-pad"
                    placeholder="120"
                    placeholderTextColor={theme.colors.muted}
                    style={styles.singleLineInput}
                    onChangeText={(amountText) =>
                      handlePendingLogChange({ amountText })
                    }
                  />
                </View>
                <View style={styles.editField}>
                  <Text style={styles.inputLabel}>단위</Text>
                  <TextInput
                    value={pendingLog.unit}
                    placeholder="ml"
                    placeholderTextColor={theme.colors.muted}
                    style={styles.singleLineInput}
                    onChangeText={(unit) => handlePendingLogChange({ unit })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>메모</Text>
              <TextInput
                value={pendingLog.memo}
                placeholder="메모를 추가하세요"
                placeholderTextColor={theme.colors.muted}
                style={styles.memoInput}
                onChangeText={(memo) => handlePendingLogChange({ memo })}
              />

              <View style={styles.confirmActions}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                  ]}
                  onPress={handleCancelPendingLog}
                >
                  <Text style={styles.secondaryButtonText}>취소</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.confirmSaveButton,
                    pressed && styles.primaryButtonPressed,
                  ]}
                  onPress={handleSavePendingLog}
                >
                  <Text style={styles.primaryButtonText}>저장</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 기록</Text>
          <View style={styles.quickGrid}>
            {QUICK_LOG_ACTIONS.map((action) => (
              <Pressable
                key={action.id}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.quickButton,
                  pressed && styles.quickButtonPressed,
                ]}
                onPress={() => handleQuickLog(action.id)}
              >
                <Text style={styles.quickLabel}>{action.label}</Text>
                <Text style={styles.quickDetail}>{action.detail}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 타임라인</Text>
          {recentLogs.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyTimelineText}>
                첫 기록을 남기면 여기에 표시됩니다.
              </Text>
            </View>
          ) : (
            <View style={styles.timelineList}>
              {recentLogs.map((log) => (
                <View key={log.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>
                      {getLogTypeLabel(log.log_type)}
                    </Text>
                    <Text style={styles.timelineMeta}>
                      {formatLogTime(log.recorded_at)}
                      {formatLogValue(log)}
                    </Text>
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

  return ` · ${log.amount}${log.unit}`;
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
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
  appName: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  childName: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  dayCount: {
    marginTop: 2,
    color: theme.colors.muted,
    fontSize: 16,
    fontWeight: '600',
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
  summaryRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  textLogPanel: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  textLogInput: {
    minHeight: 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    marginTop: 8,
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
  },
  primaryButtonPressed: {
    opacity: 0.82,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  confirmPanel: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    padding: 14,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  confidenceText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  originalText: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  typeGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  typeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EDF6F1',
  },
  typeButtonText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  typeButtonTextActive: {
    color: theme.colors.primary,
  },
  editRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  editField: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: 6,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  singleLineInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
  },
  memoInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
  },
  confirmActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 46,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: theme.colors.background,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  confirmSaveButton: {
    flex: 1,
    marginTop: 0,
  },
  quickGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickButton: {
    width: '31.6%',
    minHeight: 82,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  quickButtonPressed: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EDF6F1',
  },
  quickLabel: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  quickDetail: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyTimeline: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 18,
  },
  emptyTimelineText: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  timelineList: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  timelineItem: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  timelineMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  timelineMemo: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
