import { Slot } from "expo-router";
import {
  StatusBar,
  setStatusBarTranslucent,
  setStatusBarStyle,
} from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    setStatusBarStyle("dark");
    setStatusBarTranslucent(false);
  }, []);

  return (
    <SafeAreaView>
      <StatusBar translucent={false} style="dark" />
      <Slot />
    </SafeAreaView>
  );
}
