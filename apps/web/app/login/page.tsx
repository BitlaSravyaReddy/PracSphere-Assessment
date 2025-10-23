
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { z } from "zod";

// Login page component that supports both credential login and Google OAuth
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | React.ReactNode>("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Initiate Google OAuth sign-in flow
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  // Handle credential-based login with email and password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate form data with Zod schema before submitting
    try {
      const validatedData = loginSchema.parse(form);

      setLoading(true);
      const res = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      
      if (res?.ok) {
        router.push("/dashboard");
      } else {
        const errorMessage = res?.error || "Invalid credentials";

        // Show a special error with a verification link if email is not verified
        if (errorMessage.includes("verify your email")) {
          setError(
            <span>
              {errorMessage}{" "}
              <Link
                href={`/verify?email=${encodeURIComponent(form.email)}`}
                style={{
                  color: "#4ECDC4",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
              >
                Verify now
              </Link>
            </span>
          );
        } else {
          setError(errorMessage);
        }
      }
      setLoading(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Extract and display field-specific validation errors from Zod
        const errors: Partial<Record<keyof LoginInput, string>> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0] as keyof LoginInput] = issue.message;
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
      {/* Three animated rotating rings with different speeds and colors creating a dynamic background effect */}
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

        {/* Login Form Container */}
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
          <form onSubmit={handleLogin}>
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
              Login
            </h2>

            {/* Email input field with validation error display and dynamic border colors */}
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  // Clear field-specific error when user starts typing
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

            {/* Password input field with validation error display and dynamic styling */}
            <div style={{ marginBottom: "1.5rem" }}>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  // Clear field-specific error when user starts typing
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
              {loading ? "Signing in..." : "Sign In"}
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
                ? "Signing in with Google..."
                : "Continue with Google"}
            </button>

            {/* Links */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.9rem",
              }}
            >
              <a
                href="#"
                style={{
                  color: "#7F8C8D",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#4ECDC4")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#7F8C8D")}
              >
                Forgot Password?
              </a>
              <Link
                href="/signup"
                style={{
                  color: "#4ECDC4",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#3DBDB0")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4ECDC4")}
              >
                Sign Up
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