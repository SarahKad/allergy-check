import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { UserProvider, useUser } from './src/lib/UserContext';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { CheckResult } from './src/lib/anthropic';

type Route =
  | { name: 'home' }
  | { name: 'result'; result: CheckResult }
  | { name: 'settings' };

function Shell() {
  const { palette, mode } = useTheme();
  const { mode: userMode } = useUser();
  const [route, setRoute] = useState<Route>({ name: 'home' });

  let content: React.ReactNode;
  if (!userMode) {
    content = <WelcomeScreen onSettings={() => setRoute({ name: 'settings' })} />;
  } else if (route.name === 'home') {
    content = (
      <HomeScreen
        onResult={(r) => setRoute({ name: 'result', result: r })}
        onSettings={() => setRoute({ name: 'settings' })}
        onChangeUser={() => setRoute({ name: 'settings' })}
        requireApiKeySetup={() => setRoute({ name: 'settings' })}
      />
    );
  } else if (route.name === 'result') {
    content = (
      <ResultScreen
        result={route.result}
        onAgain={() => setRoute({ name: 'home' })}
        onHome={() => setRoute({ name: 'home' })}
      />
    );
  } else {
    content = <SettingsScreen onBack={() => setRoute({ name: 'home' })} />;
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: palette.bg }}>{content}</View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <Shell />
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
