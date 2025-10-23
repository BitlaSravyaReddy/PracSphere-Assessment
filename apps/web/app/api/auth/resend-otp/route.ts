import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { generateOTP, hashOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

// Route handler for resending OTP to users who have not verified their email
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("=== RESEND OTP DEBUG ===");
    console.log("Email:", email);

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }
     // Simple email format check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(" User not found");
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    console.log(" User found:", user.email);
    console.log("Current verification status:", user.isEmailVerified);
    console.log("Current OTP in DB:", user.emailVerificationOTP ? "exists" : "missing");

    // Check if already verified
    if (user.isEmailVerified) {
      console.log(" Email already verified");
      return NextResponse.json(
        { error: "Email already verified. Please login." },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    console.log("Generated new OTP:", otp);

    const hashedOTP = await hashOTP(otp); // Hash the OTP before saving to DB
    const otpExpiry = getOTPExpiry();

    console.log("Hashed OTP:", hashedOTP);
    console.log("OTP Expiry:", otpExpiry);

    // Update user with new OTP
    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationOTPExpiry = otpExpiry;
    await user.save();

    console.log(" OTP saved to database");

    // Send OTP email
    const emailResult = await sendOTPEmail({
      to: email,
      name: user.name,
      otp,
    });

    console.log("Email send result:", emailResult);

    if (!emailResult.success) {
      console.log(" Failed to send email");
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    console.log(" Verification email sent successfully");

    return NextResponse.json(
      {
        message: "A new verification code has been sent to your email.",
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(" Resend OTP error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}