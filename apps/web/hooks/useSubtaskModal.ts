import { useState } from 'react';
import { Task } from '@/app/types/task.types';

// This interface describes what the hook will return
interface UseSubtaskModalReturn {
  showSubtaskModal: boolean; // checks if the modal is open
  selectedTask: Task | null; // select task for adding subtasks
  subtaskInput: string;      // input value for new subtask
  setShowSubtaskModal: (show: boolean) => void; // Manually open/close modal
  setSelectedTask: (task: Task | null) => void; // Manually set the selected task
  setSubtaskInput: (input: string) => void;     // Manually set the input value
  openSubtaskModal: (task: Task) => void;       // Open modal for a specific task
  closeSubtaskModal: () => void;                // Close modal and reset state
}

// This hook manages all the state for the subtask modal
export function useSubtaskModal(): UseSubtaskModalReturn {
  // Is the modal open?
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  // the task that is selected for adding subtasks
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // What is typed in the subtask input box?
  const [subtaskInput, setSubtaskInput] = useState("");

  // Call this to open the modal for a specific task
  const openSubtaskModal = (task: Task) => {
    setSelectedTask(task);      // Set the current task
    setShowSubtaskModal(true);  // Show the modal
  };

  // Call this to close the modal and reset everything
  const closeSubtaskModal = () => {
    setShowSubtaskModal(false); // Hide the modal
    setSelectedTask(null);      // Clear the selected task
    setSubtaskInput("");        // Clear the input box
  };

  // Return all state and helpers so components can use them
  return {
    showSubtaskModal,
    selectedTask,
    subtaskInput,
    setShowSubtaskModal,
    setSelectedTask,
    setSubtaskInput,
    openSubtaskModal,
    closeSubtaskModal,
  };
}