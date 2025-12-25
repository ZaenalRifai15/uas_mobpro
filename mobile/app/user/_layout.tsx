import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="surveys/index" />
      <Stack.Screen name="surveys/[id]" />
    </Stack>
  );
}
