import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

// Route handler for updating user profile using PUT method
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate with Zod
    let validatedData;
    try {
      validatedData = profileUpdateSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { error: err.issues[0]?.message || "Validation error" },
          { status: 400 }
        );
      }
      throw err;
    }

    await connectDB();

    // Update user profile
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { name: validatedData.name },
      { new: true }
    );
    
    // If user not found or no changes made, return appropriate response
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return updated user information
    return NextResponse.json(
      { message: "Profile updated successfully", user: { name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
