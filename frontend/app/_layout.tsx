import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthWrapper: Checking auth...');
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    console.log('AuthWrapper: Auth state changed', { isInitialized, isAuthenticated });
    // Only redirect if we're initialized and not authenticated
    if (isInitialized && !isAuthenticated) {
      console.log('AuthWrapper: Redirecting to login');
      router.replace("/auth/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Don't render anything until auth check is complete
  if (!isInitialized) {
    console.log('AuthWrapper: Not initialized yet');
    return null;
  }

  console.log('AuthWrapper: Rendering children');
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