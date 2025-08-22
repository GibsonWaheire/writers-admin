import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  Star, 
  MessageSquare, 
  Receipt,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/writer', emoji: '📊' },
  { icon: FileText, label: 'Orders', path: '/orders', emoji: '📝' },
  { icon: DollarSign, label: 'POD Orders', path: '/pod-orders', emoji: '💰' },
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
  const { getWriterOrderStats, getAvailableOrders } = useOrders();
  const { user } = useAuth();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  // Get writer order stats for the sidebar
  const writerId = user?.id || 'writer-1';
  const writerStats = getWriterOrderStats(writerId);
  const availableOrders = getAvailableOrders();

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
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{item.label}</span>
                  {item.path === '/orders' && writerStats.total > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                      {writerStats.total + availableOrders.length}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* My Orders Breakdown (when not collapsed) */}
      {!isCollapsed && writerStats.total > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            My Orders Breakdown
          </div>
          <div className="space-y-1">
            {writerStats.pending > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-600">Pending</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                  {writerStats.pending}
                </span>
              </div>
            )}
            {writerStats.inProgress > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-600">In Progress</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {writerStats.inProgress}
                </span>
              </div>
            )}
            {writerStats.uploadToClient > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-600">Upload</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  {writerStats.uploadToClient}
                </span>
              </div>
            )}
            {writerStats.editorRevision > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-600">Revision</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  {writerStats.editorRevision}
                </span>
              </div>
            )}
            {writerStats.approved > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-600">Approved</span>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                  {writerStats.approved}
                </span>
              </div>
            )}
            {writerStats.payLater > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-orange-600">Pay Later</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  {writerStats.payLater}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
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
