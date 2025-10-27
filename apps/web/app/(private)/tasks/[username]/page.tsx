"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { SubtaskModal } from "@/components/SubtaskModal";
import TaskCarousel from "@/components/TaskCarousel";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertMessage from "@/components/AlertMessage";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { useTaskModal } from "@/hooks/useTaskModal";
import { useSubtaskModal } from "@/hooks/useSubtaskModal";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useTaskUrlParams } from "@/hooks/useTaskUrlParams";
import { createTaskHandlers } from "@/utils/taskHandlers";
import { Task } from "@/app/types/task.types";
import { getUserSlug } from "@/utils/urlHelpers";

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Use the custom hook for task operations
  const {
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
  } = useTaskOperations();

  // Use custom hooks for modal management
  const {
    showCreateModal,
    editingTask,
    formData,
    setShowCreateModal,
    setEditingTask,
    setFormData,
    openEditModal,
    closeModal: closeTaskModal,
    resetForm,
  } = useTaskModal();

  const {
    showSubtaskModal,
    selectedTask,
    subtaskInput,
    setSubtaskInput,
    openSubtaskModal,
    closeSubtaskModal,
  } = useSubtaskModal();

  // View state
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "inprogress" | "completed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");

  // Auth redirect (no callback)
  useAuthRedirect(status);

  // Validate username parameter matches logged-in user
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const expectedSlug = getUserSlug(session.user.name, session.user.email);
      const urlUsername = params.username as string;
      
      // Redirect if username doesn't match
      if (urlUsername !== expectedSlug) {
        router.replace(`/tasks/${expectedSlug}`);
      }
    }
  }, [status, session, params.username, router]);

  // Create a ref to hold clearTaskUrl to avoid circular dependency
  const clearTaskUrlRef = useRef<(() => void) | null>(null);

  // Wrapper for deleteTask to match expected signature
  const handleDeleteTaskWrapper = async (taskId: string) => {
    await deleteTask(taskId);
  };

  // Use reusable hook for task URL management
  const { handleEditWithUrl, handleDeleteWithUrl, handleViewWithUrl, clearTaskUrl } = useTaskUrlParams({
    username: (params.username as string) || 'user',
    basePath: '/tasks',
    tasks,
    onEdit: openEditModal,
    onDelete: handleDeleteTaskWrapper,
    onView: openSubtaskModal,
  });

  // Store clearTaskUrl in ref for handlers to use
  clearTaskUrlRef.current = clearTaskUrl;

  // Task handlers with URL clearing
  const { handleCreateTask, handleUpdateTask, handleDeleteTask } = createTaskHandlers({
    createTask,
    updateTask,
    deleteTask,
    setShowCreateModal,
    setEditingTask,
    resetForm,
    editingTask,
    formData,
    clearTaskUrl: () => clearTaskUrlRef.current?.(), // Use ref to clear URL after operations
  });

  // Fetch tasks once when authenticated - use ref to prevent duplicate calls
  const hasFetched = useRef(false);
  useEffect(() => {
    if (status === "authenticated" && !hasFetched.current) {
      hasFetched.current = true;
      fetchTasks();
    }
  }, [status, fetchTasks]);

  const closeModal = () => {
    closeTaskModal(setError);
    // Clear URL params when closing modal
    clearTaskUrl();
  };

  const handleAddSubtask = async () => {
    if (!selectedTask || !subtaskInput.trim()) return;
    
    const success = await addSubtask(selectedTask, subtaskInput);
    if (success) {
      setSubtaskInput(""); // Clear input after successful addition
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    await toggleSubtask(taskId, subtaskId);
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    await deleteSubtask(taskId, subtaskId);
  };

  const onLogout = () => signOut({ callbackUrl: "/login" });

  // Filter tasks based on selected status
  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks.filter(task => task.status === statusFilter);

  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout
      activePath="/tasks"
      onLogout={onLogout}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
    >
      <div style={{ marginBottom: '1.25rem', display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>My Tasks</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--card-bg)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-secondary)' }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: '0.375rem',
                border: "none",
                background: viewMode === "grid" ? "#4ECDC4" : "transparent",
                color: viewMode === "grid" ? "#FFFFFF" : "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>grid_view</span>
              Grid
            </button>
            <button
              onClick={() => setViewMode("carousel")}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: '0.375rem',
                border: "none",
                background: viewMode === "carousel" ? "#4ECDC4" : "transparent",
                color: viewMode === "carousel" ? "#FFFFFF" : "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>view_carousel</span>
              Carousel
            </button>
          </div>
          
          {/* Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Filter:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: '0.5rem',
                border: "1px solid var(--border-secondary)",
                background: "var(--input-bg)",
                color: 'var(--text-primary)',
                cursor: "pointer",
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: '0.625rem',
              background: "var(--button-primary-bg)",
              color: "#FFFFFF",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--button-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--button-primary-bg)'}
          >
            + Create Task
          </button>
        </div>
      </div>

      {error && (
        <AlertMessage 
          message={error} 
          type="error" 
          onClose={() => setError("")}
        />
      )}

      {/* Task count indicator */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredTasks.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{tasks.length}</strong> tasks
          {statusFilter !== "all" && (
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600, marginLeft: '0.5rem' }}>
              ({statusFilter === "inprogress" ? "In Progress" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)})
            </span>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gap: '1rem', gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              variant="default"
              onEdit={handleEditWithUrl}
              onDelete={handleDeleteWithUrl}
              onAddSubtask={openSubtaskModal}
              onToggleSubtask={(task, subtaskId) => handleToggleSubtask(task._id, subtaskId)}
              calculateProgress={calculateProgress}
            />
          ))}
        </div>
      )}

      {/* Carousel View */}
      {viewMode === "carousel" && (
        <TaskCarousel
          tasks={filteredTasks}
          onEdit={handleEditWithUrl}
          onDelete={handleDeleteWithUrl}
          calculateProgress={calculateProgress}
        />
      )}

      {filteredTasks.length === 0 && !loading && (
        <div style={{ 
          backgroundColor: 'var(--card-bg)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--card-shadow)',
          textAlign: "center", 
          padding: '2.5rem',
          border: '1px solid var(--border-secondary)'
        }}>
          <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>
            {tasks.length === 0 
              ? "No tasks yet. Create your first task to get started!"
              : `No ${statusFilter === "inprogress" ? "in progress" : statusFilter} tasks found.`
            }
          </p>
          {tasks.length > 0 && statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              style={{
                marginTop: '1rem',
                padding: "0.5rem 1rem",
                borderRadius: '0.5rem',
                background: "var(--button-primary-bg)",
                color: "#FFFFFF",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--button-primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--button-primary-bg)'}
            >
              Show All Tasks
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <TaskModal
        isOpen={showCreateModal || !!editingTask}
        isEditing={!!editingTask}
        formData={formData}
        error={error}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onChange={(data) => setFormData({ ...formData, ...data })}
      />

      {/* Subtask Modal */}
      <SubtaskModal
        isOpen={showSubtaskModal}
        task={selectedTask ? tasks.find(t => t._id === selectedTask._id) || selectedTask : null}
        subtaskInput={subtaskInput}
        onClose={closeSubtaskModal}
        onInputChange={setSubtaskInput}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteSubtask={handleDeleteSubtask}
      />
    </Layout>
  );
}
