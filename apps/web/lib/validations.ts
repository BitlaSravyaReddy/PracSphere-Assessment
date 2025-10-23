// this File contains related code for validating user inputs using Zod library
import { z } from "zod";

// Auth validation schemas for user inputs in signup, login, and OTP verification
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(15, "Password must be at most 15 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)"
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

// Task validation schemas rules for user inputs in task creation and update operations in task management
export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional()
    .default(""),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Due date cannot be in the past"),
  status: z.enum(["pending", "inprogress", "completed"], {
    message: "Status must be pending, inprogress, or completed",
  }),
});

export const subtaskSchema = z.object({
  title: z
    .string()
    .min(2, "Subtask title must be at least 2 characters")
    .max(100, "Subtask title must be less than 100 characters")
    .trim(),
});

// Type inference from schemas rules for user inputs
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type SubtaskInput = z.infer<typeof subtaskSchema>;
