// this is the sidebar component with expand/collapse functionality and animated icons
"use client";
import { useState } from "react";

interface SidebarProps {
  activePath: string;
  onLogout: () => void;
}

export default function Sidebar({ activePath, onLogout }: SidebarProps) {
  // these two checks the state of sidebar (expanded/collapsed) and hovered item
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <>
      {/* CSS animations for sidebar elements using keyframe animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInText {
          from {
            text-indent: -20em;
            opacity: 0;
          }
          to {
            text-indent: 0;
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .nav-item-text {
          white-space: nowrap;
          overflow: hidden;
          animation: slideInText 400ms ease-in-out forwards;
        }

        .nav-item-text-1 {
          animation-delay: 100ms;
        }

        .nav-item-text-2 {
          animation-delay: 200ms;
        }

        .nav-item-text-3 {
          animation-delay: 300ms;
        }

        .nav-item-text-4 {
          animation-delay: 400ms;
        }

        .nav-icon-shake:hover {
          animation: shake 0.5s ease-in-out;
        }

        .nav-icon-bounce:hover {
          animation: bounce 0.6s ease-in-out infinite;
        }

        .logo-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      {/** Sidebar content expanding function */}
      <div 
        style={{ 
          width: isExpanded ? '256px' : '80px', 
          backgroundColor: 'var(--sidebar-bg)', 
          borderRight: '1px solid var(--sidebar-border)', 
          boxShadow: isExpanded 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative'
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Background gradient overlay on expand */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isExpanded 
            ? 'linear-gradient(180deg, rgba(78, 205, 196, 0.05) 0%, rgba(255, 107, 107, 0.03) 100%)'
            : 'transparent',
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
          opacity: isExpanded ? 1 : 0
        }} />

        <div style={{ 
          padding: isExpanded ? '1.5rem' : '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            overflow: 'hidden',
            width: '100%'
          }}>
            {isExpanded ? (
              <img 
                src="/karthavyalogo.png" 
                alt="Karthavya Logo" 
                style={{
                  height: '150px',
                  width: '200px',
                  objectFit: 'cover',
                  animation: 'slideIn 0.4s ease-out'
                }}
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="Karthavya Logo" 
                className="logo-pulse"
                style={{
                  width: '80px',
                  height: 'auto',
                  marginLeft:'0.3rem',
                  marginRight:'0.3rem',
                  objectFit: 'cover'
                }}
              />
            )}
          </div>
        </div>
        
        <nav style={{ marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
          {isExpanded && (
            <div style={{ 
              padding: '0.5rem 1rem',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <p style={{ 
                fontSize: '0.75rem', 
                fontWeight: '600', 
                color: '#4ECDC4',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0
              }}>Main</p>
            </div>
          )}
          
          {/* Dashboard Link */}
          <a
            href="/dashboard"
            onMouseEnter={() => setHoveredItem('dashboard')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '0.75rem 1.5rem' : '0.75rem', 
              color: activePath === '/dashboard' ? '#FF6B6B' : 'var(--text-secondary)',
              backgroundColor: activePath === '/dashboard' 
                ? 'rgba(255, 107, 107, 0.15)' 
                : hoveredItem === 'dashboard'
                ? 'rgba(255, 107, 107, 0.1)'
                : 'transparent',
              borderRight: activePath === '/dashboard' ? '4px solid #FF6B6B' : '4px solid transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              transform: hoveredItem === 'dashboard' && !isExpanded ? 'translateX(2px)' : 'translateX(0)',
              boxShadow: hoveredItem === 'dashboard' 
                ? 'inset 4px 0 0 0 #FF6B6B'
                : 'none'
            }}
            title={!isExpanded ? "Dashboard" : ""}
          >
            <span 
              className={hoveredItem === 'dashboard' ? 'material-symbols-outlined nav-icon-shake' : 'material-symbols-outlined'}
              style={{ 
                marginRight: isExpanded ? '0.75rem' : '0',
                flexShrink: 0,
                fontSize: hoveredItem === 'dashboard' ? '1.5rem' : '1.4rem',
                transition: 'all 0.3s ease',
                color: activePath === '/dashboard' || hoveredItem === 'dashboard' ? '#FF6B6B' : 'inherit'
              }}
            >
              dashboard
            </span>
            {isExpanded && (
              <span 
                className="nav-item-text nav-item-text-1"
                style={{ 
                  fontWeight: hoveredItem === 'dashboard' ? '600' : '500'
                }}
              >
                Dashboard
              </span>
            )}
          </a>

          {/* Tasks Link */}
          <a
            href="/tasks"
            onMouseEnter={() => setHoveredItem('tasks')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '0.75rem 1.5rem' : '0.75rem', 
              color: activePath === '/tasks' ? '#4ECDC4' : 'var(--text-secondary)',
              backgroundColor: activePath === '/tasks' 
                ? 'rgba(78, 205, 196, 0.15)' 
                : hoveredItem === 'tasks'
                ? 'rgba(78, 205, 196, 0.1)'
                : 'transparent',
              borderRight: activePath === '/tasks' ? '4px solid #4ECDC4' : '4px solid transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoveredItem === 'tasks' && !isExpanded ? 'translateX(2px)' : 'translateX(0)',
              boxShadow: hoveredItem === 'tasks' 
                ? 'inset 4px 0 0 0 #4ECDC4'
                : 'none'
            }}
            title={!isExpanded ? "Tasks" : ""}
          >
            <span 
              className={hoveredItem === 'tasks' ? 'material-symbols-outlined nav-icon-bounce' : 'material-symbols-outlined'}
              style={{ 
                marginRight: isExpanded ? '0.75rem' : '0',
                flexShrink: 0,
                fontSize: hoveredItem === 'tasks' ? '1.5rem' : '1.4rem',
                transition: 'all 0.3s ease',
                color: activePath === '/tasks' || hoveredItem === 'tasks' ? '#4ECDC4' : 'inherit'
              }}
            >
              task_alt
            </span>
            {isExpanded && (
              <span 
                className="nav-item-text nav-item-text-2"
                style={{ 
                  fontWeight: hoveredItem === 'tasks' ? '600' : '500'
                }}
              >
                Tasks
              </span>
            )}
          </a>

          {/* Profile Link */}
          <a
            href="/profile"
            onMouseEnter={() => setHoveredItem('profile')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '0.75rem 1.5rem' : '0.75rem', 
              color: activePath === '/profile' ? '#FFB347' : 'var(--text-secondary)',
              backgroundColor: activePath === '/profile' 
                ? 'rgba(255, 179, 71, 0.15)' 
                : hoveredItem === 'profile'
                ? 'rgba(255, 179, 71, 0.1)'
                : 'transparent',
              borderRight: activePath === '/profile' ? '4px solid #FFB347' : '4px solid transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoveredItem === 'profile' && !isExpanded ? 'translateX(2px)' : 'translateX(0)',
              boxShadow: hoveredItem === 'profile' 
                ? 'inset 4px 0 0 0 #FFB347'
                : 'none'
            }}
            title={!isExpanded ? "Profile" : ""}
          >
            <span 
              className={hoveredItem === 'profile' ? 'material-symbols-outlined nav-icon-shake' : 'material-symbols-outlined'}
              style={{ 
                marginRight: isExpanded ? '0.75rem' : '0',
                flexShrink: 0,
                fontSize: hoveredItem === 'profile' ? '1.5rem' : '1.4rem',
                transition: 'all 0.3s ease',
                color: activePath === '/profile' || hoveredItem === 'profile' ? '#FFB347' : 'inherit'
              }}
            >
              person
            </span>
            {isExpanded && (
              <span 
                className="nav-item-text nav-item-text-3"
                style={{ 
                  fontWeight: hoveredItem === 'profile' ? '600' : '500'
                }}
              >
                Profile
              </span>
            )}
          </a>

          {isExpanded && (
            <div style={{ 
              padding: '0.5rem 1rem', 
              marginTop: '2rem',
              animation: 'slideIn 0.4s ease-out'
            }}>
              <p style={{ 
                fontSize: '0.75rem', 
                fontWeight: '600', 
                color: '#FFB347',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0
              }}>Account</p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            style={{ 
              width: '100%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '0.75rem 1.5rem' : '0.75rem', 
              color: hoveredItem === 'logout' ? '#ef4444' : '#6b7280',
              backgroundColor: hoveredItem === 'logout' ? '#fef2f2' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              marginTop: isExpanded ? '0' : '2rem',
              transform: hoveredItem === 'logout' && !isExpanded ? 'translateX(2px)' : 'translateX(0)',
              boxShadow: hoveredItem === 'logout' 
                ? 'inset 4px 0 0 0 #ef4444'
                : 'none'
            }}
            title={!isExpanded ? "Logout" : ""}
          >
            <span 
              className={hoveredItem === 'logout' ? 'material-symbols-outlined nav-icon-shake' : 'material-symbols-outlined'}
              style={{ 
                marginRight: isExpanded ? '0.75rem' : '0',
                flexShrink: 0,
                fontSize: hoveredItem === 'logout' ? '1.5rem' : '1.4rem',
                transition: 'all 0.3s ease'
              }}
            >
              logout
            </span>
            {isExpanded && (
              <span 
                className="nav-item-text nav-item-text-4"
                style={{ 
                  fontWeight: hoveredItem === 'logout' ? '600' : '500'
                }}
              >
                Logout
              </span>
            )}
          </button>
        </nav>
      </div>
    </>
  );
}
