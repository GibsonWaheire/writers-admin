import { useState } from 'react';
import { Search, LogOut, Settings, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { SettingsModal } from './SettingsModal';

export function TopBar() {
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, reviews..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationDropdown />

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* Profile */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
            title="Profile"
          >
            <User className="h-5 w-5" />
          </Button>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
