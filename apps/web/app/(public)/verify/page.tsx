"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  return (
    <div>
      <VerifyForm email={email} />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyForm({ email }: { email: string }) {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Verification failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || "Failed to resend code.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setResendLoading(false);
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
        position: "relative",
      }}
    >
      {/* Animated Ring */}
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
            borderTop: "5px solid transparent",
            borderRight: "5px solid #FF6B6B",
            borderBottom: "5px solid transparent",
            borderLeft: "5px solid transparent",
            borderRadius: "50%",
            animation: "rotate 6s linear infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "80%",
            height: "80%",
            borderTop: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: "5px solid #FFD93D",
            borderLeft: "5px solid transparent",
            borderRadius: "50%",
            animation: "rotate 8s linear infinite",
          }}
        />

        {/* Form Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            padding: "50px 40px",
            width: "450px",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 30px",
              boxShadow: "0 10px 30px rgba(78, 205, 196, 0.3)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#2C3E50",
              marginBottom: "10px",
            }}
          >
            Verify Your Email
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#7F8C8D",
              marginBottom: "30px",
            }}
          >
            We've sent a 6-digit code to
            <br />
            <strong style={{ color: "#4ECDC4" }}>{email}</strong>
          </p>

          {error && (
            <div
              style={{
                background: "#FFEBEE",
                color: "#C62828",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#E8F5E9",
                color: "#2E7D32",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginBottom: "30px",
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  style={{
                    width: "50px",
                    height: "60px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textAlign: "center",
                    border: "2px solid #E0E0E0",
                    borderRadius: "10px",
                    outline: "none",
                    transition: "all 0.3s ease",
                    color: "#2C3E50",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4ECDC4";
                    e.target.style.boxShadow = "0 0 0 3px rgba(78, 205, 196, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E0E0E0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              style={{
                width: "100%",
                padding: "16px",
                background:
                  loading || otp.join("").length !== 6
                    ? "#CCCCCC"
                    : "linear-gradient(135deg, #4ECDC4, #44A08D)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading || otp.join("").length !== 6 ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(78, 205, 196, 0.3)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading && otp.join("").length === 6) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          {/* Resend OTP */}
          <div style={{ marginTop: "25px" }}>
            <p style={{ fontSize: "14px", color: "#7F8C8D", marginBottom: "10px" }}>
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || resendTimer > 0}
              style={{
                background: "transparent",
                border: "none",
                color: resendTimer > 0 ? "#CCCCCC" : "#4ECDC4",
                fontSize: "14px",
                fontWeight: "600",
                cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                textDecoration: "underline",
              }}
            >
              {resendLoading
                ? "Sending..."
                : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Resend Code"}
            </button>
          </div>

          {/* Back to Login */}
          <div style={{ marginTop: "30px" }}>
            <Link
              href="/login"
              style={{
                fontSize: "14px",
                color: "#7F8C8D",
                textDecoration: "none",
              }}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}