// This component renders a task card with subtasks, supporting both default and kanban variants
import React from 'react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
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

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (task: Task) => void;
  onToggleSubtask: (task: Task, subtaskId: string) => void;
  calculateProgress: (task: Task) => number;
  variant?: 'default' | 'kanban';
  onDragStart?: (task: Task) => void;
  onDragEnd?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  calculateProgress,
  variant = 'default',
  onDragStart,
  onDragEnd,
}) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";
  const progress = calculateProgress(task);
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const priorityColors = {
    pending: { bg: "#FFF9E6", color: "#FFB84D" },
    inprogress: { bg: "#E8F9F8", color: "#4ECDC4" },
    completed: { bg: "#E8F9F8", color: "#4ECDC4" },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4ECDC4";
      case "inprogress":
        return "#FFE66D";
      default:
        return "#7F8C8D";
    }
  };

  // Reusable component: Progress bar with percentage
  const ProgressBar = ({ size = 'default' }: { size?: 'default' | 'compact' }) => {
    const height = size === 'compact' ? '0.375rem' : '0.5rem';
    const fontSize = size === 'compact' ? '0.7rem' : '0.75rem';
    const labelSize = size === 'compact' ? '0.65rem' : '0.7rem';

    return (
      <div style={{ marginBottom: size === 'compact' ? '0.75rem' : '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: size === 'compact' ? '0.375rem' : '0.5rem' }}>
          <span style={{ fontSize, color: 'var(--text-tertiary)', fontWeight: 600 }}>Progress</span>
          <span style={{ fontSize, color: 'var(--accent-primary)', fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ 
          width: '100%', 
          height, 
          backgroundColor: 'var(--bg-hover)', 
          borderRadius: '9999px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '100%', 
            backgroundColor: 'var(--accent-primary)', 
            width: `${progress}%`,
            transition: 'width 0.3s ease',
            borderRadius: '9999px'
          }}></div>
        </div>
        <div style={{ fontSize: labelSize, color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
          {completedSubtasks} of {totalSubtasks} {size === 'compact' ? 'completed' : 'subtasks completed'}
        </div>
      </div>
    );
  };

  // Reusable component: Subtasks checklist
  const SubtasksList = ({ size = 'default' }: { size?: 'default' | 'compact' }) => {
    const padding = size === 'compact' ? '0.5rem' : '0.75rem';
    const maxHeight = size === 'compact' ? '120px' : '150px';
    const fontSize = size === 'compact' ? '0.75rem' : '0.8125rem';
    const checkboxSize = '1rem';

    return (
      <div style={{ 
        marginBottom: size === 'compact' ? '0.75rem' : '1rem', 
        padding, 
        backgroundColor: isOverdue && size === 'compact' ? 'rgba(255, 107, 107, 0.05)' : 'var(--bg-tertiary)', 
        borderRadius: size === 'compact' ? '0.375rem' : '0.5rem',
        border: '1px solid var(--border-secondary)',
        maxHeight,
        overflowY: 'auto'
      }}
      onMouseDown={(e) => size === 'compact' && e.stopPropagation()}
      onDragStart={(e) => size === 'compact' && e.stopPropagation()}
      >
        {size === 'default' && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Subtasks:</div>
        )}
        {task.subtasks?.map((subtask) => (
          <div key={subtask.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: size === 'compact' ? '0.375rem' : '0.5rem', 
            marginBottom: size === 'compact' ? '0.375rem' : '0.5rem',
            padding: '0.25rem 0'
          }}>
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={(e) => {
                if (size === 'compact') e.stopPropagation();
                onToggleSubtask(task, subtask.id);
              }}
              onClick={(e) => size === 'compact' && e.stopPropagation()}
              onMouseDown={(e) => size === 'compact' && e.stopPropagation()}
              style={{ 
                width: checkboxSize, 
                height: checkboxSize, 
                cursor: 'pointer',
                accentColor: 'var(--accent-primary)'
              }}
            />
            <span style={{ 
              fontSize, 
              color: subtask.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
              textDecoration: subtask.completed ? 'line-through' : 'none',
              flex: 1,
              lineHeight: size === 'compact' ? '1.2' : '1.5'
            }}>
              {subtask.title}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Reusable component: Action buttons
  const ActionButtons = ({ size = 'default' }: { size?: 'default' | 'compact' }) => {
    const buttonPadding = size === 'compact' ? '0.375rem 0.5rem' : '0.5rem 0.75rem';
    const fontSize = size === 'compact' ? '0.7rem' : '0.8125rem';
    const addButtonPadding = size === 'compact' ? '0.375rem 0.5rem' : '0.5rem 0.75rem';
    const isCompact = size === 'compact';

    return (
      <div style={{ display: 'flex', gap: '0.375rem', flexDirection: 'column' }}
        onMouseDown={(e) => isCompact && e.stopPropagation()}
        onDragStart={(e) => isCompact && e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            if (isCompact) e.stopPropagation();
            onAddSubtask(task);
          }}
          onMouseDown={(e) => isCompact && e.stopPropagation()}
          style={{ 
            width: '100%', 
            padding: addButtonPadding, 
            fontSize, 
            border: '1px solid var(--accent-primary)',
            borderRadius: size === 'compact' ? '0.25rem' : '0.5rem',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
            color: 'var(--accent-primary)',
            fontWeight: 600
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          + Add Subtask
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => {
              if (isCompact) e.stopPropagation();
              onEdit(task);
            }}
            onMouseDown={(e) => isCompact && e.stopPropagation()}
            style={{ 
              flex: 1, 
              padding: buttonPadding, 
              fontSize, 
              border: '1px solid var(--border-secondary)',
              borderRadius: size === 'compact' ? '0.25rem' : '0.5rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              if (isCompact) e.stopPropagation();
              onDelete(task._id);
            }}
            onMouseDown={(e) => isCompact && e.stopPropagation()}
            style={{ 
              flex: 1, 
              padding: buttonPadding, 
              fontSize, 
              border: '1px solid var(--accent-danger)',
              color: 'var(--accent-danger)', 
              borderRadius: size === 'compact' ? '0.25rem' : '0.5rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--accent-danger-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--accent-danger)';
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  // Kanban variant: Compact draggable card
  if (variant === 'kanban') {
    return (
      <div
        draggable={true}
        onDragStart={(e) => {
          if (onDragStart) {
            onDragStart(task);
            e.currentTarget.style.opacity = '0.5';
            e.currentTarget.style.cursor = 'grabbing';
          }
        }}
        onDragEnd={(e) => {
          if (onDragEnd) {
            onDragEnd();
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.cursor = 'grab';
          }
        }}
        style={{ 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          border: '1px solid',
          borderColor: isOverdue ? "var(--accent-danger)" : "var(--border-secondary)",
          backgroundColor: isOverdue ? "var(--bg-hover)" : "var(--card-bg)",
          cursor: 'grab',
          transition: 'all 0.2s',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Header: Status badge and due date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span style={{ 
            padding: '0.25rem 0.5rem', 
            fontSize: '0.75rem', 
            borderRadius: '0.25rem',
            backgroundColor: priorityColors[task.status].bg,
            color: priorityColors[task.status].color
          }}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          <span style={{ 
            fontSize: '0.75rem',
            color: isOverdue ? "var(--accent-danger)" : "var(--text-secondary)"
          }}>
            {isOverdue ? "Overdue" : `Due ${task.dueDate}`}
          </span>
        </div>

        {/* Task title and description */}
        <h4 style={{ 
          fontWeight: '500', 
          color: 'var(--text-primary)',
          marginTop: 0,
          marginBottom: '0.5rem'
        }}>{task.title}</h4>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)',
          marginTop: 0,
          marginBottom: '0.75rem'
        }}>{task.description}</p>
        
        {/* Progress bar (compact size) */}
        {task.subtasks && task.subtasks.length > 0 && <ProgressBar size="compact" />}

        {/* Subtasks checklist (compact size) */}
        {task.subtasks && task.subtasks.length > 0 && <SubtasksList size="compact" />}

        {/* Action buttons (compact size) */}
        <ActionButtons size="compact" />
      </div>
    );
  }

  // Default variant: Full-sized card for tasks page
  return (
    <div style={{ 
      backgroundColor: 'var(--card-bg)',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '1.5rem',
      border: '1px solid #E8E8E8'
    }}>
      {/* Header: Task title and status badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, flex: 1, margin: 0, color: 'var(--text-primary)' }}>{task.title}</h3>
        <span
          style={{
            padding: "0.25rem 0.625rem",
            borderRadius: '0.75rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            background: getStatusColor(task.status),
            color: "white",
            textTransform: "uppercase",
          }}
        >
          {task.status}
        </span>
      </div>

      {/* Task description and due date */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 }}>{task.description}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', marginTop: 0 }}>Due: {task.dueDate}</p>
      
      {/* Progress bar (default size) */}
      {task.subtasks && task.subtasks.length > 0 && <ProgressBar size="default" />}

      {/* Subtasks checklist (default size) */}
      {task.subtasks && task.subtasks.length > 0 && <SubtasksList size="default" />}

      {/* Action buttons (default size) */}
      <ActionButtons size="default" />
    </div>
  );
};
