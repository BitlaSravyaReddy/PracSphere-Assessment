// This file defines the Task model for the task management application using Mongoose

import mongoose, { Schema, Model, models } from "mongoose";
//schema for subtasks with optional due date and time fields
export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
  time?: string;
}
//schema for main task
export interface ITask {
  _id?: string;
  title: string;
  description?: string; // Made optional
  dueDate: string;
  status: "pending" | "inprogress" | "completed";
  userId: string;
  subtasks?: ISubtask[];
  createdAt?: Date;
  updatedAt?: Date;
}

// define variable for subtask interface with optional due date and time
const SubtaskSchema = new Schema<ISubtask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    time: { type: String, required: false },
  },
  { _id: false }
);

// define variable for main task interface along with subtask field and each field's type and constraints
const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false, default: "" }, // Made optional with default empty string
    dueDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "inprogress", "completed"],
      default: "pending",
    },
    userId: { type: String, required: true, index: true },
    subtasks: { type: [SubtaskSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// exporting the Task model using Mongoose's model function
const Task =
  (models.Task as Model<ITask>) || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
