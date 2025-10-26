import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { getUserSlug } from "@/utils/urlHelpers";
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

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if name is actually changing
    if (currentUser.name === validatedData.name) {
      return NextResponse.json(
        { message: "No changes made", user: { name: currentUser.name, email: currentUser.email } },
        { status: 200 }
      );
    }

    // Generate the new username slug from name + email
    const newSlug = getUserSlug(validatedData.name, session.user.email);
    
    // Check if another user would have the same username slug
    // This ensures uniqueness of URL-based usernames
    const usersWithSameName = await User.find({ 
      name: validatedData.name,
      email: { $ne: session.user.email } // Exclude current user
    });

    if (usersWithSameName.length > 0) {
      // Check if any would generate the same slug
      const conflictingUser = usersWithSameName.find(user => 
        getUserSlug(user.name, user.email) === newSlug
      );
      
      if (conflictingUser) {
        return NextResponse.json(
          { error: "This name combined with your email creates a username that's already taken. Please try a different name." },
          { status: 409 }
        );
      }
    }

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
