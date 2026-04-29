import 'react-native-url-polyfill/auto';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../src/shared/ui/theme';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
    </>
  );
}
