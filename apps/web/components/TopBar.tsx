// this is the top bar component with dark mode toggle and user info
"use client";
import { useState, useEffect } from "react";

interface TopBarProps {
  userName?: string | null;
  userEmail?: string | null;
  projectName?: string;
  projectStatus?: string;
}

export default function TopBar({ 
  userName, 
  userEmail, 
  projectName = "Project Karthavya",
  projectStatus = "Active" 
}: TopBarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    console.log('Saved theme:', savedTheme);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      console.log('Dark mode enabled on load');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Switched to dark mode');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Switched to light mode');
    }
    
    console.log('HTML classes:', document.documentElement.classList.toString());
  };
  return (
    <header style={{ 
      backgroundColor: 'var(--topbar-bg)', 
      borderBottom: '1px solid var(--topbar-border)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            margin: 0,
            transition: 'color 0.3s ease'
          }}>{projectName}</h2>
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            fontSize: '0.75rem', 
            borderRadius: '9999px', 
            backgroundColor: 'var(--accent-success)',
            color: 'var(--accent-success-text)',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}>
            {projectStatus}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={toggleTheme}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '9999px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: 'var(--text-primary)',
              transition: 'color 0.3s ease'
            }}>
              {userName || "User"}
            </span>
            <div style={{ 
              width: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '9999px', 
              backgroundColor: '#2f818b',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#359fa5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2f818b'}
            >
              {userName?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
