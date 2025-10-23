// This code defines a custom React hook to redirect unauthenticated users to the login page
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthRedirect(status: "authenticated" | "loading" | "unauthenticated") {
  const router = useRouter();
  // if user is unauthenticated, redirect to login page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
}
