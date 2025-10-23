// This component renders a modal for managing subtasks of a task, allowing users to add, toggle, and delete subtasks.
import React, { useState } from 'react';

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

interface SubtaskModalProps {
  isOpen: boolean;
  task: Task | null;
  subtaskInput: string;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onAddSubtask: (dueDate?: string, dueTime?: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}

export const SubtaskModal: React.FC<SubtaskModalProps> = ({
  isOpen,
  task,
  subtaskInput,
  onClose,
  onInputChange,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [subtaskDate, setSubtaskDate] = useState("");
  const [subtaskTime, setSubtaskTime] = useState("");
  
  if (!isOpen || !task) return null;
  
  const handleAdd = () => {
    onAddSubtask(subtaskDate || undefined, subtaskTime || undefined);
    setSubtaskDate("");
    setSubtaskTime("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: '31.25rem' }}>
        <div style={{ 
          backgroundColor: 'var(--card-bg)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--card-shadow)',
          padding: '1.5rem',
          border: '1px solid var(--border-secondary)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Manage Subtasks
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1rem' }}>
            Task: <strong>{task.title}</strong>
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: "block" }}>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>Add New Subtask</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter subtask title"
                  value={subtaskInput}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  style={{
                    padding: "0.625rem 0.75rem",
                    borderRadius: '0.625rem',
                    border: "1px solid var(--input-border)",
                    background: "var(--input-bg)",
                    outline: "none",
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    color: 'var(--text-primary)'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="date"
                    value={subtaskDate}
                    onChange={(e) => setSubtaskDate(e.target.value)}
                    placeholder="Due Date (optional)"
                    style={{
                      flex: 1,
                      padding: "0.625rem 0.75rem",
                      borderRadius: '0.625rem',
                      border: "1px solid var(--input-border)",
                      background: "var(--input-bg)",
                      outline: "none",
                      fontFamily: 'inherit',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <input
                    type="time"
                    value={subtaskTime}
                    onChange={(e) => setSubtaskTime(e.target.value)}
                    placeholder="Due Time (optional)"
                    style={{
                      flex: 1,
                      padding: "0.625rem 0.75rem",
                      borderRadius: '0.625rem',
                      border: "1px solid var(--input-border)",
                      background: "var(--input-bg)",
                      outline: "none",
                      fontFamily: 'inherit',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!subtaskInput.trim()}
                  style={{
                    padding: "0.625rem 1rem",
                    borderRadius: '0.625rem',
                    background: subtaskInput.trim() ? "var(--button-primary-bg)" : "var(--bg-hover)",
                    color: "#FFFFFF",
                    border: "none",
                    fontWeight: 600,
                    cursor: subtaskInput.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    opacity: subtaskInput.trim() ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => subtaskInput.trim() && (e.currentTarget.style.background = 'var(--button-primary-hover)')}
                  onMouseLeave={(e) => subtaskInput.trim() && (e.currentTarget.style.background = 'var(--button-primary-bg)')}
                >
                  Add
                </button>
              </div>
            </label>
          </div>

          {/* Current Subtasks List */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Current Subtasks ({task.subtasks.length}):
              </div>
              <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                border: '1px solid var(--border-secondary)'
              }}>
                {task.subtasks.map((subtask) => {
                  const isOverdue = subtask.dueDate && subtask.dueTime && !subtask.completed &&
                    new Date(`${subtask.dueDate}T${subtask.dueTime}`) < new Date();
                  
                  return (
                  <div key={subtask.id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.25rem', 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '0.375rem',
                    border: isOverdue ? '1px solid var(--accent-danger)' : '1px solid var(--border-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => onToggleSubtask?.(task._id, subtask.id)}
                        style={{ 
                          width: '1rem', 
                          height: '1rem', 
                          cursor: 'pointer',
                          accentColor: 'var(--accent-primary)'
                        }}
                      />
                      <span style={{ 
                        fontSize: '0.875rem', 
                        color: subtask.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                        flex: 1
                      }}>
                        {subtask.title}
                      </span>
                      {onDeleteSubtask && (
                        <button
                          onClick={() => onDeleteSubtask(task._id, subtask.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            color: 'var(--accent-danger)',
                            background: 'transparent',
                            border: '1px solid var(--accent-danger)',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
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
                      )}
                    </div>
                    {(subtask.dueDate || subtask.dueTime) && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: isOverdue ? 'var(--accent-danger)' : 'var(--text-secondary)',
                        marginLeft: '1.5rem',
                        fontWeight: isOverdue ? 600 : 400
                      }}>
                        {isOverdue && '⚠️ '}
                        Due: {subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString() : ''} 
                        {subtask.dueTime && ` at ${subtask.dueTime}`}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: "0.625rem 0.875rem",
              borderRadius: '0.625rem',
              border: "1px solid var(--border-secondary)",
              background: "transparent",
              cursor: "pointer",
              fontFamily: 'inherit',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
