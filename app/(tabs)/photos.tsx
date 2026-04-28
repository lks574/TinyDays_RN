import { useCallback, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import {
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
} from '../../src/domain/photos';
import { localFamilyContextRepository } from '../../src/features/family';
import { localBabyPhotoRepository } from '../../src/features/photos';
import { theme } from '../../src/shared/ui/theme';

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<BabyPhoto[]>([]);
  const [familyContext, setFamilyContext] = useState<FamilyContext>(() =>
    createDefaultFamilyContext(new Date().toISOString()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
        now: new Date().toISOString(),
      }),
    [familyContext.family.id, photos, selectedChild.id],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);
      Promise.all([
        localBabyPhotoRepository.listPhotos(),
        localFamilyContextRepository.getContext(new Date().toISOString()),
      ])
        .then(([storedPhotos, storedFamilyContext]) => {
          if (!isActive) {
            return;
          }

          setPhotos(storedPhotos);
          setFamilyContext(storedFamilyContext);
          setErrorMessage('');
        })
        .catch(() => {
          if (isActive) {
            setErrorMessage('사진 정보를 불러오지 못했습니다.');
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
    const now = new Date().toISOString();
    const nextPhoto = createBabyPhoto(
      {
        ...ownerContext,
        uri: asset.uri,
        width: normalizeDimension(asset.width),
        height: normalizeDimension(asset.height),
        file_name: asset.fileName ?? null,
        file_size: asset.fileSize ?? null,
        mime_type: asset.mimeType ?? null,
        captured_at: now,
      },
      {
        id: createClientPhotoId(now),
        now,
      },
    );

    try {
      const nextPhotos = await localBabyPhotoRepository.savePhoto(nextPhoto);

      setPhotos(nextPhotos);
      setStatusMessage('사진을 추가했습니다.');
      setErrorMessage('');
    } catch {
      setErrorMessage('사진을 저장하지 못했습니다.');
      setStatusMessage('');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>사진</Text>
          <Text style={styles.title}>{selectedChild.name} 사진</Text>
          <Text style={styles.subtitle}>
            가족 안에서만 보는 사진을 날짜별로 모아 봅니다.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.uploadButton,
            pressed && styles.uploadButtonPressed,
          ]}
          onPress={handlePickPhoto}
        >
          <Text style={styles.uploadButtonText}>사진 추가</Text>
        </Pressable>

        {errorMessage.length > 0 ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {statusMessage.length > 0 ? (
          <Text style={styles.statusText}>{statusMessage}</Text>
        ) : null}

        {isLoading ? (
          <Text style={styles.loadingText}>사진을 불러오는 중입니다.</Text>
        ) : null}

        {!isLoading && photoGroups.length === 0 ? (
          <View style={styles.emptyPanel}>
            <Text style={styles.emptyTitle}>아직 추가된 사진이 없습니다.</Text>
            <Text style={styles.emptyText}>
              첫 사진을 추가하면 오늘 날짜 아래에 표시됩니다.
            </Text>
          </View>
        ) : null}

        {photoGroups.map((group) => (
          <View key={group.dateKey} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{group.label}</Text>
              <Text style={styles.sectionCount}>{group.photos.length}장</Text>
            </View>
            <View style={styles.photoGrid}>
              {group.photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.photoMeta}>
                    {formatPhotoTime(photo.captured_at)}
                  </Text>
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

function formatPhotoTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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
    maxWidth: 340,
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  uploadButton: {
    marginTop: 24,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  uploadButtonPressed: {
    opacity: 0.78,
  },
  uploadButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 12,
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  statusText: {
    marginTop: 12,
    color: theme.colors.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 20,
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyPanel: {
    marginTop: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    gap: 8,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: 28,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionCount: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCard: {
    width: '48%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  photoImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.border,
  },
  photoMeta: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
