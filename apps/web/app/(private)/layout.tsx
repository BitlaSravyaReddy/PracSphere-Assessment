/**
 * Private Layout
 * This layout is for authenticated pages (dashboard, tasks, profile)
 * - Handles authentication check and redirect
 * - Shows loading state while checking session
 * - Individual pages use their own <Layout> component for Sidebar/TopBar
 */
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // Don't render content if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  // Just render children - pages handle their own Layout component
  return <>{children}</>;
}
