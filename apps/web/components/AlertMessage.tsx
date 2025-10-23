// this is an alert message component with success and error types
import React from 'react';

interface AlertMessageProps {
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}
// This component displays an alert message with different styles based on the type (success or error)
export default function AlertMessage({ message, type, onClose }: AlertMessageProps) {
  const styles = {
    success: {
      background: "#E8F9F8",
      color: "#3DBDB0",
      border: '1px solid #4ECDC4',
      icon: 'check_circle'
    },
    error: {
      background: "#FFE8E8",
      color: "#CC3636",
      border: '1px solid #FF6B6B',
      icon: 'error'
    }
  };

  const style = styles[type];

  return (
    <div style={{ 
      padding: '0.75rem 1rem', 
      marginBottom: '1rem', 
      background: style.background, 
      color: style.color, 
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      border: style.border
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
          {style.icon}
        </span>
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: style.color,
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
        </button>
      )}
    </div>
  );
}
