import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Wallet, 
  Star, 
  MessageSquare, 
  Receipt,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/writer', emoji: '📊' },
  { icon: FileText, label: 'Available Orders', path: '/orders', emoji: '📂' },
  { icon: ShoppingCart, label: 'My Orders', path: '/my-orders', emoji: '📝' },
  { icon: Wallet, label: 'Wallet', path: '/wallet', emoji: '💳' },
  { icon: Star, label: 'Reviews', path: '/reviews', emoji: '⭐' },
  { icon: MessageSquare, label: 'Messages', path: '/messages', emoji: '💬' },
  { icon: Receipt, label: 'Invoices', path: '/invoices', emoji: '📜' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const SidebarContent = () => (
    <div className={`bg-white border-r border-gray-200 h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">Writers Admin</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-1 h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <span className={`text-lg ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                {item.emoji}
              </span>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleMobileSidebar} />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="relative h-full">
            <SidebarContent />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSidebar}
              className="absolute top-4 right-4 p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </>
    );
  }

  return <SidebarContent />;
}
