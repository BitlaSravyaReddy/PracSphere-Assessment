// Shared Task interface used across the application
export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "inprogress" | "completed";
  userId: string;
  subtasks?: { id: string; title: string; completed: boolean; time?: string }[];
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "inprogress" | "completed";
  subtasks?: { id: string; title: string; completed: boolean; time?: string }[];
}
