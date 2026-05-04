import { useCallback, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createDefaultFamilyContext,
  getLogOwnerContext,
  getSelectedChild,
  type FamilyContext,
} from '../../src/domain/family';
import {
  createBabyPhoto,
  createBabyPhotoDateGroups,
  type BabyPhoto,
  type BabyPhotoDateGroup,
} from '../../src/domain/photos';
import {
  localFamilyContextRepository,
  remoteFamilyMappingRepository,
} from '../../src/features/family';
import {
  deleteBabyPhotoWithRemoteCleanup,
  loadBabyPhotosWithRemoteDownloads,
  localBabyPhotoRepository,
  refreshBabyPhotoDownloadUrl,
  saveBabyPhotoWithRemoteUpload,
} from '../../src/features/photos';
import {
  Badge,
  Body,
  Button,
  Caption,
  Chip,
  EmptyState,
  ScreenHeader,
  SectionLabel,
  Stack,
} from '../../src/shared/ui';
import { theme } from '../../src/shared/ui/theme';

type PhotoPeriodFilter = 'all' | 'today' | 'week' | 'month';

const PHOTO_PERIOD_FILTERS: readonly {
  id: PhotoPeriodFilter;
  label: string;
}[] = [
  { id: 'all', label: '전체' },
  { id: 'today', label: '오늘' },
  { id: 'week', label: '최근 7일' },
  { id: 'month', label: '이번 달' },
];

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<BabyPhoto[]>([]);
  const [periodFilter, setPeriodFilter] = useState<PhotoPeriodFilter>('all');
  const [familyContext, setFamilyContext] = useState<FamilyContext>(() =>
    createDefaultFamilyContext(new Date().toISOString()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshingPhotoIds, setRefreshingPhotoIds] = useState<Set<string>>(
    () => new Set(),
  );

  const now = new Date().toISOString();
  const selectedChild = useMemo(
    () => getSelectedChild(familyContext),
    [familyContext],
  );
  const ownerContext = useMemo(
    () => getLogOwnerContext(familyContext),
    [familyContext],
  );
  const photoGroups = useMemo(
    () =>
      createBabyPhotoDateGroups(photos, {
        familyId: familyContext.family.id,
        childId: selectedChild.id,
        now,
      }),
    [familyContext.family.id, now, photos, selectedChild.id],
  );
  const visiblePhotoGroups = useMemo(
    () => filterPhotoGroupsByPeriod(photoGroups, periodFilter, now),
    [now, periodFilter, photoGroups],
  );
  const totalPhotoCount = photoGroups.reduce(
    (count, group) => count + group.photos.length,
    0,
  );
  const visiblePhotoCount = visiblePhotoGroups.reduce(
    (count, group) => count + group.photos.length,
    0,
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);
      Promise.all([
        loadBabyPhotosWithRemoteDownloads({
          localRepository: localBabyPhotoRepository,
          mappingRepository: remoteFamilyMappingRepository,
        }),
        localFamilyContextRepository.getContext(new Date().toISOString()),
      ])
        .then(([photoResult, storedFamilyContext]) => {
          if (!isActive) {
            return;
          }

          setPhotos(photoResult.photos);
          setFamilyContext(storedFamilyContext);
          setErrorMessage('');
          setStatusMessage(
            photoResult.remoteStatus === 'failed'
              ? '로컬 사진만 표시 중입니다. 원격 사진은 불러오지 못했습니다.'
              : '',
          );
        })
        .catch(() => {
          if (isActive) {
            setErrorMessage('사진 정보를 불러오지 못했습니다.');
            setStatusMessage('');
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

  async function handlePickPhoto() {
    setStatusMessage('');
    setErrorMessage('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage('사진을 추가하려면 사진 보관함 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const capturedAt = new Date().toISOString();
    const nextPhoto = createBabyPhoto(
      {
        ...ownerContext,
        uri: asset.uri,
        width: normalizeDimension(asset.width),
        height: normalizeDimension(asset.height),
        file_name: asset.fileName ?? null,
        file_size: asset.fileSize ?? null,
        mime_type: asset.mimeType ?? null,
        captured_at: capturedAt,
      },
      {
        id: createClientPhotoId(capturedAt),
        now: capturedAt,
      },
    );

    try {
      const result = await saveBabyPhotoWithRemoteUpload(nextPhoto, {
        localRepository: localBabyPhotoRepository,
        mappingRepository: remoteFamilyMappingRepository,
      });

      setPhotos(result.photos);
      setPeriodFilter('all');
      setStatusMessage(
        result.remoteUploadStatus === 'pending'
          ? '사진을 추가했습니다. 원격 저장을 진행 중입니다.'
          : '사진을 추가했습니다.',
      );
      setErrorMessage('');
      result.remoteUpload
        ?.then((status) => {
          if (status === 'uploaded') {
            setStatusMessage('사진 원본을 원격 저장소에 저장했습니다.');
            localBabyPhotoRepository
              .listPhotos()
              .then(setPhotos)
              .catch(() => undefined);
          }

          if (status === 'skipped') {
            setStatusMessage('사진을 추가했습니다.');
          }

          if (status === 'failed') {
            setStatusMessage('');
            setErrorMessage(
              '사진은 기기에 저장했지만 원격 저장은 완료하지 못했습니다.',
            );
          }

          if (status === 'queued') {
            setStatusMessage(
              '사진은 기기에 저장했고 원격 저장은 나중에 다시 시도합니다.',
            );
          }
        })
        .catch(() => {
          setStatusMessage('');
          setErrorMessage(
            '사진은 기기에 저장했지만 원격 저장은 완료하지 못했습니다.',
          );
        });
    } catch {
      setErrorMessage('사진을 저장하지 못했습니다.');
      setStatusMessage('');
    }
  }

  function handleRequestDeletePhoto(photo: BabyPhoto) {
    Alert.alert('사진 삭제', '이 사진을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void handleDeletePhoto(photo);
        },
      },
    ]);
  }

  async function handleDeletePhoto(photo: BabyPhoto) {
    setStatusMessage('');
    setErrorMessage('');

    try {
      const result = await deleteBabyPhotoWithRemoteCleanup(photo, {
        localRepository: localBabyPhotoRepository,
        mappingRepository: remoteFamilyMappingRepository,
      });

      setPhotos((currentPhotos) =>
        currentPhotos.filter((currentPhoto) => currentPhoto.id !== photo.id),
      );
      setStatusMessage(
        result.remoteDeleteStatus === 'pending'
          ? '사진을 삭제했습니다. 원격 저장소 정리를 진행 중입니다.'
          : '사진을 삭제했습니다.',
      );

      result.remoteDelete
        ?.then((status) => {
          if (status === 'deleted') {
            setStatusMessage('사진과 원격 원본을 삭제했습니다.');
          }

          if (status === 'skipped') {
            setStatusMessage('사진을 삭제했습니다.');
          }

          if (status === 'failed') {
            setStatusMessage('');
            setErrorMessage(
              '사진은 삭제했지만 원격 원본 정리는 완료하지 못했습니다.',
            );
          }
        })
        .catch(() => {
          setStatusMessage('');
          setErrorMessage(
            '사진은 삭제했지만 원격 원본 정리는 완료하지 못했습니다.',
          );
        });
    } catch {
      setErrorMessage('사진을 삭제하지 못했습니다.');
      setStatusMessage('');
    }
  }

  async function handlePhotoImageError(photo: BabyPhoto) {
    if (
      photo.remote_media_asset_id === null ||
      photo.remote_media_asset_id === undefined ||
      refreshingPhotoIds.has(photo.id)
    ) {
      return;
    }

    setRefreshingPhotoIds((currentIds) => new Set(currentIds).add(photo.id));

    try {
      const result = await refreshBabyPhotoDownloadUrl(photo, {
        mappingRepository: remoteFamilyMappingRepository,
      });

      if (result.status === 'refreshed') {
        setPhotos((currentPhotos) =>
          currentPhotos.map((currentPhoto) =>
            currentPhoto.id === photo.id ? result.photo : currentPhoto,
          ),
        );
        setStatusMessage('');
        setErrorMessage('');
        return;
      }

      if (result.status === 'failed') {
        setStatusMessage('');
        setErrorMessage('원격 사진 URL을 새로 받지 못했습니다.');
      }
    } finally {
      setRefreshingPhotoIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(photo.id);

        return nextIds;
      });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScreenHeader
          eyebrow="사진"
          title={`${selectedChild.name} 사진`}
          sub="가족 안에서만 보는 비공개 기록이에요."
          trailing={
            <Badge tone="accent">
              {totalPhotoCount > 0 ? `${totalPhotoCount}장` : '비공개'}
            </Badge>
          }
          style={styles.header}
        />

        <View style={styles.topActionRow}>
          <View style={styles.privacyPill}>
            <Text style={styles.privacyIcon}>가족</Text>
            <Caption tone="ink3">가족만 볼 수 있어요</Caption>
          </View>
          <Button variant="primary" size="sm" onPress={handlePickPhoto}>
            + 사진 추가
          </Button>
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterList}>
              {PHOTO_PERIOD_FILTERS.map((filter) => (
                <Chip
                  key={filter.id}
                  active={periodFilter === filter.id}
                  onPress={() => setPeriodFilter(filter.id)}
                >
                  {filter.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
          <Caption tone="ink4" style={styles.filterCount}>
            {visiblePhotoCount}장
          </Caption>
        </View>

        <Stack gap={theme.spacing[3]} style={styles.messageStack}>
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
          {isLoading ? (
            <Body size="S" tone="ink3">
              사진을 불러오는 중입니다.
            </Body>
          ) : null}
        </Stack>

        {!isLoading && totalPhotoCount === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="아직 추가된 사진이 없습니다."
              sub="첫 사진을 추가하면 오늘 날짜 아래에 표시됩니다."
              action={
                <Button variant="soft" size="sm" onPress={handlePickPhoto}>
                  사진 추가
                </Button>
              }
            />
          </View>
        ) : null}

        {!isLoading && totalPhotoCount > 0 && visiblePhotoGroups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="해당하는 사진이 없어요."
              sub="다른 기간을 선택해 보세요."
            />
          </View>
        ) : null}

        {visiblePhotoGroups.map((group) => (
          <View key={group.dateKey} style={styles.daySection}>
            <SectionLabel
              action={
                <Caption tone="ink4" style={styles.photoCount}>
                  {group.photos.length}장
                </Caption>
              }
              style={styles.dayHeader}
            >
              {group.label}
            </SectionLabel>
            <View style={styles.photoGrid}>
              {group.photos.map((photo) => (
                <View key={photo.id} style={styles.photoTile}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                    onError={() => {
                      void handlePhotoImageError(photo);
                    }}
                  />
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoTime}>
                      {formatPhotoTime(photo.captured_at)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="사진 삭제"
                    hitSlop={8}
                    onPress={() => handleRequestDeletePhoto(photo)}
                    style={styles.photoDeleteButton}
                  >
                    <Text style={styles.photoDeleteText}>삭제</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function normalizeDimension(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function createClientPhotoId(now: string): string {
  return `photo-${new Date(now).getTime()}-${Math.random().toString(36).slice(2, 8)}`;
}

function filterPhotoGroupsByPeriod(
  groups: readonly BabyPhotoDateGroup[],
  period: PhotoPeriodFilter,
  now: string,
): BabyPhotoDateGroup[] {
  if (period === 'all') {
    return [...groups];
  }

  return groups
    .map((group) => ({
      ...group,
      photos: group.photos.filter((photo) =>
        isPhotoInPeriod(photo.captured_at, period, now),
      ),
    }))
    .filter((group) => group.photos.length > 0);
}

function isPhotoInPeriod(
  capturedAt: string,
  period: PhotoPeriodFilter,
  now: string,
): boolean {
  const capturedDate = new Date(capturedAt);
  const nowDate = new Date(now);
  const capturedTime = capturedDate.getTime();
  const nowTime = nowDate.getTime();

  if (!Number.isFinite(capturedTime) || capturedTime > nowTime) {
    return false;
  }

  if (period === 'today') {
    return capturedDate.toDateString() === nowDate.toDateString();
  }

  if (period === 'week') {
    return nowTime - capturedTime <= 7 * 24 * 60 * 60 * 1000;
  }

  return (
    capturedDate.getFullYear() === nowDate.getFullYear() &&
    capturedDate.getMonth() === nowDate.getMonth()
  );
}

function formatPhotoTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    paddingBottom: theme.spacing[8],
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingBottom: theme.spacing[4],
  },
  topActionRow: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  privacyPill: {
    minHeight: 32,
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  privacyIcon: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  filterSection: {
    paddingLeft: theme.spacing[5],
    paddingRight: theme.spacing[5],
    paddingBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  filterList: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    paddingRight: theme.spacing[2],
  },
  filterCount: {
    marginLeft: 'auto',
    fontVariant: ['tabular-nums'],
  },
  messageStack: {
    paddingHorizontal: theme.spacing[5],
  },
  emptyWrap: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[5],
  },
  daySection: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[5],
  },
  dayHeader: {
    paddingHorizontal: theme.spacing[1],
  },
  photoCount: {
    fontVariant: ['tabular-nums'],
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  photoTile: {
    width: '31.8%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.line,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.line,
  },
  photoOverlay: {
    position: 'absolute',
    left: theme.spacing[2],
    bottom: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    backgroundColor: 'rgba(26,24,22,0.56)',
  },
  photoTime: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  photoDeleteButton: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    minHeight: 28,
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radii.pill,
    backgroundColor: 'rgba(26,24,22,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoDeleteText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
