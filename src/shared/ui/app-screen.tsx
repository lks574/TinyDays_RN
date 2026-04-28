import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_NAME } from '../app-info';
import { theme } from './theme';

type AppScreenProps = {
  title: string;
  description: string;
};

export function AppScreen({ title, description }: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    backgroundColor: theme.colors.background,
  },
  appName: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  description: {
    marginTop: 12,
    maxWidth: 320,
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
});
