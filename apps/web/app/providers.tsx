"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@repo/ui/app-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
