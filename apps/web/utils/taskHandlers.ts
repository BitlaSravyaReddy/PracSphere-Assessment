import { Task, TaskFormData } from '@/app/types/task.types';

interface TaskHandlersProps {
  createTask: (formData: TaskFormData) => Promise<boolean>;
  updateTask: (taskId: string, formData: Partial<TaskFormData>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  setShowCreateModal: (show: boolean) => void;
  setEditingTask: (task: Task | null) => void;
  resetForm: () => void;
  editingTask: Task | null;
  formData: TaskFormData;
  clearTaskUrl?: () => void; // Optional callback to clear URL params
}

export function createTaskHandlers({
  createTask,
  updateTask,
  deleteTask,
  setShowCreateModal,
  setEditingTask,
  resetForm,
  editingTask,
  formData,
  clearTaskUrl,
}: TaskHandlersProps) {
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTask(formData);
    if (success) {
      setShowCreateModal(false);
      resetForm();
      // Clear URL params if callback provided
      if (clearTaskUrl) clearTaskUrl();
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    const success = await updateTask(editingTask._id, formData);
    if (success) {
      setEditingTask(null);
      resetForm();
      // Clear URL params after successful update
      if (clearTaskUrl) clearTaskUrl();
    }
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  return {
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  };
}
