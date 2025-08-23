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
import { Badge } from './ui/badge';
import { useIsMobile } from '../hooks/use-mobile';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useMessages } from '../contexts/MessagesContext';

const writerMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/writer', emoji: '📊' },
  { icon: FileText, label: 'Orders', path: '/orders', emoji: '📝' },
  { icon: DollarSign, label: 'POD Orders', path: '/pod-orders', emoji: '💰' },
  { icon: Wallet, label: 'Wallet', path: '/wallet', emoji: '💳' },
  { icon: Star, label: 'Reviews', path: '/reviews', emoji: '⭐' },
  { icon: MessageSquare, label: 'Messages', path: '/messages', emoji: '💬' },
  { icon: Receipt, label: 'Invoices', path: '/invoices', emoji: '📜' },
];

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', emoji: '📊' },
  { icon: FileText, label: 'Orders', path: '/admin/orders', emoji: '📝' },
  { icon: DollarSign, label: 'Writers', path: '/admin/writers', emoji: '👥' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews', emoji: '⭐' },
  { icon: Wallet, label: 'Financial', path: '/admin/financial', emoji: '💰' },
  { icon: MessageSquare, label: 'Users', path: '/admin/users', emoji: '👤' },
  { icon: Receipt, label: 'Analytics', path: '/admin/analytics', emoji: '📈' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const { orders } = useOrders();
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { unreadCount } = useMessages();

  const currentWriterId = user?.id || 'writer-1';
  const isAdmin = user?.role === 'admin';
  const menuItems = isAdmin ? adminMenuItems : writerMenuItems;
  
  const writerOrders = orders.filter(order => order.writerId === currentWriterId);
  
  const activeOrders = writerOrders.filter(order => 
    ['Awaiting Confirmation', 'Confirmed', 'In Progress', 'Submitted to Admin', 'Under Admin Review', 'Admin Approved', 'Client Review', 'Client Approved', 'Editor Revision', 'Awaiting Payment', 'Pay Later'].includes(order.status)
  ).length;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/writer' && location.pathname === '/') return true;
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname === path;
  };

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const active = isActive(item.path);
    const showBadge = item.label === 'Messages' && unreadCount > 0;
    
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={closeMobile}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          active
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="text-xl">{item.emoji}</span>
        {!isCollapsed && (
          <>
            <span className="font-medium">{item.label}</span>
            {showBadge && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-gray-800">
            {isAdmin ? 'Admin Panel' : 'Writer Admin'}
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(renderMenuItem)}
      </nav>

      {/* Footer Stats */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="text-sm text-gray-600">
            {isAdmin ? (
              <>
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-medium text-blue-600">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Reviews:</span>
                  <span className="font-medium text-yellow-600">
                    {orders.filter(o => o.status === 'Submitted').length}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Active Orders:</span>
                  <span className="font-medium text-blue-600">{activeOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-medium text-green-600">
                    KES {wallet.availableBalance.toLocaleString()}
                  </span>
                </div>
              </>
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
          onClick={toggleMobile}
          className="fixed top-4 left-4 z-50 md:hidden"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Mobile Sidebar */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobile} />
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {sidebarContent}
    </aside>
  );
}
