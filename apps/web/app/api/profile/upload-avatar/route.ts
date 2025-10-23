import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

// Route handler for uploading user avatars using POST method
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Convert file to base64 (for storing in DB - in production, use cloud storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    await connectDB();

    console.log("Attempting to update avatar for email:", session.user.email);
    console.log("Base64 image length:", base64Image.length);

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { avatar: base64Image },
      { new: true }
    );

    if (!user) {
      console.log("User not found with email:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Avatar updated successfully for user:", user.email);
    console.log("User avatar field:", user.avatar?.substring(0, 50) + "...");

    return NextResponse.json(
      { message: "Avatar updated successfully", avatar: base64Image },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
