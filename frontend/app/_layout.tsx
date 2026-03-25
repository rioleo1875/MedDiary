import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/otp" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthWrapper>
    </AuthProvider>
  );
}