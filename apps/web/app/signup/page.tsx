
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { getUserSlug } from "@/utils/urlHelpers";
import { z } from "zod";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const username = getUserSlug(session.user.name, session.user.email);
      router.push(`/dashboard/${username}`);
    }
  }, [status, session, router]);

  // Force light theme while this signup page is mounted, restore on unmount
  useEffect(() => {
    try {
      const root = document.documentElement;
      const prevTheme = root.getAttribute("data-theme");
      const hadLight = root.classList.contains("light");
      const hadDark = root.classList.contains("dark");
      const prevBg = root.style.getPropertyValue("--background");
      const prevFg = root.style.getPropertyValue("--foreground");

      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.setProperty("--background", "#ffffff");
      root.style.setProperty("--foreground", "#171717");

      return () => {
        if (prevTheme) root.setAttribute("data-theme", prevTheme);
        else root.removeAttribute("data-theme");

        root.classList.remove("light", "dark");
        if (hadLight) root.classList.add("light");
        if (hadDark) root.classList.add("dark");

        if (prevBg) root.style.setProperty("--background", prevBg);
        else root.style.removeProperty("--background");

        if (prevFg) root.style.setProperty("--foreground", prevFg);
        else root.style.removeProperty("--foreground");
      };
    } catch (e) {
      return;
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      // Don't set callbackUrl - let useEffect handle redirect with dynamic username
      await signIn("google", { redirect: false });
      // After successful sign-in, useEffect will redirect to /dashboard/[username]
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate form data with Zod
    try {
      const validatedData = signupSchema.parse(form);

      setLoading(true);
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });
      const data = await res.json();

      if (res.ok) {
        // Redirect to verify page with email
        router.push(
          `/verify?email=${encodeURIComponent(data.email || validatedData.email)}`
        );
      } else {
        setError(data.error || "Signup failed");
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle Zod validation errors
        const errors: Partial<Record<keyof SignupInput, string>> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof SignupInput] = issue.message;
          }
        });
        setFieldErrors(errors);
        setError("Please fix the errors below.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#FFFFFF",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated Ring with Colored Borders */}
      <div
        style={{
          position: "relative",
          width: "700px",
          height: "700px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Rotating Colored Ring 1 */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderTop: "5px solid #4ECDC4",
            borderRight: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "5px solid transparent",
            borderRadius: "50%",
            animation: "rotate 4s linear infinite",
          }}
        />

        {/* Rotating Colored Ring 2 */}
        <div
          style={{
            position: "absolute",
            width: "90%",
            height: "90%",
            borderTop: "5px solid #FF6B6B",
            borderRight: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "5px solid transparent",
            borderRadius: "50%",
            animation: "rotate 3s linear infinite reverse",
          }}
        />

        {/* Rotating Colored Ring 3 */}
        <div
          style={{
            position: "absolute",
            width: "80%",
            height: "80%",
            borderTop: "5px solid #FFE66D",
            borderRight: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "5px solid transparent",
            borderRadius: "50%",
            animation: "rotate 5s linear infinite",
          }}
        />

        {/* Signup Form Container */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "380px",
            padding: "3rem 2.5rem",
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: "16px",
            boxShadow: "0 15px 50px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: "#2C3E50",
                marginBottom: "2rem",
                textAlign: "center",
                letterSpacing: "-0.5px",
              }}
            >
              Sign Up
            </h2>

            {/* Name Input */}
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  // Clear field error on change
                  if (fieldErrors.name) {
                    setFieldErrors({ ...fieldErrors, name: undefined });
                  }
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  fontSize: "1rem",
                  border: `2px solid ${fieldErrors.name ? "#FF6B6B" : "#E8E8E8"}`,
                  borderRadius: "10px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: "#FAFAFA",
                  color: "#2C3E50",
                  marginBottom: "0.5rem",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.name ? "#FF6B6B" : "#4ECDC4";
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.name ? "#FF6B6B" : "#E8E8E8";
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                }}
              />
              {fieldErrors.name && (
                <div style={{ color: "#FF6B6B", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {fieldErrors.name}
                </div>
              )}
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  // Clear field error on change
                  if (fieldErrors.email) {
                    setFieldErrors({ ...fieldErrors, email: undefined });
                  }
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  fontSize: "1rem",
                  border: `2px solid ${fieldErrors.email ? "#FF6B6B" : "#E8E8E8"}`,
                  borderRadius: "10px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: "#FAFAFA",
                  color: "#2C3E50",
                  marginBottom: "0.5rem",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.email ? "#FF6B6B" : "#4ECDC4";
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.email ? "#FF6B6B" : "#E8E8E8";
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                }}
              />
              {fieldErrors.email && (
                <div style={{ color: "#FF6B6B", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  // Clear field error on change
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: undefined });
                  }
                }}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  fontSize: "1rem",
                  border: `2px solid ${fieldErrors.password ? "#FF6B6B" : "#E8E8E8"}`,
                  borderRadius: "10px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  backgroundColor: "#FAFAFA",
                  color: "#2C3E50",
                  marginBottom: "0.5rem",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.password ? "#FF6B6B" : "#4ECDC4";
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = fieldErrors.password ? "#FF6B6B" : "#E8E8E8";
                  e.currentTarget.style.backgroundColor = "#FAFAFA";
                }}
              />
              {fieldErrors.password && (
                <div style={{ color: "#FF6B6B", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  color: "#FF6B6B",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1.05rem",
                fontWeight: "600",
                color: "#FFFFFF",
                backgroundColor: loading ? "#95E1D3" : "#4ECDC4",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginBottom: "1.5rem",
                boxShadow: "0 4px 12px rgba(78, 205, 196, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#3DBDB0";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(78, 205, 196, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#4ECDC4";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(78, 205, 196, 0.3)";
                }
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#E8E8E8",
                }}
              />
              <span
                style={{
                  padding: "0 1rem",
                  color: "#7F8C8D",
                  fontSize: "0.9rem",
                }}
              >
                OR
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#E8E8E8",
                }}
              />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                fontWeight: "600",
                color: "#2C3E50",
                backgroundColor: "#FFFFFF",
                border: "2px solid #E8E8E8",
                borderRadius: "8px",
                cursor: googleLoading || loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
              }}
              onMouseEnter={(e) => {
                if (!googleLoading && !loading) {
                  e.currentTarget.style.backgroundColor = "#F8F9FA";
                  e.currentTarget.style.borderColor = "#4ECDC4";
                }
              }}
              onMouseLeave={(e) => {
                if (!googleLoading && !loading) {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#E8E8E8";
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading
                ? "Signing up with Google..."
                : "Continue with Google"}
            </button>

            {/* Links */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "0.9rem",
              }}
            >
              <span style={{ color: "#7F8C8D", marginRight: "0.5rem" }}>
                Already have an account?
              </span>
              <Link
                href="/login"
                style={{
                  color: "#4ECDC4",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#3DBDB0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4ECDC4")}
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style jsx>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}