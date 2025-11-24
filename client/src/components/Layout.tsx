import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NotificationTester } from './NotificationTester';
import { WriterNotificationManager } from './notifications/WriterNotificationManager';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const isWriter = user?.role === 'writer';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />
        
        {/* Writer Notification Manager - Shows urgent alerts */}
        {isWriter && <WriterNotificationManager />}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        
        {/* Notification Tester (only in development) */}
        <NotificationTester />
      </div>
    </div>
  );
};
