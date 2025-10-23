import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/task";
import { taskSchema } from "@/lib/validations";
import { z } from "zod";

// GET a single task by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const task = await Task.findOne({
      _id: params.id,
      userId: session.user.email,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PUT update a task
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Create a flexible update schema that allows past dates (for overdue tasks)
    const updateSchema = z.object({
      title: z.string().min(3).max(100).trim().optional(),
      description: z.string().max(500).trim().optional(), // Description can be empty
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
      status: z.enum(["pending", "inprogress", "completed"]).optional(),
    });

    let validatedData;
    try {
      validatedData = updateSchema.parse(body);
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

    const { subtasks } = body; // Subtasks are optional and not in the main schema

    await connectDB();
    const task = await Task.findOneAndUpdate(
      { _id: params.id, userId: session.user.email },
      { ...validatedData, subtasks },
      { new: true, runValidators: false } // Disable validators to allow updates with past dates
    );

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const task = await Task.findOneAndDelete({
      _id: params.id,
      userId: session.user.email,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
