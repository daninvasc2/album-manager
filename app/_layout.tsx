import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Panini Manager" }} />
        <Stack.Screen name="duplicates" options={{ title: "Repetidas" }} />
        <Stack.Screen name="missing" options={{ title: "Faltantes" }} />
        <Stack.Screen name="team/[code]" options={{ title: "Seleção" }} />
        <Stack.Screen name="section/[id]" options={{ title: "Seção" }} />
      </Stack>
    </>
  );
}
