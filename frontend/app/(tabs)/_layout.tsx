import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)/index" />
      <Stack.Screen name="(tabs)/family" />
      <Stack.Screen name="(tabs)/medications" />
      <Stack.Screen name="(tabs)/tests" />
      <Stack.Screen name="(tabs)/immunizations" />
      <Stack.Screen name="(tabs)/emergency" />
      <Stack.Screen name="(tabs)/summary" />
    </Stack>
  );
}
