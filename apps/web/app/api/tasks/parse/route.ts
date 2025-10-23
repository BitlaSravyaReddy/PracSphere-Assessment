import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini API with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    // Get the natural language input from the request body
    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    console.log("Using Gemini API to parse task...");

    // Get the Gemini model for text generation
    // Using gemini-1.5-flash which is the stable, current model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a prompt that instructs Gemini to extract task information from natural language
    const prompt = `You are a task parser. Extract task information from the following natural language input and return a JSON object with these fields:
- title (string): The main task title (required)
- description (string): Additional details about the task (optional, empty string if none)
- dueDate (string): The due date in YYYY-MM-DD format (optional, empty string if not mentioned)
- status (string): One of "pending", "inprogress", or "completed" (default to "pending")
- subtasks (array of objects): If subtasks are mentioned or implied (like steps, checklist items, or multiple actions), extract them. Each subtask has:
  - id (string(int32)): Generate a unique ID like "17325698", "17325699", etc.
  - title (string): The subtask description
  - completed (boolean): Always false for new subtasks
  - dueDate (string, optional): YYYY-MM-DD format if a specific date is mentioned for this subtask
  - dueTime (string, optional): HH:MM format if a specific time is mentioned for this subtask

Current date: ${new Date().toISOString().split("T")[0]}

Rules:
1. If a relative date is mentioned (like "tomorrow", "next week", "Friday"), calculate the actual date
2. If only a day name is mentioned (like "Monday"), assume it's the next occurrence of that day
3. If time is mentioned for subtasks, include it in dueTime field (HH:MM format, 24-hour)
4. Keep titles concise and clear
5. Detect subtasks from:
   - Numbered lists (1. do this 2. do that)
   - Bullet points (- first step - second step)
   - Keywords like "first", "then", "after that", "finally"
   - Multiple verbs indicating separate actions
   - Phrases like "including", "such as", "need to"
6. If input is just one simple task, subtasks array should be empty
7. Only return valid JSON, nothing else

Examples:
Input: "Complete project report by Friday with introduction, analysis, and conclusion"
Output: {"title": "Complete project report", "description": "", "dueDate": "2025-10-25", "status": "pending", "subtasks": [{"id": "subtask_1", "title": "Write introduction", "completed": false}, {"id": "subtask_2", "title": "Write analysis", "completed": false}, {"id": "subtask_3", "title": "Write conclusion", "completed": false}]}

Input: "Buy groceries tomorrow: milk, bread, eggs"
Output: {"title": "Buy groceries", "description": "", "dueDate": "2025-10-24", "status": "pending", "subtasks": [{"id": "subtask_1", "title": "Buy milk", "completed": false}, {"id": "subtask_2", "title": "Buy bread", "completed": false}, {"id": "subtask_3", "title": "Buy eggs", "completed": false}]}

Input: "Submit tax documents by October 25"
Output: {"title": "Submit tax documents", "description": "", "dueDate": "2025-10-25", "status": "pending", "subtasks": []}

Now parse this input:
Input: "${input}"

Return only the JSON object, no markdown formatting or extra text.`;

    // Generate content using Gemini
    console.log("Generating content with Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini response text:", text);

    // Parse the JSON response from Gemini
    let parsedTask;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      console.log("Cleaned text:", cleanText);
      parsedTask = JSON.parse(cleanText);
      console.log("Parsed task:", parsedTask);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response", rawResponse: text },
        { status: 500 }
      );
    }

    // Validate the parsed task has at least a title
    if (!parsedTask.title) {
      console.error("No title found in parsed task:", parsedTask);
      return NextResponse.json(
        { error: "Could not extract a task title from the input" },
        { status: 400 }
      );
    }

    // Set defaults for missing fields
    parsedTask.description = parsedTask.description || "";
    parsedTask.dueDate = parsedTask.dueDate || "";
    parsedTask.status = parsedTask.status || "pending";
    parsedTask.subtasks = parsedTask.subtasks || [];

    // Validate subtasks structure if present
    if (parsedTask.subtasks && Array.isArray(parsedTask.subtasks)) {
      parsedTask.subtasks = parsedTask.subtasks.map((subtask: any, index: number) => ({
        id: subtask.id || `subtask_${Date.now()}_${index}`,
        title: subtask.title || "Untitled subtask",
        completed: subtask.completed === true ? true : false,
        time: subtask.time || subtask.dueTime || undefined,
      }));
    }

    console.log("Returning parsed task with subtasks:", parsedTask);

    // Prepare warnings when required information is missing
    const warnings: string[] = [];
    // Business rule: dueDate is mandatory for AI-created tasks
    if (!parsedTask.dueDate || parsedTask.dueDate.trim() === "") {
      warnings.push("No due date detected in your input. Due date is required to create a task.");
    }

    const requiresConfirmation = warnings.length > 0;

    // Return the parsed task information along with any warnings
    return NextResponse.json({
      success: true,
      task: parsedTask,
      warnings,
      requiresConfirmation,
    });
  } catch (error) {
    console.error("Error parsing task with Gemini:", error);
    return NextResponse.json(
      { error: "Failed to parse task. Please try again." },
      { status: 500 }
    );
  }
}
