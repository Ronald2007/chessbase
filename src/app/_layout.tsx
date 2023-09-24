import { Slot } from "expo-router";
import { StatusBar, setStatusBarBackgroundColor } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    setStatusBarBackgroundColor("#ffffff", false);
  }, []);

  return (
    <>
      <SafeAreaView>
        <StatusBar backgroundColor="#ffffff" />
        <Slot />
      </SafeAreaView>
    </>
  );
}
