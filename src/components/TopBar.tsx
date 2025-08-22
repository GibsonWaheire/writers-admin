import { Bell, Settings, User, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function TopBar() {
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
          <Button variant="ghost" size="sm" className="relative p-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
            <span className="text-lg mr-1">🔔</span>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-red-500 text-white">
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200">
            <span className="text-lg">⚙️</span>
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200">
            <span className="text-lg">👤</span>
          </Button>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Writer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
