"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { SubtaskModal } from "@/components/SubtaskModal";
import ProgressBubble from "@/components/ProgressBubble";
import StatusCard from "@/components/StatusCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import AlertMessage from "@/components/AlertMessage";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { useTaskModal } from "@/hooks/useTaskModal";
import { useSubtaskModal } from "@/hooks/useSubtaskModal";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { createTaskHandlers } from "@/utils/taskHandlers";
import { Task } from "@/app/types/task.types";

// Main dashboard component with Kanban board view for managing tasks
export default function Dashboard() {
  // Get the current user session and authentication status
  const { data: session, status } = useSession();
  
  // Custom hook that handles all task-related operations like create, update, delete, and subtask management
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
    calculateProgress,
  } = useTaskOperations();

  // Custom hook for managing the create/edit task modal state and form data
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

  // Custom hook for managing the subtask modal state including selected task and subtask input
  const {
    showSubtaskModal,
    selectedTask: selectedTaskForSubtask,
    subtaskInput,
    setSubtaskInput,
    openSubtaskModal,
    closeSubtaskModal,
  } = useSubtaskModal();

  // State for drag and drop functionality in the Kanban board
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect unauthenticated users to the login page
  useAuthRedirect(status);

  // Fetch tasks only once when the user is authenticated to prevent infinite loops
  const hasFetched = useRef(false);
  useEffect(() => {
    if (status === "authenticated" && !hasFetched.current) {
      hasFetched.current = true;
      fetchTasks();
    }
  }, [status, fetchTasks]);

  // Create handlers for task operations using the factory function
  const { handleCreateTask, handleUpdateTask, handleDeleteTask } = createTaskHandlers({
    createTask,
    updateTask,
    deleteTask,
    setShowCreateModal,
    setEditingTask,
    resetForm,
    editingTask,
    formData,
  });

  const closeModal = () => closeTaskModal(setError);

  // Called when a task card starts being dragged
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  // Called when drag operation ends to reset drag state
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Called when dragging over a column to show visual feedback
  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    setDragOverColumn(columnStatus);
  };

  // Called when leaving a column during drag
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  // Called when dropping a task into a new column to update its status
  const handleDrop = async (e: React.DragEvent, newStatus: "pending" | "inprogress" | "completed") => {
    e.preventDefault();
    setDragOverColumn(null);
    
    console.log("=== handleDrop called ===");
    console.log("draggedTask:", draggedTask);
    console.log("newStatus:", newStatus);
    console.log("draggedTask.subtasks:", draggedTask?.subtasks);
    
    // Only update if the status actually changed
    if (!draggedTask || draggedTask.status === newStatus) {
      console.log("No task or same status, returning");
      return;
    }

    // Prevent moving to completed if subtasks exist and are not all completed
    if (newStatus === "completed" && draggedTask.subtasks && draggedTask.subtasks.length > 0) {
      console.log("Checking subtasks completion...");
      const allSubtasksCompleted = draggedTask.subtasks.every(st => st.completed);
      console.log("allSubtasksCompleted:", allSubtasksCompleted);
      if (!allSubtasksCompleted) {
        console.log("Setting error message!");
        alert("Please complete all subtasks before marking this task as completed"); // Adding alert for debugging
        setError("Please complete all subtasks before marking this task as completed");
        setTimeout(() => setError(""), 4000);
        return;
      }
    }

    // Update the task's status in the database
    const success = await updateTask(draggedTask._id, {
      status: newStatus,
    });

    if (success) {
      setSuccessMessage(`Task moved to ${newStatus === 'inprogress' ? 'In Progress' : newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setError("Failed to update task status");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Add a new subtask to the currently selected task with optional due date and time
  const handleAddSubtask = async (dueDate?: string, dueTime?: string) => {
    if (!selectedTaskForSubtask || !subtaskInput.trim()) return;
    
    const success = await addSubtask(selectedTaskForSubtask, subtaskInput, dueDate, dueTime);
    if (success) {
      setSubtaskInput(""); // Clear input after successful addition
    }
  };

  // Toggle the completion status of a subtask
  const handleToggleSubtask = async (task: Task, subtaskId: string) => {
    await toggleSubtask(task._id, subtaskId);
  };

  const onLogout = () => signOut({ callbackUrl: "/login" });

  // Show loading spinner while checking authentication or fetching data
  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  // Filter tasks by status for the Kanban columns
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "inprogress");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  
  // Find overdue tasks that are past their due date and not completed
  // Find overdue tasks that are past their due date and not completed
  const overdueTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    return dueDate < new Date() && t.status !== "completed";
  });

  // Render the main dashboard layout with sidebar navigation
  return (
    <Layout
      activePath="/dashboard"
      onLogout={onLogout}
      userName={session?.user?.name}
      userEmail={session?.user?.email}
    >
      {/* Show success message banner when operations complete successfully */}
      {successMessage && (
        <AlertMessage 
          message={successMessage} 
          type="success" 
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Show error message banner when operations fail */}
      {error && (
        <AlertMessage 
          message={error} 
          type="error" 
          onClose={() => setError("")}
        />
      )}

      {/* Dashboard Header with Progress Bubble */}
      <div style={{ 
        backgroundColor: 'var(--card-bg)',
        borderRadius: '0.75rem', 
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)', 
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Left side shows welcome message with an animated GIF illustration */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img 
            src="/planning-tasks-nobg.gif" 
            alt="Task Management Illustration"
            style={{ 
              width: '600px', 
              height: '370px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0'
            }}>Dashboard</h1>
            <p style={{ 
              fontSize: '1rem', 
              color: 'var(--text-secondary)',
              margin: 0
            }}>Welcome back! Here&apos;s your task overview.</p>
          </div>
        </div>

        {/* Right side displays overall task completion percentage in a circular progress bubble */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ProgressBubble 
            percent={tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}
            showInput={false}
          />
        </div>
      </div>

      {/* Three status cards showing task counts and percentages for In Progress, Completed, and Overdue */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1.5rem', 
        marginBottom: '2rem'
      }}>
        <StatusCard
          label="In Progress"
          value={inProgressTasks.length}
          percentage={tasks.length > 0 ? (inProgressTasks.length / tasks.length) * 100 : 0}
          type="inprogress"
        />

        <StatusCard
          label="Completed"
          value={completedTasks.length}
          percentage={tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}
          type="completed"
        />

        <StatusCard
          label="Overdue"
          value={overdueTasks.length}
          percentage={tasks.length > 0 ? (overdueTasks.length / tasks.length) * 100 : 0}
          type="overdue"
        />
      </div>

      
      <div style={{ marginBottom: '2rem' }}>

        {/* Show a warning banner if there are any overdue tasks */}
        {overdueTasks.length > 0 && (
          <div style={{ 
            padding: '1rem 1.25rem', 
            marginBottom: '1.5rem', 
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '2px solid #ef4444',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
            
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img 
                src="/attention-nobg.gif" 
                alt="Attention"
                style={{ 
                  width: '10rem', 
                  height: '10rem',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
              <div>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  color: '#CC3636',
                  margin: '0 0 0 0'
                }}>
                  {overdueTasks.length} {overdueTasks.length === 1 ? 'Task' : 'Tasks'} Overdue!
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#A62C2C',
                  margin: 0
                }}>
                  {overdueTasks.length === 1 
                    ? `"${overdueTasks[0]?.title}" needs your attention` 
                    : `You have multiple tasks past their due date`}
                </p>
              </div>
            </div>
            <div style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#FF6B6B',
              color: '#FFFFFF',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              minWidth: '3rem',
              textAlign: 'center'
            }}>
              {overdueTasks.length}
            </div>
          </div>
        )}

        {/* Kanban board section with three columns for Pending, In Progress, and Completed tasks */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '1.5rem' 
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: 'var(--text-primary)',
              margin: 0
            }}>Kanban Board</h2>
            {/* Button to open the create task modal */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#4ECDC4',
                color: '#FFFFFF', 
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center',
                transition: 'all 0.2s',
                fontSize: '1rem',
                fontFamily: 'inherit',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3DBDB0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>add</span> New Task
            </button>
          </div>

          {/* Three-column Kanban grid that allows drag and drop between columns */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <TaskColumn
            title="Pending"
            color="yellow"
            tasks={pendingTasks}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "pending")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "pending")}
            isDragOver={dragOverColumn === "pending"}
            onAddSubtask={openSubtaskModal}
            onToggleSubtask={handleToggleSubtask}
            calculateProgress={calculateProgress}
          />

          <TaskColumn
            title="In Progress"
            color="blue"
            tasks={inProgressTasks}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "inprogress")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "inprogress")}
            isDragOver={dragOverColumn === "inprogress"}
            onAddSubtask={openSubtaskModal}
            onToggleSubtask={handleToggleSubtask}
            calculateProgress={calculateProgress}
          />

          <TaskColumn
            title="Completed"
            color="green"
            tasks={completedTasks}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "completed")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "completed")}
            isDragOver={dragOverColumn === "completed"}
            onAddSubtask={openSubtaskModal}
            onToggleSubtask={handleToggleSubtask}
              calculateProgress={calculateProgress}
            />
          </div>
        </div>
      </div>

      {/* Modal for creating new tasks or editing existing ones */}
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

      {/* Modal for managing subtasks of a selected task */}
      <SubtaskModal
        isOpen={showSubtaskModal}
        task={selectedTaskForSubtask ? tasks.find(t => t._id === selectedTaskForSubtask._id) || selectedTaskForSubtask : null}
        subtaskInput={subtaskInput}
        onClose={closeSubtaskModal}
        onInputChange={setSubtaskInput}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={(taskId, subtaskId) => {
          const task = tasks.find(t => t._id === taskId);
          if (task) handleToggleSubtask(task, subtaskId);
        }}
      />
    </Layout>
  );
}

// Component that renders a single Kanban column with its tasks
function TaskColumn({
  title,
  color,
  tasks,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
  onAddSubtask,
  onToggleSubtask,
  calculateProgress,
}: {
  title: string;
  color: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  onAddSubtask: (task: Task) => void;
  onToggleSubtask: (task: Task, subtaskId: string) => void;
  calculateProgress: (task: Task) => number;
}) {
  // Define the color scheme for each column type
  const colorClasses = {
    yellow: "#FFE66D",
    blue: "#4ECDC4",
    green: "#4ECDC4",
  };

  // Animation colors for the rotating border effect
  const animationColors = {
    yellow: { primary: '#ff2770', secondary: '#ffb347' },
    blue: { primary: '#45f3ff', secondary: '#6b8cff' },
    green: { primary: '#00ffb3', secondary: '#00d4ff' }
  };

  const colors = animationColors[color as keyof typeof animationColors];

  return (
    <div style={{ position: 'relative' }}>
      {/* CSS for animated rotating gradient border around each column */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @property --a {
            syntax: '<angle>';
            inherits: false;
            initial-value: 0deg; 
          }

          @keyframes borderAnimate {
            0% {
              --a: 0deg;
            }
            100% {
              --a: 360deg;
            }
          }

          .animated-border-box {
            position: relative;
            width: 100%;
            background: repeating-conic-gradient(from var(--a), ${colors.primary} 0%, ${colors.primary} 5%, transparent 5%, transparent 40%, ${colors.primary} 50%);
            animation: borderAnimate 4s linear infinite;
            border-radius: 15px;
            padding: 3px;
          }

          .animated-border-box::before {
            content: '';
            position: absolute;
            inset: 0;
            background: repeating-conic-gradient(from var(--a), ${colors.secondary} 0%, ${colors.secondary} 5%, transparent 5%, transparent 40%, ${colors.secondary} 50%);
            animation: borderAnimate 4s linear infinite;
            animation-delay: -1s;
            border-radius: 15px;
            z-index: 0;
          }
        `
      }} />

      <div className="animated-border-box">
        {/* Column content with drag and drop support */}
        <div 
          style={{ 
            backgroundColor: isDragOver ? '#E8F9F8' : 'var(--card-bg)',
            borderRadius: '12px', 
            padding: '1rem',
            border: isDragOver ? '2px dashed #4ECDC4' : 'none',
            transition: 'all 0.2s',
            minHeight: '400px',
            position: 'relative',
            zIndex: 1
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '1rem' 
      }}>
        {/* Column header with color indicator and task count */}
        <h3 style={{ 
          fontWeight: '600', 
          color: 'var(--text-primary)',
          display: 'flex', 
          alignItems: 'center',
          margin: 0
        }}>
          <span style={{ 
            width: '0.75rem', 
            height: '0.75rem', 
            backgroundColor: colorClasses[color as keyof typeof colorClasses],
            borderRadius: '9999px', 
            marginRight: '0.5rem' 
          }}></span>
          {title}
          <span style={{ 
            marginLeft: '0.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)'
          }}>({tasks.length})</span>
        </h3>
      </div>
      {/* Render all tasks in this column or show empty state */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task}
            variant="kanban"
            onEdit={onEdit} 
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            calculateProgress={calculateProgress}
          />
        ))}
        {tasks.length === 0 && (
          <div style={{ 
            border: '2px dashed var(--border-secondary)',
            borderRadius: '0.5rem', 
            padding: '1rem', 
            textAlign: 'center' 
          }}>
            <span style={{ color: 'var(--text-tertiary)' }}>No tasks</span>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
