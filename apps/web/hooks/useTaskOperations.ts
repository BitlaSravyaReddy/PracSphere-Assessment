// this file defines a custom React hook to manage task operations such as fetching, creating, updating, and deleting tasks and subtasks
import { useState, useCallback } from 'react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "inprogress" | "completed";
  userId: string;
  subtasks?: Subtask[];
}

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "inprogress" | "completed";
}

type PartialTaskFormData = Partial<TaskFormData>;

export const useTaskOperations = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // fetches all tasks for the logged-in user from backend endpoint at /api/tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      } else {
        setError("Failed to fetch tasks");
      }
    } catch (err) {
      setError("Error fetching tasks");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created only once
  // creates a new task by sending a POST request to /api/tasks with the provided form data
  const createTask = async (formData: TaskFormData) => {
    setError("");
    if (!formData.title || !formData.description || !formData.dueDate) {
      setError("All fields are required");
      return false;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchTasks();
        return true;
      } else {
        setError("Failed to create task");
        return false;
      }
    } catch (err) {
      setError("Error creating task");
      return false;
    } finally {
      setSubmitting(false);
    }
  };
  // updates an existing task by sending a PUT request to /api/tasks/:id with the provided form data
  const updateTask = async (taskId: string, formData: PartialTaskFormData) => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchTasks();
        return true;
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update task");
        console.error("Update task error:", data);
        return false;
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Error updating task");
      return false;
    } finally {
      setSubmitting(false);
    }
  };
  // deletes a task by sending a DELETE request to /api/tasks/:id
  const deleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return false;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchTasks();
        return true;
      } else {
        setError("Failed to delete task");
        return false;
      }
    } catch (err) {
      setError("Error deleting task");
      return false;
    }
  };
  // adds a subtask to a task by sending a PUT request to /api/tasks/:id with the updated subtasks list
  const addSubtask = async (task: Task, subtaskTitle: string, dueDate?: string, dueTime?: string) => {
    if (!subtaskTitle.trim()) return false;

    // Get the latest version of the task from the tasks array
    const currentTask = tasks.find(t => t._id === task._id) || task;

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: subtaskTitle.trim(),
      completed: false,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
    };

    const updatedSubtasks = [...(currentTask.subtasks || []), newSubtask];

    // Auto-adjust status when adding subtasks to a completed task
    let newStatus = currentTask.status;
    if (currentTask.status === "completed") {
      // Check if any existing subtasks are completed
      const hasCompletedSubtasks = updatedSubtasks.some(st => st.completed);
      // If some subtasks are done, mark as in progress, otherwise mark as pending
      newStatus = hasCompletedSubtasks ? "inprogress" : "pending";
    }

    try {
      const res = await fetch(`/api/tasks/${currentTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentTask.title,
          description: currentTask.description,
          dueDate: currentTask.dueDate,
          status: newStatus,
          subtasks: updatedSubtasks,
        }),
      });

      if (res.ok) {
        await fetchTasks();
        return true;
      } else {
        setError("Failed to add subtask");
        return false;
      }
    } catch (err) {
      setError("Error adding subtask");
      return false;
    }
  };
  // toggles the completion status of a subtask by sending a PUT request to /api/tasks/:id with the updated subtasks list
  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return false;

    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Calculate new status based on subtasks
    let newStatus = task.status;
    const completedCount = updatedSubtasks.filter((st) => st.completed).length;
    const totalCount = updatedSubtasks.length;

    if (completedCount === totalCount && totalCount > 0) {
      newStatus = "completed";
    } else if (completedCount > 0) {
      newStatus = "inprogress";
    } else {
      newStatus = "pending";
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: newStatus,
          subtasks: updatedSubtasks,
        }),
      });

      if (res.ok) {
        await fetchTasks();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating subtask:", err);
      return false;
    }
  };
  // deletes a subtask from a task by sending a PUT request to /api/tasks/:id with the updated subtasks list
  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return false;

    const updatedSubtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);

    // Recalculate status
    let newStatus = task.status;
    const completedCount = updatedSubtasks.filter((st) => st.completed).length;
    const totalCount = updatedSubtasks.length;

    if (totalCount === 0) {
      newStatus = "pending";
    } else if (completedCount === totalCount) {
      newStatus = "completed";
    } else if (completedCount > 0) {
      newStatus = "inprogress";
    } else {
      newStatus = "pending";
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: newStatus,
          subtasks: updatedSubtasks,
        }),
      });

      if (res.ok) {
        await fetchTasks();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting subtask:", err);
      return false;
    }
  };
// function to calculate the progress of a task based on completed subtasks and total subtasks
  const calculateProgress = (task: Task): number => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter((st) => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  return {
    tasks,
    loading,
    error,
    submitting,
    setError,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    calculateProgress,
  };
};
