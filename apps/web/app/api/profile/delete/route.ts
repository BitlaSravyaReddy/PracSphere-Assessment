import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Task from "@/models/task";

// DELETE user account and associated tasks
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // Get the current user session
    // Check if user is authenticated and has an email 
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Delete all user's tasks
    await Task.deleteMany({ userId: session.user.email });

    // Delete user account
    const user = await User.findOneAndDelete({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
