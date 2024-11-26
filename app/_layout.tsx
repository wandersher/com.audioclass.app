import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FirebaseProvider } from "@/libs/firebase";
import { FirestoreProvider } from "@/libs/firestore";
import { PaperProvider } from "react-native-paper";
import { AudioProvider } from "@/libs/audio";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <FirebaseProvider>
          <FirestoreProvider>
            <AudioProvider>
              <Stack initialRouteName="index">
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="signin" options={{ headerShown: false }} />
                <Stack.Screen name="signup" options={{ headerShown: false }} />
                <Stack.Screen name="scanner" options={{ headerShown: false }} />
                <Stack.Screen name="home" options={{ headerShown: false }} />
                <Stack.Screen name="courses" options={{ headerShown: false }} />
                <Stack.Screen name="topics" options={{ headerShown: false }} />
                <Stack.Screen name="topic" options={{ headerShown: false }} />
                <Stack.Screen name="exercises" options={{ headerShown: false }} />
                <Stack.Screen name="answer" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ headerShown: false }} />
              </Stack>
            </AudioProvider>
          </FirestoreProvider>
        </FirebaseProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
