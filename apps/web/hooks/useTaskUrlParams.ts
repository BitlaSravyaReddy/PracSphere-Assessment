/**
 * Custom hook for managing task-related URL parameters
 * Handles dynamic routing for task operations (edit, delete, view)
 * Reusable across dashboard and tasks pages
 */
import { useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Task } from '@/app/types/task.types';

interface UseTaskUrlParamsOptions {
  username: string;
  basePath: '/dashboard' | '/tasks';
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => Promise<void>;
  onView?: (task: Task) => void;
}

export function useTaskUrlParams({
  username,
  basePath,
  tasks,
  onEdit,
  onDelete,
  onView,
}: UseTaskUrlParamsOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedUrlRef = useRef<string | null>(null);

  // Handle URL search params for taskId and action on mount/URL change only
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    const action = searchParams.get('action');
    const currentUrl = taskId && action ? `${taskId}-${action}` : null;

    // Only process if URL has changed and tasks are loaded
    if (currentUrl && currentUrl !== processedUrlRef.current && tasks.length > 0) {
      processedUrlRef.current = currentUrl;
      
      const task = tasks.find(t => t._id === taskId);
      if (task && taskId) {
        if (action === 'edit' && onEdit) {
          onEdit(task);
        } else if (action === 'delete' && onDelete) {
          // Show confirmation for delete
          if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
            onDelete(taskId);
            // Clear URL params after delete
            router.push(`${basePath}/${username}`);
            processedUrlRef.current = null;
          } else {
            // Clear URL params if cancelled
            router.push(`${basePath}/${username}`);
            processedUrlRef.current = null;
          }
        } else if (action === 'view' && onView) {
          onView(task);
        }
      }
    } else if (!currentUrl) {
      // Reset when URL is cleared
      processedUrlRef.current = null;
    }
  }, [tasks, searchParams, username, basePath, router]);

  // Function to update URL with task operation
  const setTaskUrl = useCallback((taskId: string, action: 'edit' | 'delete' | 'view') => {
    router.push(`${basePath}/${username}?taskId=${taskId}&action=${action}`);
  }, [router, basePath, username]);

  // Function to clear URL params
  const clearTaskUrl = useCallback(() => {
    router.push(`${basePath}/${username}`);
  }, [router, basePath, username]);

  // Wrapped handlers that update URL (useEffect handles opening modals)
  const handleEditWithUrl = useCallback((task: Task) => {
    setTaskUrl(task._id, 'edit');
  }, [setTaskUrl]);

  const handleDeleteWithUrl = useCallback(async (taskId: string) => {
    setTaskUrl(taskId, 'delete');
  }, [setTaskUrl]);

  const handleViewWithUrl = useCallback((task: Task) => {
    setTaskUrl(task._id, 'view');
  }, [setTaskUrl]);

  return {
    setTaskUrl,
    clearTaskUrl,
    handleEditWithUrl,
    handleDeleteWithUrl,
    handleViewWithUrl,
  };
}
