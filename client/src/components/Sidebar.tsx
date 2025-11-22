import React, { useState } from 'react';
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
  DollarSign,
  ClipboardList,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useIsMobile } from '../hooks/use-mobile';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useMessages } from '../contexts/MessagesContext';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  emoji: string;
  subItems?: MenuItem[];
}

const writerMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/writer', emoji: '📊' },
  { 
    icon: FileText, 
    label: 'Order Management', 
    path: '/orders/available', 
    emoji: '📝',
    subItems: [
      { icon: ClipboardList, label: 'Available Orders', path: '/orders/available', emoji: '📋' },
      { icon: UserCheck, label: 'Assigned Orders', path: '/orders/assigned', emoji: '👤' },
      { icon: AlertTriangle, label: 'Revisions', path: '/orders/revisions', emoji: '🔄' },
      { icon: CheckCircle, label: 'Completed', path: '/orders/completed', emoji: '✅' },
      { icon: XCircle, label: 'Rejected', path: '/orders/rejected', emoji: '❌' }
    ]
  },
  { 
    icon: DollarSign, 
    label: 'POD Orders', 
    path: '/pod-orders', 
    emoji: '💰',
    subItems: [
      { icon: ClipboardList, label: 'Available POD', path: '/pod-orders?tab=available', emoji: '📋' },
      { icon: UserCheck, label: 'My POD Orders', path: '/pod-orders?tab=my-orders', emoji: '👤' },
      { icon: CheckCircle, label: 'Completed POD', path: '/pod-orders?tab=completed', emoji: '✅' }
    ]
  },
  { icon: Wallet, label: 'Wallet', path: '/wallet', emoji: '💳' },
  { icon: Star, label: 'Reviews', path: '/reviews', emoji: '⭐' },
  { icon: MessageSquare, label: 'Messages', path: '/messages', emoji: '💬' },
  { icon: Receipt, label: 'Invoices', path: '/invoices', emoji: '📜' },
];

const adminMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', emoji: '📊' },
  { 
    icon: FileText, 
    label: 'Order Management', 
    path: '/admin/orders', 
    emoji: '📝',
    subItems: [
      { icon: ClipboardList, label: 'All Orders', path: '/admin/orders/all', emoji: '📋' },
      { icon: AlertTriangle, label: 'Pending Review', path: '/admin/orders/review', emoji: '⚠️' },
      { icon: UserCheck, label: 'Assignment Center', path: '/admin/orders/assign', emoji: '👤' },
      { icon: Users, label: 'Writer Monitor', path: '/admin/orders/writers', emoji: '👥' },
      { icon: BarChart3, label: 'Order Analytics', path: '/admin/orders/analytics', emoji: '📊' }
    ]
  },
  { 
    icon: DollarSign, 
    label: 'POD Orders', 
    path: '/admin/pod-orders', 
    emoji: '💰',
    subItems: [
      { icon: ClipboardList, label: 'All POD Orders', path: '/admin/pod-orders', emoji: '📋' },
      { icon: AlertTriangle, label: 'Pending Review', path: '/admin/pod-orders?tab=pending', emoji: '⚠️' },
      { icon: CheckCircle, label: 'Ready for Delivery', path: '/admin/pod-orders?tab=ready', emoji: '🚚' },
      { icon: BarChart3, label: 'POD Analytics', path: '/admin/pod-orders?tab=analytics', emoji: '📊' }
    ]
  },
  { icon: DollarSign, label: 'Writers', path: '/admin/writers', emoji: '👥' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews', emoji: '⭐' },
  { icon: Wallet, label: 'Financial', path: '/admin/financial', emoji: '💰' },
  { icon: MessageSquare, label: 'Users', path: '/admin/users', emoji: '👤' },
  { icon: Receipt, label: 'Analytics', path: '/admin/analytics', emoji: '📈' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Auto-expand Order Management for both admin and writer users
  const [expandedItems, setExpandedItems] = useState<string[]>(['/admin/orders', '/orders/available']);
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

  const toggleExpanded = (itemPath: string) => {
    setExpandedItems(prev => 
      prev.includes(itemPath) 
        ? prev.filter(p => p !== itemPath)
        : [...prev, itemPath]
    );
  };

  const isActive = (path: string) => {
    if (path === '/writer' && location.pathname === '/') return true;
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSubItemActive = (path: string) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.path);
    const showBadge = item.label === 'Messages' && unreadCount > 0;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isOrderManagement = item.path === '/admin/orders' || item.path === '/orders/available';
    
    if (hasSubItems) {
      return (
        <div key={item.path}>
          {/* Main menu item */}
          <div
            onClick={isOrderManagement ? undefined : () => toggleExpanded(item.path)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isOrderManagement ? '' : 'cursor-pointer'
            } ${
              active
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.emoji}</span>
            {!isCollapsed && (
              <>
                <span className="font-medium flex-1">{item.label}</span>
                {!isOrderManagement && (
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? 'transform rotate-90' : ''
                    }`} 
                  />
                )}
                {isOrderManagement && (
                  <ChevronRight className="h-4 w-4 transform rotate-90 text-blue-500" />
                )}
              </>
            )}
          </div>
          
          {/* Sub-items - Always show for Order Management, conditional for others */}
          {!isCollapsed && (isOrderManagement || isExpanded) && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems?.map((subItem: MenuItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  onClick={closeMobile}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isSubItemActive(subItem.path)
                      ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-400'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{subItem.emoji}</span>
                  <span className="text-sm font-medium">{subItem.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    
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
