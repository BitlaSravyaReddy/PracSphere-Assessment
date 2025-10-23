"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@repo/ui/app-ui";
import Image from "next/image";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Navigation Header */}
      <header
        style={{
          padding: "1.5rem 4rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <FadeIn delay={0}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Image
              src="/karthavyalogo.png"
              alt="Karthavya Logo"
              width={500}
              height={100}
              style={{
                display: "flex",
                width: "300px",
                height: "80px",
                objectFit: "cover",
              }}
              priority
            />
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <nav style={{ display: "flex", gap: "3rem", alignItems: "center" }}>
  
            <Link
              href="/login"
              style={{
                color: "#4ECDC4",
                textDecoration: "none",
                fontWeight: "600",
                padding: "0.7rem 1.8rem",
                border: "2px solid #4ECDC4",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#4ECDC4";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#4ECDC4";
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              style={{
                color: "#FFFFFF",
                textDecoration: "none",
                fontWeight: "600",
                padding: "0.7rem 1.8rem",
                backgroundColor: "#FF6B6B",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FF5252";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(255, 107, 107, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FF6B6B";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(255, 107, 107, 0.3)";
              }}
            >
              Sign Up
            </Link>
          </nav>
        </FadeIn>
      </header>

      {/* Hero Section */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "55% 45%",
          gap: "2rem",
          padding: "0.75rem 4rem 4rem 4rem",
          maxWidth: "1600px",
          margin: "0 auto",
          alignItems: "center",
          minHeight: "calc(100vh - 120px)",
          position: "relative",
          marginTop: "-1.5rem",
        }}
      >
        {/* Background Decorative Elements */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            backgroundColor: "#FFE66D",
            borderRadius: "50%",
            top: "-200px",
            left: "-200px",
            opacity: "0.15",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            backgroundColor: "#4ECDC4",
            borderRadius: "50%",
            bottom: "-150px",
            right: "-150px",
            opacity: "0.15",
            zIndex: 0,
          }}
        />

        {/* Left Content */}
        <div style={{ paddingLeft: "2rem", position: "relative", zIndex: 1 }}>
          <FadeIn delay={200}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.4rem",
                backgroundColor: "#FFF4E6",
                borderRadius: "50px",
                marginBottom: "2rem",
                border: "1px solid #FFE66D",
                position: "relative",
                top: "-2.5rem",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#FFB84D",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  color: "#FF9F43",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  letterSpacing: "0.3px",
                }}
              >
                Professional Task Management
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <h1
              style={{
                fontSize: "4.5rem",
                fontWeight: "800",
                color: "#2C3E50",
                lineHeight: "1.15",
                marginTop: "-2rem",
                marginBottom: "2rem",
                letterSpacing: "-2px",
              }}
            >
              Complete Your
              <br />
              <span style={{ color: "#4ECDC4" }}>Karthavya</span> with
              <br />
              <span style={{ color: "#FF6B6B" }}>Confidence</span>
            </h1>
          </FadeIn>

          <FadeIn delay={400}>
            <p
              style={{
                fontSize: "1.15rem",
                color: "#5D6D7E",
                lineHeight: "1.8",
                marginBottom: "3rem",
                maxWidth: "550px",
                fontWeight: "400",
                marginTop: "-1.8rem",
              }}
            >
              Transform the way you manage tasks with our intuitive platform.
              Stay organized, track progress, and achieve your goals efficiently
              with powerful collaboration tools.
            </p>
          </FadeIn>

          <FadeIn delay={500}>
            <div
              style={{
                display: "flex",
                gap: "1.2rem",
                alignItems: "center",
                marginBottom: "3rem",
                position: "relative",
                top: "-2.5rem",
              }}
            >
              <Link
                href="/signup"
                style={{
                  padding: "1.1rem 2.8rem",
                  backgroundColor: "#FF6B6B",
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  borderRadius: "10px",
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(255, 107, 107, 0.35)",
                  transition: "all 0.3s ease",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(255, 107, 107, 0.45)";
                  e.currentTarget.style.backgroundColor = "#FF5252";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(255, 107, 107, 0.35)";
                  e.currentTarget.style.backgroundColor = "#FF6B6B";
                }}
              >
                Get Started
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Right Image Section */}
        <FadeIn delay={400}>
          <div
            style={{
              position: "relative",
              height: "800px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingRight: "2rem",
              paddingTop: "1rem",
            }}
          >
            {/* Decorative Floating Elements */}
            <div
              style={{
                position: "absolute",
                width: "80px",
                height: "80px",
                backgroundColor: "#4ECDC4",
                borderRadius: "20px",
                top: "10%",
                left: "-5%",
                opacity: "0.7",
                animation: "float 6s ease-in-out infinite",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "60px",
                height: "60px",
                backgroundColor: "#FFE66D",
                borderRadius: "50%",
                bottom: "15%",
                left: "5%",
                opacity: "0.6",
                animation: "float 8s ease-in-out infinite 1s",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "70px",
                height: "70px",
                backgroundColor: "#FF6B6B",
                borderRadius: "15px",
                top: "20%",
                right: "-5%",
                opacity: "0.6",
                animation: "float 7s ease-in-out infinite 2s",
                zIndex: 1,
              }}
            />

            {/* Main Image - No Box */}
            <Image
              src="/PM.gif"
              alt="Karthavya Task Management Dashboard"
              width={900}
              height={900}
              style={{
                width: "110%",
                height: "auto",
                objectFit: "contain",
                position: "relative",
                zIndex: 2,
              }}
              priority
              unoptimized
            />
          </div>
        </FadeIn>
      </main>

      {/* Footer Status */}
      {status === "authenticated" && (
        <FadeIn delay={700}>
          <div
            style={{
              textAlign: "center",
              padding: "1.5rem",
              color: "#7F8C8D",
              fontSize: "0.9rem",
              backgroundColor: "#F8F9FA",
            }}
          >
            Logged in as {session?.user?.email}
          </div>
        </FadeIn>
      )}

      {/* Add keyframe animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
