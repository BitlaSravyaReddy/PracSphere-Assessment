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
}: TaskHandlersProps) {
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createTask(formData);
    if (success) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    const success = await updateTask(editingTask._id, formData);
    if (success) {
      setEditingTask(null);
      resetForm();
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
