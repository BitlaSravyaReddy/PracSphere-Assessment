
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { generateOTP, hashOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";
import { signupSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = signupSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.issues.map(issue => issue.message).join(", ");
        return NextResponse.json(
          { error: `Validation failed: ${errorMessages}` },
          { status: 400 }
        );
      }
      throw err;
    }

    const { name, email, password } = validatedData;

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      // If user exists but email not verified, allow resending OTP
      if (!existing.isEmailVerified) {
        // Generate new OTP
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);
        const otpExpiry = getOTPExpiry();

        // Update existing user with new OTP
        existing.emailVerificationOTP = hashedOTP;
        existing.emailVerificationOTPExpiry = otpExpiry;
        await existing.save();

        // Send OTP email
        const emailResult = await sendOTPEmail({
          to: email,
          name: existing.name,
          otp,
        });

        if (!emailResult.success) {
          return NextResponse.json(
            { error: "Failed to send verification email. Please try again." },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            message: "A new verification code has been sent to your email.",
            email,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          error: "User already exists. Please login or use a different email.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const otpExpiry = getOTPExpiry();

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpiry: otpExpiry,
      accountStatus: "pending",
      authProvider: "credentials",
    });
    await newUser.save();

    // Send OTP email
    const emailResult = await sendOTPEmail({
      to: email,
      name,
      otp,
    });

    if (!emailResult.success) {
      // Delete the user if email fails to send
      await User.deleteOne({ email });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email for the verification code.",
        email,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}