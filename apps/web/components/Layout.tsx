// This is the layout component that wraps all pages
"use client";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface LayoutProps {
  children: ReactNode;
  activePath: string;
  onLogout: () => void;
  userName?: string | null;
  userEmail?: string | null;
  projectName?: string;
  projectStatus?: string;
}

export default function Layout({ 
  children, 
  activePath, 
  onLogout, 
  userName, 
  userEmail,
  projectName,
  projectStatus 
}: LayoutProps) {
  return (
    <>
      <style jsx global>{`
        @import url(https://fonts.googleapis.com/css2?family=Ubuntu&display=swap);
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined);
        
        body {
          font-family: 'Ubuntu', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
          margin: 0;
          padding: 0;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-secondary)', transition: 'background-color 0.3s ease' }}>
        <Sidebar activePath={activePath} onLogout={onLogout} />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TopBar 
            userName={userName} 
            userEmail={userEmail}
            projectName={projectName}
            projectStatus={projectStatus}
          />
          
          <main style={{ 
            flex: 1, 
            overflowY: 'auto', 
            backgroundColor: 'var(--bg-secondary)',
            padding: '1.5rem',
            transition: 'background-color 0.3s ease'
          }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
