import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: colors.primary },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Panini Manager" }} />
        <Stack.Screen name="duplicates" options={{ title: "Repetidas" }} />
        <Stack.Screen name="missing" options={{ title: "Faltantes" }} />
        <Stack.Screen name="team/[code]" options={{ title: "Seleção" }} />
        <Stack.Screen name="section/[id]" options={{ title: "Seção" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
