import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, 
  // Filter, 
  MessageSquare,
  // User,
  // FileText,
  Clock,
  CheckCircle,
  // AlertCircle,
  // Send,
  Download
} from 'lucide-react';
import { useMessages } from '../contexts/MessagesContext';
import { useAuth } from '../contexts/AuthContext';

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSender, setFilterSender] = useState<string>('');
  const [filterOrderType, setFilterOrderType] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  const { 
    messages, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    // getMessagesBySender,
    getMessagesByRecipient 
  } = useMessages();
  
  const { user } = useAuth();
  const currentUserRole = user?.role || 'writer';

  // Filter messages based on search and filters
  const filterMessages = (messageList: typeof messages) => {
    return messageList.filter(message => {
      const matchesSearch = 
        message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.orderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSender = !filterSender || message.sender === filterSender;
      const matchesOrderType = !filterOrderType || message.orderType === filterOrderType;
      
      return matchesSearch && matchesSender && matchesOrderType;
    });
  };

  // Get messages based on current user role
  const getRelevantMessages = () => {
    if (currentUserRole === 'admin') {
      return messages; // Admins see all messages
    } else if (currentUserRole === 'writer') {
      return getMessagesByRecipient('writer'); // Writers see messages sent to them
    } else {
      return getMessagesByRecipient('client'); // Clients see messages sent to them
    }
  };

  const relevantMessages = getRelevantMessages();
  const filteredMessages = filterMessages(relevantMessages);

  // Group messages by order (for future use)
  // const messagesByOrder = filteredMessages.reduce((acc, message) => {
  //   const key = `${message.orderType}-${message.orderId}`;
  //   if (!acc[key]) {
  //     acc[key] = [];
  //   }
  //   acc[key].push(message);
  //   return acc;
  // }, {} as Record<string, typeof messages>);

  const handleMarkAsRead = (messageId: string) => {
    markAsRead(messageId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString();
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'client':
        return '👤';
      case 'writer':
        return '✍️';
      case 'admin':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    return orderType === 'pod' ? '💰' : '📝';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages, orders, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterSender}
            onChange={(e) => setFilterSender(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Senders</option>
            <option value="client">Client</option>
            <option value="writer">Writer</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterOrderType}
            onChange={(e) => setFilterOrderType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Order Types</option>
            <option value="regular">Regular Orders</option>
            <option value="pod">POD Orders</option>
          </select>
        </div>
      </div>

      {/* Messages Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredMessages.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({filteredMessages.filter(m => !m.isRead).length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({filteredMessages.filter(m => m.sender === currentUserRole).length})</TabsTrigger>
          <TabsTrigger value="received">Received ({filteredMessages.filter(m => m.recipient === currentUserRole).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <MessagesList 
            messages={filteredMessages} 
            onMarkAsRead={handleMarkAsRead}
            formatTimestamp={formatTimestamp}
            getSenderIcon={getSenderIcon}
            getOrderTypeIcon={getOrderTypeIcon}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <MessagesList 
            messages={filteredMessages.filter(m => !m.isRead)} 
            onMarkAsRead={handleMarkAsRead}
            formatTimestamp={formatTimestamp}
            getSenderIcon={getSenderIcon}
            getOrderTypeIcon={getOrderTypeIcon}
          />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <MessagesList 
            messages={filteredMessages.filter(m => m.sender === currentUserRole)} 
            onMarkAsRead={handleMarkAsRead}
            formatTimestamp={formatTimestamp}
            getSenderIcon={getSenderIcon}
            getOrderTypeIcon={getOrderTypeIcon}
          />
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <MessagesList 
            messages={filteredMessages.filter(m => m.recipient === currentUserRole)} 
            onMarkAsRead={handleMarkAsRead}
            formatTimestamp={formatTimestamp}
            getSenderIcon={getSenderIcon}
            getOrderTypeIcon={getOrderTypeIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MessagesListProps {
  messages: any[];
  onMarkAsRead: (messageId: string) => void;
  formatTimestamp: (timestamp: string) => string;
  getSenderIcon: (sender: string) => string;
  getOrderTypeIcon: (orderType: string) => string;
}

function MessagesList({ 
  messages, 
  onMarkAsRead, 
  formatTimestamp, 
  getSenderIcon, 
  getOrderTypeIcon 
}: MessagesListProps) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No messages found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card 
          key={message.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => !message.isRead && onMarkAsRead(message.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getSenderIcon(message.sender)}</span>
                  <span className="text-lg">{getOrderTypeIcon(message.orderType)}</span>
                  <Badge variant={message.orderType === 'pod' ? 'default' : 'secondary'}>
                    {message.orderType === 'pod' ? 'POD' : 'Regular'}
                  </Badge>
                  <span className="font-medium text-gray-900">{message.orderTitle}</span>
                  <span className="text-sm text-gray-500">#{message.orderId}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium capitalize text-gray-700">
                    {message.sender}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium capitalize text-gray-700">
                    {message.recipient}
                  </span>
                </div>
                
                <p className="text-gray-800 mb-3 leading-relaxed">
                  {message.message}
                </p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    <span className="text-sm text-gray-500">Attachments:</span>
                    {message.attachments.map((attachment: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {formatTimestamp(message.timestamp)}
                  </div>
                  
                  {!message.isRead && (
                    <Badge variant="default" className="bg-blue-600">
                      Unread
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
