import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { generateOTP, hashOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";

// This endpoint fixes users created with the old schema
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("=== FIX USER DEBUG ===");
    console.log("Email:", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
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
    console.log("Before fix - isEmailVerified:", user.isEmailVerified);
    console.log("Before fix - emailVerificationOTP:", user.emailVerificationOTP);
    console.log("Before fix - accountStatus:", user.accountStatus);

    // Generate new OTP
    const otp = generateOTP();
    console.log("Generated OTP:", otp);
    
    const hashedOTP = await hashOTP(otp);
    const otpExpiry = getOTPExpiry();

    // Force update all fields using direct MongoDB collection
    const collection = User.collection;
    const directUpdateResult = await collection.updateOne(
      { email },
      {
        $set: {
          isEmailVerified: false,
          emailVerificationOTP: hashedOTP,
          emailVerificationOTPExpiry: otpExpiry,
          accountStatus: "pending",
          authProvider: "credentials"
        }
      }
    );

    console.log(" Direct database update completed");
    console.log("Matched count:", directUpdateResult.matchedCount);
    console.log("Modified count:", directUpdateResult.modifiedCount);

    // Fetch the updated user to verify
    const updateResult = await User.findOne({ email });
    console.log("After fix - isEmailVerified:", updateResult?.isEmailVerified);
    console.log("After fix - emailVerificationOTP exists:", !!updateResult?.emailVerificationOTP);
    console.log("After fix - emailVerificationOTPExpiry:", updateResult?.emailVerificationOTPExpiry);
    console.log("After fix - accountStatus:", updateResult?.accountStatus);

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

    console.log(" User fixed and verification email sent successfully");

    return NextResponse.json(
      {
        message: "User fixed! A new verification code has been sent to your email.",
        success: true,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(" Fix user error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
