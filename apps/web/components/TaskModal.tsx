import React from 'react';

// The shape of the form data for a task
interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "inprogress" | "completed";
}

// The props this modal expects to receive
interface TaskModalProps {
  isOpen: boolean; // Should the modal be shown?
  isEditing: boolean; // Are we editing an existing task?
  formData: TaskFormData; // The current form values
  error: string; // Any error message to show
  submitting: boolean; // Is the form being submitted?
  onClose: () => void; // Function to close the modal
  onSubmit: (e: React.FormEvent) => void; // Function to handle form submit
  onChange: (data: Partial<TaskFormData>) => void; // Function to update form fields
}

// The modal component for creating or editing a task
export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  isEditing,
  formData,
  error,
  submitting,
  onClose,
  onSubmit,
  onChange,
}) => {
  // If the modal is not open, render nothing
  if (!isOpen) return null;

  return (
    // Modal overlay (dark background)
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
      onClick={onClose} // Close modal if background is clicked
    >
      {/* Modal content (stops click from closing modal) */}
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: '31.25rem' }}>
        <div style={{ 
          backgroundColor: 'var(--card-bg)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--card-shadow)',
          padding: '1.5rem',
          border: '1px solid var(--border-secondary)'
        }}>
          {/* Modal title */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            {isEditing ? "Edit Task" : "Create New Task"}
          </h2>
          {/* The form for task details */}
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: '0.75rem' }}>
            {/* Title input */}
            <label style={{ display: "block" }}>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>Title</div>
              <input
                type="text"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => onChange({ title: e.target.value })}
                disabled={submitting}
                style={{
                  width: "100%",
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
            </label>
            {/* Description input */}
            <label style={{ display: "block" }}>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>Description</div>
              <textarea
                placeholder="Task description"
                value={formData.description}
                onChange={(e) => onChange({ description: e.target.value })}
                disabled={submitting}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  borderRadius: '0.625rem',
                  border: "1px solid var(--input-border)",
                  background: "var(--input-bg)",
                  outline: "none",
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </label>
            {/* Due date input */}
            <label style={{ display: "block" }}>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>Due Date</div>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => onChange({ dueDate: e.target.value })}
                disabled={submitting}
                style={{
                  width: "100%",
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
            </label>
            {/* Status select */}
            <label style={{ display: "block" }}>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>Status</div>
              <select
                value={formData.status}
                onChange={(e) => onChange({ status: e.target.value as any })}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  borderRadius: '0.625rem',
                  border: "1px solid var(--input-border)",
                  background: "var(--input-bg)",
                  outline: "none",
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="pending">Pending</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            {/* Error message */}
            {error && <div style={{ color: "var(--accent-danger)", fontSize: '0.75rem' }}>{error}</div>}
            {/* Action buttons */}
            <div style={{ display: "flex", gap: '0.5rem', marginTop: '0.5rem' }}>
              {/* Cancel button */}
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "0.625rem 0.875rem",
                  borderRadius: '0.625rem',
                  border: "1px solid var(--border-secondary)",
                  background: "transparent",
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>
              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "0.625rem 0.875rem",
                  borderRadius: '0.625rem',
                  background: "var(--button-primary-bg)",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = 'var(--button-primary-hover)')}
                onMouseLeave={(e) => !submitting && (e.currentTarget.style.background = 'var(--button-primary-bg)')}
              >
                {submitting ? "Saving..." : (isEditing ? "Update" : "Create")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};