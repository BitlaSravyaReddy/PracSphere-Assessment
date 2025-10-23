// this file defines a custom React hook to manage the state and behavior of a task creation/editing modal
import { useState } from 'react';
import { Task, TaskFormData } from '@/app/types/task.types';

interface UseTaskModalReturn {
  showCreateModal: boolean; // this is set to true when user clicks on "Create Task" button in the UI
  editingTask: Task | null;
  formData: TaskFormData;
  setShowCreateModal: (show: boolean) => void;
  setEditingTask: (task: Task | null) => void;
  setFormData: (data: TaskFormData) => void;
  openEditModal: (task: Task) => void;
  closeModal: (setError: (error: string) => void) => void;
  resetForm: () => void;
}

// This is the initial state for the task form
const initialFormData: TaskFormData = {
  title: "",
  description: "",
  dueDate: "",
  status: "pending"
};
// This hook manages all the state for the task creation/editing modal it provides functions to open/close the modal, set form data, and reset the form
export function useTaskModal(): UseTaskModalReturn {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const closeModal = (setError: (error: string) => void) => {
    setShowCreateModal(false);
    setEditingTask(null);
    resetForm();
    setError("");
  };

  return {
    showCreateModal,
    editingTask,
    formData,
    setShowCreateModal,
    setEditingTask,
    setFormData,
    openEditModal,
    closeModal,
    resetForm,
  };
}
