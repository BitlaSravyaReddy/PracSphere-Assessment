import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/task";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    await connectDB();
    
    // Fetch all tasks for the user
    const tasks = await Task.find({ userId: session.user.email });
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed");
    const completedCount = completedTasks.length;
    const pendingCount = tasks.filter(t => t.status === "pending").length;
    const inProgressCount = tasks.filter(t => t.status === "inprogress").length;
    
    // Calculate today's completed tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCompleted = completedTasks.filter(t => {
      const dateValue = t.updatedAt || t.createdAt;
      if (!dateValue) return false;
      const taskDate = new Date(dateValue);
      return taskDate >= today;
    }).length;

    // Calculate overdue tasks
    const now = new Date();
    const overdueCount = tasks.filter(t => {
      if (t.status === "completed" || !t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < now;
    }).length;

    // Analyze task completion times by hour of day
    const completionHours = completedTasks
      .map(t => {
        const dateValue = t.updatedAt || t.createdAt;
        return dateValue ? new Date(dateValue).getHours() : NaN;
      })
      .filter(hour => !isNaN(hour));
    
    let mostActiveTime = "throughout the day";
    if (completionHours.length > 0) {
      // Group by time periods
      const morning = completionHours.filter(h => h >= 6 && h < 12).length;
      const afternoon = completionHours.filter(h => h >= 12 && h < 17).length;
      const evening = completionHours.filter(h => h >= 17 && h < 21).length;
      const night = completionHours.filter(h => h >= 21 || h < 6).length;
      
      const max = Math.max(morning, afternoon, evening, night);
      if (max > 0) {
        if (morning === max) mostActiveTime = "in the mornings";
        else if (afternoon === max) mostActiveTime = "in the afternoons";
        else if (evening === max) mostActiveTime = "in the evenings";
        else mostActiveTime = "at night";
      }
    }

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Calculate average tasks completed per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCompleted = completedTasks.filter(t => {
      const dateValue = t.updatedAt || t.createdAt;
      if (!dateValue) return false;
      const taskDate = new Date(dateValue);
      return taskDate >= sevenDaysAgo;
    }).length;
    const avgPerDay = Math.round(recentCompleted / 7 * 10) / 10;

    // Create a prompt for Gemini to generate an insight
    const prompt = `You are a helpful productivity assistant. Based on the following task statistics, generate a short, motivational, and personalized insight (1-2 sentences, max 150 characters). Be encouraging and specific.

Statistics:
- Total tasks: ${totalTasks}
- Completed tasks: ${completedCount}
- Tasks completed today: ${todayCompleted}
- Pending tasks: ${pendingCount}
- In progress tasks: ${inProgressCount}
- Overdue tasks: ${overdueCount}
- Completion rate: ${completionRate}%
- Average tasks per day (last 7 days): ${avgPerDay}
- Most active time: ${mostActiveTime}

Rules:
1. Keep it short and positive (1-2 sentences)
2. Mention specific numbers if impressive
3. Acknowledge their most active time if significant
4. If they completed tasks today, celebrate it
5. If they have overdue tasks, gently motivate them
6. If completion rate is high, praise them
7. Be warm and encouraging, not robotic
8. Maximum 150 characters

Generate only the insight message, nothing else.`;

    console.log("Generating task insight with Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insight = response.text().trim();

    console.log("Generated insight:", insight);

    return NextResponse.json({
      success: true,
      insight,
      stats: {
        totalTasks,
        completedCount,
        todayCompleted,
        pendingCount,
        inProgressCount,
        overdueCount,
        completionRate,
        mostActiveTime,
        avgPerDay
      }
    });
  } catch (error) {
    console.error("Error generating task insights:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate insights",
        // Fallback insight
        insight: "Keep up the great work! Stay focused on your goals.",
        success: false
      },
      { status: 200 } // Return 200 with fallback message instead of error
    );
  }
}
