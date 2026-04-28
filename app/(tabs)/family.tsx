import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  calculateDayCount,
  createDefaultFamilyContext,
  getSelectedChild,
  type FamilyContext,
} from '../../src/domain/family';
import { localFamilyContextRepository } from '../../src/features/family';
import { theme } from '../../src/shared/ui/theme';

export default function FamilyScreen() {
  const [familyContext, setFamilyContext] = useState<FamilyContext>(() =>
    createDefaultFamilyContext(new Date().toISOString()),
  );
  const [familyName, setFamilyName] = useState('');
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      localFamilyContextRepository
        .getContext(new Date().toISOString())
        .then((storedContext) => {
          if (!isActive) {
            return;
          }

          syncForm(storedContext);
          setErrorMessage('');
        })
        .catch(() => {
          if (isActive) {
            setErrorMessage('가족 정보를 불러오지 못했습니다.');
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  function syncForm(context: FamilyContext) {
    const child = getSelectedChild(context);

    setFamilyContext(context);
    setFamilyName(context.family.name);
    setChildName(child.name);
    setBirthDate(child.birth_date ?? '');
  }

  async function handleSaveFamilyContext() {
    const now = new Date().toISOString();
    const normalizedFamilyName = normalizeRequiredText(familyName, '우리 가족');
    const normalizedChildName = normalizeRequiredText(childName, '하루');
    const normalizedBirthDate = normalizeOptionalText(birthDate);

    if (
      normalizedBirthDate !== null &&
      calculateDayCount(normalizedBirthDate, now) === null
    ) {
      setErrorMessage('생년월일은 YYYY-MM-DD 형식의 오늘 이전 날짜로 입력해 주세요.');
      setStatusMessage('');
      return;
    }

    const selectedChild = getSelectedChild(familyContext);
    const nextContext: FamilyContext = {
      ...familyContext,
      family: {
        ...familyContext.family,
        name: normalizedFamilyName,
        updated_at: now,
      },
      children: familyContext.children.map((child) =>
        child.id === selectedChild.id
          ? {
              ...child,
              family_id: familyContext.family.id,
              name: normalizedChildName,
              birth_date: normalizedBirthDate,
              updated_at: now,
            }
          : child,
      ),
      current_member: {
        ...familyContext.current_member,
        family_id: familyContext.family.id,
      },
    };

    try {
      const savedContext =
        await localFamilyContextRepository.saveContext(nextContext);

      syncForm(savedContext);
      setStatusMessage('가족 정보를 저장했습니다.');
      setErrorMessage('');
    } catch {
      setErrorMessage('가족 정보를 저장하지 못했습니다.');
      setStatusMessage('');
    }
  }

  const selectedChild = getSelectedChild(familyContext);
  const dayCount = calculateDayCount(selectedChild.birth_date, new Date().toISOString());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>가족</Text>
          <Text style={styles.title}>{familyContext.family.name}</Text>
          <Text style={styles.subtitle}>
            기록은 현재 선택된 아기와 가족에 연결됩니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가족 정보</Text>
          <View style={styles.formPanel}>
            <Text style={styles.inputLabel}>가족 이름</Text>
            <TextInput
              value={familyName}
              placeholder="우리 가족"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              onChangeText={setFamilyName}
            />

            <Text style={styles.inputLabel}>아기 이름</Text>
            <TextInput
              value={childName}
              placeholder="하루"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              onChangeText={setChildName}
            />

            <Text style={styles.inputLabel}>생년월일</Text>
            <TextInput
              value={birthDate}
              placeholder="2025-12-30"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              keyboardType="numbers-and-punctuation"
              onChangeText={setBirthDate}
            />

            {errorMessage.length > 0 ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            {statusMessage.length > 0 ? (
              <Text style={styles.statusText}>{statusMessage}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleSaveFamilyContext}
            >
              <Text style={styles.primaryButtonText}>저장</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>등록된 아기</Text>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{selectedChild.name}</Text>
            <Text style={styles.cardMeta}>
              {selectedChild.birth_date === null
                ? '생년월일 미등록'
                : `${selectedChild.birth_date} · ${formatDayCount(dayCount)}`}
            </Text>
            <Text style={styles.idText}>child_id: {selectedChild.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>구성원과 권한</Text>
          <View style={styles.infoCard}>
            <View style={styles.memberRow}>
              <View>
                <Text style={styles.cardTitle}>
                  {familyContext.current_member.name}
                </Text>
                <Text style={styles.cardMeta}>현재 사용자</Text>
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>
                  {getRoleLabel(familyContext.current_member.role)}
                </Text>
              </View>
            </View>
            <Text style={styles.idText}>family_id: {familyContext.family.id}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function normalizeRequiredText(value: string, fallback: string): string {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : fallback;
}

function normalizeOptionalText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function formatDayCount(dayCount: number | null): string {
  return dayCount === null ? 'D+ 계산 불가' : `D+${dayCount}`;
}

function getRoleLabel(role: FamilyContext['current_member']['role']): string {
  switch (role) {
    case 'parent':
      return 'parent';
    case 'family':
      return 'family';
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
    gap: 8,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  formPanel: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  inputLabel: {
    marginTop: 12,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  errorText: {
    marginTop: 12,
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
  statusText: {
    marginTop: 12,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 16,
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
  infoCard: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardMeta: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  idText: {
    marginTop: 12,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rolePill: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFD8CC',
    backgroundColor: '#EDF6F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
});
