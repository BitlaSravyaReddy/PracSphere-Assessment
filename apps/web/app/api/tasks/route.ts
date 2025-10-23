import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { connectDB } from "../../../lib/mongodb";
import Task from "../../../models/task";
import { taskSchema } from "@/lib/validations";
import { z } from "zod";

// GET all tasks for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const tasks = await Task.find({ userId: session.user.email }).sort({ createdAt: -1 });
    
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST create a new task
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body with Zod
    let validatedData;
    try {
      validatedData = taskSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(", ");
        return NextResponse.json(
          { error: `Validation failed: ${errorMessages}` },
          { status: 400 }
        );
      }
      throw err;
    }

    const { title, description, dueDate, status } = validatedData;
    const { subtasks } = body; // Subtasks are optional and not in the main schema

    await connectDB();
    const task = await Task.create({
      title,
      description: description || "", // Ensure description is always a string
      dueDate,
      status,
      userId: session.user.email,
      subtasks: subtasks || [],
    });
    
    console.log("Task created successfully:", task);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
