import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
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
import { useSupabaseAuth } from '../../src/features/auth';
import { localFamilyContextRepository } from '../../src/features/family';
import {
  Badge,
  Body,
  Button,
  Caption,
  Field,
  Heading,
  ListRow,
  Mono,
  ScreenHeader,
  Section,
  SectionLabel,
  Stack,
} from '../../src/shared/ui';
import { theme } from '../../src/shared/ui/theme';

export default function FamilyScreen() {
  const auth = useSupabaseAuth();
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
  const dayCount = calculateDayCount(
    selectedChild.birth_date,
    new Date().toISOString(),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          eyebrow="가족"
          title="가족 설정"
          sub={`${familyContext.family.name}의 기록 기준을 관리합니다.`}
          trailing={<Badge tone="accent">비공개</Badge>}
          style={styles.header}
        />

        <Section
          label="원격 계정"
          action={
            <Badge tone={auth.session === null ? 'soft' : 'accent'}>
              {auth.session === null ? '로컬' : '연결됨'}
            </Badge>
          }
          flush
        >
          {auth.isConfigured ? (
            auth.session === null ? (
              <View style={styles.authPanel}>
                <Stack gap={theme.spacing[3]}>
                  <Body size="S" tone="ink3">
                    Supabase 계정은 가족 공유와 클라우드 백업에 사용됩니다.
                    로그인하지 않아도 로컬 기록은 계속 저장됩니다.
                  </Body>
                  <Field
                    label="이메일"
                    value={auth.email}
                    placeholder="parent@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={auth.setEmail}
                    compact
                  />
                  <Field
                    label="비밀번호"
                    value={auth.password}
                    placeholder="비밀번호"
                    secureTextEntry
                    onChangeText={auth.setPassword}
                    compact
                    noBorder
                  />
                </Stack>
                {auth.errorMessage.length > 0 ? (
                  <Body size="S" tone="temp">
                    {auth.errorMessage}
                  </Body>
                ) : null}
                {auth.statusMessage.length > 0 ? (
                  <Body size="S" tone="accent">
                    {auth.statusMessage}
                  </Body>
                ) : null}
                <View style={styles.authActions}>
                  <Button
                    variant="primary"
                    size="md"
                    style={styles.authActionButton}
                    disabled={auth.isLoading}
                    onPress={auth.signIn}
                  >
                    로그인
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    style={styles.authActionButton}
                    disabled={auth.isLoading}
                    onPress={auth.signUp}
                  >
                    가입
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.authPanel}>
                <Stack gap={theme.spacing[2]}>
                  <Heading size="S">
                    {auth.session.user.email ?? '원격 계정'}
                  </Heading>
                  <Body size="S" tone="ink3">
                    원격 계정 세션이 연결되어 있습니다. 아직 로컬 가족 정보와
                    원격 가족 생성은 분리되어 있습니다.
                  </Body>
                </Stack>
                {auth.errorMessage.length > 0 ? (
                  <Body size="S" tone="temp">
                    {auth.errorMessage}
                  </Body>
                ) : null}
                {auth.statusMessage.length > 0 ? (
                  <Body size="S" tone="accent">
                    {auth.statusMessage}
                  </Body>
                ) : null}
                <Button
                  variant="secondary"
                  size="md"
                  full
                  disabled={auth.isLoading}
                  onPress={auth.signOut}
                >
                  로그아웃
                </Button>
              </View>
            )
          ) : (
            <View style={styles.authPanel}>
              <Body size="S" tone="ink3">
                Supabase 환경 변수가 설정되지 않았습니다. 로컬 기록, 가족
                정보, 사진 저장은 계속 사용할 수 있습니다.
              </Body>
              <Stack gap={theme.spacing[1]}>
                {auth.config.status === 'missing_config'
                  ? auth.config.missingKeys.map((key) => (
                      <Mono key={key} tone="ink4">
                        {key}
                      </Mono>
                    ))
                  : null}
              </Stack>
            </View>
          )}
        </Section>

        <Section label="가족 정보" flush>
          <Field
            label="가족 이름"
            value={familyName}
            placeholder="우리 가족"
            onChangeText={setFamilyName}
            noBorder
          />
          <View style={styles.savePanel}>
            <Stack gap={theme.spacing[2]}>
              {errorMessage.length > 0 ? (
                <Body size="S" tone="temp">
                  {errorMessage}
                </Body>
              ) : null}
              {statusMessage.length > 0 ? (
                <Body size="S" tone="accent">
                  {statusMessage}
                </Body>
              ) : null}
            </Stack>
            <Button
              variant="primary"
              size="lg"
              full
              onPress={handleSaveFamilyContext}
            >
              저장
            </Button>
          </View>
        </Section>

        <Section label="등록된 아기" flush>
          <View style={styles.childSummary}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitial(selectedChild.name)}</Text>
            </View>
            <View style={styles.summaryText}>
              <Heading size="S">{selectedChild.name}</Heading>
              <Caption tone="ink3" style={styles.summaryMeta}>
                {selectedChild.birth_date === null
                  ? '생년월일 미등록'
                  : selectedChild.birth_date}
              </Caption>
            </View>
            <Badge tone={dayCount === null ? 'soft' : 'info'}>
              {formatDayCount(dayCount)}
            </Badge>
          </View>

          <Field
            label="아기 이름"
            value={childName}
            placeholder="하루"
            onChangeText={setChildName}
            compact
          />
          <Field
            label="생년월일"
            value={birthDate}
            placeholder="2025-12-30"
            keyboardType="numbers-and-punctuation"
            onChangeText={setBirthDate}
            compact
            noBorder
          />
        </Section>

        <View style={styles.sectionWrap}>
          <SectionLabel action={<Mono tone="ink4">1명</Mono>}>구성원</SectionLabel>
          <View style={styles.memberCard}>
            <ListRow
              leading={
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {getInitial(familyContext.current_member.name)}
                  </Text>
                </View>
              }
              title={
                <View style={styles.memberTitleRow}>
                  <Text style={styles.memberName}>
                    {familyContext.current_member.name}
                  </Text>
                  <Badge tone="soft">나</Badge>
                </View>
              }
              sub="현재 사용자"
              trailing={
                <View style={styles.roleBadge}>
                  <View
                    style={[
                      styles.roleDot,
                      {
                        backgroundColor: getRoleColor(
                          familyContext.current_member.role,
                        ),
                      },
                    ]}
                  />
                  <Text style={styles.roleText}>
                    {getRoleLabel(familyContext.current_member.role)}
                  </Text>
                </View>
              }
              divider={false}
            />
          </View>
        </View>

        <View style={styles.metaPanel}>
          <Caption tone="ink4">
            TinyDays는 가족 단위 비공개 앱이에요. 가족 정보, 사진과 건강 기록은
            외부에 공유되지 않아요.
          </Caption>
          <Mono tone="ink4" style={styles.idText}>
            family_id: {familyContext.family.id}
          </Mono>
          <Mono tone="ink4" style={styles.idText}>
            child_id: {selectedChild.id}
          </Mono>
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

function getRoleColor(role: FamilyContext['current_member']['role']): string {
  switch (role) {
    case 'parent':
      return theme.colors.accent;
    case 'family':
      return theme.colors.vitamin;
  }
}

function getInitial(value: string): string {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue.slice(0, 1) : '?';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    paddingTop: theme.spacing[3],
    paddingBottom: 32,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingBottom: theme.spacing[5],
  },
  authPanel: {
    gap: theme.spacing[4],
    padding: theme.spacing[5],
  },
  authActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  authActionButton: {
    flex: 1,
  },
  savePanel: {
    gap: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[5],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.line,
  },
  childSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    padding: theme.spacing[5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.diaperSoft,
  },
  avatarText: {
    color: theme.colors.diaper,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
  },
  summaryMeta: {
    marginTop: theme.spacing[1],
  },
  sectionWrap: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: 18,
  },
  memberCard: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentSoft,
  },
  memberAvatarText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  memberTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  memberName: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  roleBadge: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceSunk,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  roleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  roleText: {
    color: theme.colors.ink2,
    fontSize: 10,
    fontWeight: '700',
  },
  metaPanel: {
    gap: theme.spacing[2],
    paddingHorizontal: 32,
    paddingTop: theme.spacing[2],
  },
  idText: {
    marginTop: theme.spacing[1],
  },
});
