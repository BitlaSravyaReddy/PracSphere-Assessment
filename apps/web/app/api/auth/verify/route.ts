import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { verifyOTP, isOTPExpired } from "@/lib/otp";

// Route handler for verifying OTP during email verification
export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    console.log("=== VERIFY OTP DEBUG ===");
    console.log("Received email:", email);
    console.log("Received OTP:", otp);
    console.log("OTP type:", typeof otp);
    console.log("OTP length:", otp?.length);

    // Validation
    if (!email || !otp) {
      console.log(" Validation failed: Missing email or OTP");
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      console.log(" Validation failed: Invalid email format");
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }
    // Validate OTP formatting - must be 6 digits
    if (!/^\d{6}$/.test(otp)) {
      console.log(" Validation failed: OTP is not 6 digits. OTP value:", otp);
      return NextResponse.json(
        { error: "OTP must be a 6-digit number." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(" User not found for email:", email);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    console.log(" User found:", user.email);
    console.log("User verification status:", user.isEmailVerified);
    console.log("Stored OTP:", user.emailVerificationOTP);
    console.log("OTP Expiry:", user.emailVerificationOTPExpiry);

    // Check if already verified
    if (user.isEmailVerified) {
      console.log(" Email already verified");
      return NextResponse.json(
        { error: "Email already verified. Please login." },
        { status: 400 }
      );
    }

    // Check if OTP exists
    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpiry) {
      console.log(" No OTP found in database");
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (isOTPExpired(user.emailVerificationOTPExpiry)) {
      console.log(" OTP has expired");
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    console.log("Comparing OTPs...");
    console.log("Input OTP:", otp);
    console.log("Stored hashed OTP:", user.emailVerificationOTP);
    const isValid = await verifyOTP(otp, user.emailVerificationOTP);
    console.log("OTP verification result:", isValid);
    
    if (!isValid) {
      console.log(" Invalid OTP");
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Update user - mark as verified
    user.isEmailVerified = true;
    user.accountStatus = "active";
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save();

    console.log(" Email verified successfully!");

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now login.",
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(" Verify OTP error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}