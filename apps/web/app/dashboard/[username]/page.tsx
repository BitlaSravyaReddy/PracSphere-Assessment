"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import { useTaskUrlParams } from "@/hooks/useTaskUrlParams";
import { createTaskHandlers } from "@/utils/taskHandlers";
import { Task } from "@/app/types/task.types";
import { getUserSlug } from "@/utils/urlHelpers";

// Main dashboard component with Kanban board view for managing tasks
export default function Dashboard() {
  // Get the current user session and authentication status
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  
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
  
  // State for smart task creation using natural language input
  const [smartInput, setSmartInput] = useState("");
  const [parsingTask, setParsingTask] = useState(false);
  const [parsedTaskPreview, setParsedTaskPreview] = useState<any>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [confirmCreate, setConfirmCreate] = useState(false);
  
  // State for AI task insights
  const [taskInsight, setTaskInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Redirect unauthenticated users to the login page
  useAuthRedirect(status);

  // Validate username parameter matches logged-in user
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const expectedSlug = getUserSlug(session.user.name, session.user.email);
      const urlUsername = params.username as string;
      
      // Redirect if username doesn't match
      if (urlUsername !== expectedSlug) {
        router.replace(`/dashboard/${expectedSlug}`);
      }
    }
  }, [status, session, params.username, router]);

  // Fetch tasks only once when the user is authenticated to prevent infinite loops
  const hasFetched = useRef(false);
  useEffect(() => {
    if (status === "authenticated" && !hasFetched.current) {
      hasFetched.current = true;
      fetchTasks();
      fetchTaskInsights(); // Fetch insights when dashboard loads
    }
  }, [status, fetchTasks]);

  // Fetch AI-generated task insights based on user's task completion patterns
  const fetchTaskInsights = async () => {
    setLoadingInsight(true);
    try {
      const response = await fetch("/api/tasks/insights");
      const data = await response.json();
      
      if (data.success && data.insight) {
        setTaskInsight(data.insight);
      } else if (data.insight) {
        // Fallback insight
        setTaskInsight(data.insight);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      setTaskInsight("Keep pushing forward! Every task completed is a step towards your goals.");
    } finally {
      setLoadingInsight(false);
    }
  };

  // Create handlers for task operations using the factory function
  const clearTaskUrlRef = useRef<(() => void) | null>(null);
  
  const { handleCreateTask, handleUpdateTask, handleDeleteTask } = createTaskHandlers({
    createTask,
    updateTask,
    deleteTask,
    setShowCreateModal,
    setEditingTask,
    resetForm,
    editingTask,
    formData,
    clearTaskUrl: () => clearTaskUrlRef.current?.(), // Use ref to avoid circular dependency
  });

  // Wrapper for deleteTask to match expected signature
  const handleDeleteTaskWrapper = async (taskId: string) => {
    await deleteTask(taskId);
  };

  // Use reusable hook for task URL management in Kanban board
  const { handleEditWithUrl, handleDeleteWithUrl, handleViewWithUrl, clearTaskUrl } = useTaskUrlParams({
    username: (params.username as string) || 'user',
    basePath: '/dashboard',
    tasks,
    onEdit: openEditModal,
    onDelete: handleDeleteTaskWrapper,
    onView: openSubtaskModal,
  });

  // Store clearTaskUrl in ref for handlers to use
  clearTaskUrlRef.current = clearTaskUrl;

  const closeModal = () => {
    closeTaskModal(setError);
    // Clear URL params when closing modal
    clearTaskUrl();
  };

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
      
      // Refresh insights when a task is moved to completed
      if (newStatus === 'completed') {
        fetchTaskInsights();
      }
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

  // Handle smart task creation using natural language input parsed by AI
  const handleSmartTaskCreation = async () => {
    console.log("handleSmartTaskCreation called with input:", smartInput);
    
    if (!smartInput.trim()) {
      console.log("Input is empty, returning");
      return;
    }
    
    setParsingTask(true);
    setError("");
    
    try {
      console.log("Calling /api/tasks/parse with input:", smartInput);
      
      // Call the Gemini API to parse the natural language input
      const response = await fetch("/api/tasks/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: smartInput }),
      });
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse task");
      }
      
      if (data.success && data.task) {
        console.log("Parsed task returned:", data.task);
        // If warnings are present, store the parsed preview and warnings and wait for confirmation
        if (data.warnings && data.warnings.length > 0) {
          setParsedTaskPreview(data.task);
          setParseWarnings(data.warnings || []);
          setConfirmCreate(false);
          return;
        }

        console.log("Creating task with data:", data.task);
        // Create the task directly in the database using the AI-parsed data, including subtasks
        const success = await createTask({
          title: data.task.title,
          description: data.task.description || "",
          dueDate: data.task.dueDate || "",
          status: data.task.status || "pending",
          subtasks: data.task.subtasks || [],
        });
        
        console.log("Task creation result:", success);
        
        if (success) {
          // Clear the smart input
          setSmartInput("");
          
          const subtaskCount = data.task.subtasks?.length || 0;

        // If user had previously confirmed create despite warnings, handle it here
        if (confirmCreate && parsedTaskPreview) {
          console.log("User confirmed creation despite warnings. Creating:", parsedTaskPreview);
          const success = await createTask({
            title: parsedTaskPreview.title,
            description: parsedTaskPreview.description || "",
            dueDate: parsedTaskPreview.dueDate || "",
            status: parsedTaskPreview.status || "pending",
            subtasks: parsedTaskPreview.subtasks || [],
          });

          if (success) {
            setParsedTaskPreview(null);
            setParseWarnings([]);
            setConfirmCreate(false);
            setSmartInput("");
            setSuccessMessage(`Task "${parsedTaskPreview.title}" created successfully with AI!`);
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchTaskInsights();
          } else {
            setError("Failed to create task. Please try again.");
            setTimeout(() => setError(""), 4000);
          }
        }
          const message = subtaskCount > 0 
            ? `Task "${data.task.title}" created with ${subtaskCount} subtask${subtaskCount > 1 ? 's' : ''} using AI!`
            : `Task "${data.task.title}" created successfully with AI!`;
          
          setSuccessMessage(message);
          setTimeout(() => setSuccessMessage(""), 4000);
          
          // Refresh insights after creating a task
          fetchTaskInsights();
        } else {
          setError("Failed to create task. Please try again.");
          setTimeout(() => setError(""), 4000);
        }
      }
    } catch (err) {
      console.error("Smart task creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create smart task");
      setTimeout(() => setError(""), 4000);
    } finally {
      setParsingTask(false);
    }
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

      {/* AI Task Insights Section - Shows motivational insights based on task completion patterns */}
      {taskInsight && (
        <div style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #E8F9F8 0%, #D4F1F4 100%)',
          border: '2px solid #4ECDC4',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 6px -1px rgba(78, 205, 196, 0.1)',
        }}>
          <div style={{
            fontSize: '2rem',
            flexShrink: 0
          }}>
            💡
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}>
              <span className="material-symbols-outlined" style={{ 
                fontSize: '1.25rem', 
                color: '#0891b2',
                fontWeight: 'bold'
              }}>
                auto_awesome
              </span>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#0891b2',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                AI Insight
              </h3>
            </div>
            <p style={{
              fontSize: '1rem',
              color: '#0e7490',
              margin: 0,
              fontWeight: '500',
              lineHeight: '1.5'
            }}>
              {taskInsight}
            </p>
          </div>
          <button
            onClick={fetchTaskInsights}
            disabled={loadingInsight}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: loadingInsight ? '#94a3b8' : '#4ECDC4',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loadingInsight ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!loadingInsight) {
                e.currentTarget.style.backgroundColor = '#3DBDB0';
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingInsight) {
                e.currentTarget.style.backgroundColor = '#4ECDC4';
              }
            }}
          >
            <span className="material-symbols-outlined" style={{ 
              fontSize: '1rem',
              animation: loadingInsight ? 'spin 1s linear infinite' : 'none'
            }}>
              {loadingInsight ? 'refresh' : 'refresh'}
            </span>
            {loadingInsight ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      )}
      
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

        {/* Smart Task Creation Section using AI-powered natural language input */}
        <div style={{ 
          backgroundColor: 'var(--card-bg)',
          borderRadius: '0.75rem', 
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)', 
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#FF6B6B' }}>
                psychology
              </span>
              Smart Task Creation
            </h3>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Describe your task in plain English, and AI will help you create it
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <input
                type="text"
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !parsingTask && smartInput.trim()) {
                    e.preventDefault();
                    handleSmartTaskCreation();
                  }
                }}
                placeholder='Try: "Complete project report by Friday" or "Meeting with team tomorrow at 3pm"'
                disabled={parsingTask}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#4ECDC4'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              />
              <div style={{ 
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <span>💡 Examples:</span>
                <button
                  onClick={() => setSmartInput("Submit tax documents by 25th October")}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4ECDC4',
                    cursor: 'pointer',
                    padding: '0',
                    textDecoration: 'underline',
                    fontSize: '0.75rem'
                  }}
                >
                  "Submit tax documents by 25th October"
                </button>
                <button
                  onClick={() => setSmartInput("Review code tomorrow afternoon")}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4ECDC4',
                    cursor: 'pointer',
                    padding: '0',
                    textDecoration: 'underline',
                    fontSize: '0.75rem'
                  }}
                >
                  "Review code tomorrow afternoon"
                </button>
              </div>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Button clicked! smartInput:", smartInput, "parsingTask:", parsingTask);
                if (smartInput.trim() && !parsingTask) {
                  handleSmartTaskCreation();
                } else {
                  console.log("Button click ignored - input empty or already parsing");
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: (!smartInput.trim() || parsingTask) ? '#95a5a6' : '#FF6B6B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: parsingTask || !smartInput.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                opacity: (!smartInput.trim() || parsingTask) ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!parsingTask && smartInput.trim()) {
                  e.currentTarget.style.backgroundColor = '#E85A5A';
                  e.currentTarget.style.cursor = 'pointer';
                }
              }}
              onMouseLeave={(e) => {
                if (!parsingTask && smartInput.trim()) {
                  e.currentTarget.style.backgroundColor = '#FF6B6B';
                } else {
                  e.currentTarget.style.cursor = 'not-allowed';
                }
              }}
            >
              {parsingTask ? (
                <>
                  <span className="material-symbols-outlined" style={{ 
                    fontSize: '1.25rem',
                    animation: 'spin 1s linear infinite'
                  }}>
                    refresh
                  </span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                    auto_awesome
                  </span>
                  Create with AI
                </>
              )}
            </button>
          </div>

          {/* Parsed task warnings and confirmation UI */}
          {parseWarnings && parseWarnings.length > 0 && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#FFF4E5', border: '1px solid #FFD9A6' }}>
              <strong style={{ color: '#7A4B00' }}>AI Warning</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', color: '#7A4B00' }}>
                {parseWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    // Allow the user to edit the parsed data manually by opening the create modal
                    setParsedTaskPreview(null);
                    setParseWarnings([]);
                    setShowCreateModal(true);
                    // prefill the modal with parsed data if available
                    if (parsedTaskPreview) setFormData({ ...formData, ...parsedTaskPreview });
                  }}
                  style={{ padding: '0.5rem 0.75rem', background: 'none', border: '1px solid #7A4B00', color: '#7A4B00', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    // Set confirmation flag to true and trigger creation flow
                    setConfirmCreate(true);
                    // Re-run the smart creation flow which checks confirmCreate and parsedTaskPreview
                    handleSmartTaskCreation();
                  }}
                  style={{ padding: '0.5rem 0.75rem', background: '#7A4B00', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Create Anyway
                </button>
              </div>
            </div>
          )}
        </div>

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
            onEdit={handleEditWithUrl}
            onDelete={handleDeleteWithUrl}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "pending")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "pending")}
            isDragOver={dragOverColumn === "pending"}
            onAddSubtask={handleViewWithUrl}
            onToggleSubtask={handleToggleSubtask}
            calculateProgress={calculateProgress}
          />

          <TaskColumn
            title="In Progress"
            color="blue"
            tasks={inProgressTasks}
            onEdit={handleEditWithUrl}
            onDelete={handleDeleteWithUrl}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "inprogress")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "inprogress")}
            isDragOver={dragOverColumn === "inprogress"}
            onAddSubtask={handleViewWithUrl}
            onToggleSubtask={handleToggleSubtask}
            calculateProgress={calculateProgress}
          />

          <TaskColumn
            title="Completed"
            color="green"
            tasks={completedTasks}
            onEdit={handleEditWithUrl}
            onDelete={handleDeleteWithUrl}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, "completed")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "completed")}
            isDragOver={dragOverColumn === "completed"}
            onAddSubtask={handleViewWithUrl}
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
