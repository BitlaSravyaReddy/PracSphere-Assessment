// this file defines an API endpoint to check user information in the database for debugging purposes
import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";

// Diagnostic endpoint to check user data in database
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    console.log("=== CHECK USER DEBUG ===");
    console.log("Email:", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("Connected to MongoDB");
    console.log("Database name:", User.db.name);
    console.log("Collection name:", User.collection.name);

    // Find user using findOne
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(" User not found in database");
      return NextResponse.json({ 
        error: "User not found.",
        database: User.db.name,
        collection: User.collection.name
      }, { status: 404 });
    }

    console.log(" User found in database");
    console.log("User ID:", user._id);
    console.log("User name:", user.name);
    console.log("User email:", user.email);
    console.log("isEmailVerified:", user.isEmailVerified);
    console.log("emailVerificationOTP:", user.emailVerificationOTP);
    console.log("emailVerificationOTPExpiry:", user.emailVerificationOTPExpiry);
    console.log("accountStatus:", user.accountStatus);
    console.log("authProvider:", user.authProvider);
    console.log("User object keys:", Object.keys(user.toObject()));
    // returns user data for debugging
    return NextResponse.json(
      {
        message: "User data retrieved",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          hasOTP: !!user.emailVerificationOTP,
          otpValue: user.emailVerificationOTP,
          otpExpiry: user.emailVerificationOTPExpiry,
          accountStatus: user.accountStatus,
          authProvider: user.authProvider,
          allFields: Object.keys(user.toObject())
        },
        database: User.db.name,
        collection: User.collection.name
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(" Check user error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
