"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// ----------------------
// Theme Provider + Toggle
// ----------------------

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  
  // Apply both data-theme attribute and class for compatibility
  root.setAttribute("data-theme", theme);
  
  // Remove both classes first
  root.classList.remove("light", "dark");
  
  // Add the appropriate class
  root.classList.add(theme);
  
  // Sync CSS variables used by the app
  const isDark = theme === "dark";
  root.style.setProperty("--background", isDark ? "#0a0a0a" : "#ffffff");
  root.style.setProperty("--foreground", isDark ? "#ededed" : "#171717");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Hydrate theme from localStorage or prefers-color-scheme
    if (typeof window === "undefined") return;
    const saved = (localStorage.getItem("theme") as Theme | null);
    const initial: Theme = saved ?? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem("theme", t);
    applyTheme(t);
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid rgba(127,127,127,0.2)",
        background: "transparent",
        color: "var(--foreground)",
        cursor: "pointer",
        transition: "transform 150ms ease, background 150ms ease",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <span style={{ width: 18, height: 18, display: "inline-block" }}>
        {isDark ? (
          // Sun icon
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          // Moon icon
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

// ----------------------
// Basic UI building blocks
// ----------------------

export function Panel({ children, maxWidth = 440, style, className }: { children: React.ReactNode; maxWidth?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth,
        padding: 24,
        borderRadius: 14,
        background: "rgba(127,127,127,0.06)",
        backdropFilter: "saturate(120%) blur(6px)",
        border: "1px solid rgba(127,127,127,0.18)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
        color: "var(--foreground)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, type, loading, style, className }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; loading?: boolean; style?: React.CSSProperties; className?: string }) {
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={loading}
      className={className}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid transparent",
        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "white",
        fontWeight: 600,
        letterSpacing: 0.2,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "filter 120ms ease, transform 120ms ease, opacity 120ms ease",
        opacity: loading ? 0.8 : 1,
        ...style,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export function TextInput({ label, type = "text", value, onChange, placeholder, disabled }: { label?: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <label style={{ display: "block", width: "100%" }}>
      {label && <div style={{ fontSize: 12, marginBottom: 6, opacity: 0.8 }}>{label}</div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(127,127,127,0.35)",
          background: "rgba(255,255,255,0.02)",
          color: "var(--foreground)",
          outline: "none",
          transition: "border-color 140ms ease, box-shadow 140ms ease",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(127,127,127,0.35)")}
      />
    </label>
  );
}

// ----------------------
// Animations
// ----------------------

export function FadeIn({ children, delay = 0, as: Tag = "div", style, className }: { children: React.ReactNode; delay?: number; as?: any; style?: React.CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const base: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(12px)",
    transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
  };

  return (
    <Tag ref={ref} style={{ ...base, ...style }} className={className}>
      {children}
    </Tag>
  );
}

// ----------------------
// Layout: Sidebar + Topbar for Dashboard
// ----------------------

export interface NavLink {
  label: string;
  href: string;
}

function Avatar({ name, email }: { name?: string | null; email?: string | null }) {
  const letter = (name || email || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      title={email || name || undefined}
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6366f1, #22d3ee)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {letter}
    </div>
  );
}

export function Topbar({ userName, userEmail, onLogout, style, className }: { userName?: string | null; userEmail?: string | null; onLogout?: () => void; style?: React.CSSProperties; className?: string }) {
  const { theme } = useTheme();
  const logo = theme === "dark" ? "/turborepo-dark.svg" : "/turborepo-light.svg";
  return (
    <header
      className={className}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 16px",
        background: "rgba(127,127,127,0.08)",
        backdropFilter: "saturate(120%) blur(8px)",
        borderBottom: "1px solid rgba(127,127,127,0.18)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={logo} alt="logo" width={28} height={28} />
        <strong style={{ letterSpacing: 0.2 }}>TaskApp</strong>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle />
        <Avatar name={userName ?? undefined} email={userEmail ?? undefined} />
        {onLogout && (
          <button
            title="Logout"
            onClick={onLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(127,127,127,0.2)",
              background: "transparent",
              color: "var(--foreground)",
              cursor: "pointer",
              transition: "background 150ms ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span style={{ fontSize: 12 }}>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}

export function Sidebar({ links = defaultLinks, activePath, onLogout, style, className }: { links?: NavLink[]; activePath?: string; onLogout?: () => void; style?: React.CSSProperties; className?: string }) {
  return (
    <aside
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 240,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "rgba(127,127,127,0.08)",
        backdropFilter: "saturate(120%) blur(8px)",
        borderRight: "1px solid rgba(127,127,127,0.18)",
        animation: "slideIn 380ms ease both",
        ...style,
      }}
    >
      <style>{`@keyframes slideIn { from { transform: translateX(-16px); opacity: 0.6 } to { transform: translateX(0); opacity: 1 } }`}</style>
      {links.map((l) => {
        const isActive = activePath && l.href !== "logout" && activePath.startsWith(l.href);
        const base: React.CSSProperties = {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          color: "var(--foreground)",
          textDecoration: "none",
          border: isActive ? "1px solid rgba(99,102,241,0.45)" : "1px solid transparent",
          background: isActive ? "rgba(99,102,241,0.16)" : "transparent",
          transition: "background 140ms ease, border-color 140ms ease",
          cursor: "pointer",
        };
        if (l.href === "logout") {
          return (
            <button key={l.label} onClick={onLogout} style={base}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {l.label}
            </button>
          );
        }
        return (
          <a key={l.href} href={l.href} style={base}>
            <span style={{ width: 16, height: 16, display: "inline-block" }}>
              {/* simple square icon placeholder */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
            </span>
            {l.label}
          </a>
        );
      })}
      <div style={{ marginTop: "auto", opacity: 0.6, fontSize: 12 }}>v1.0</div>
    </aside>
  );
}

const defaultLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks", href: "/tasks" },
  { label: "Profile", href: "/profile" },
  { label: "Logout", href: "logout" },
];

export function DashboardLayout({ children, links = defaultLinks, activePath = "/dashboard", onLogout, userName, userEmail }: { children: React.ReactNode; links?: NavLink[]; activePath?: string; onLogout?: () => void; userName?: string | null; userEmail?: string | null }) {
  const leftWidth = 240;
  return (
    <div style={{ minHeight: "100vh", display: "flex", color: "var(--foreground)", background: "var(--background)" }}>
      <Sidebar links={links} activePath={activePath} onLogout={onLogout} />
      <div style={{ marginLeft: leftWidth, flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar userName={userName} userEmail={userEmail} onLogout={onLogout} />
        <main style={{ padding: 20 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
