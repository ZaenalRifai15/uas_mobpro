import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="surveys/index" />
      <Stack.Screen name="surveys/create" />
      <Stack.Screen name="surveys/[id]" />
    </Stack>
  );
}
