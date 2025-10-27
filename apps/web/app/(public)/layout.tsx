/**
 * Public Layout
 * This layout is for unauthenticated pages (landing, login, signup)
 * - No sidebar or topbar
 * - Clean, minimal layout for marketing/auth pages
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}
