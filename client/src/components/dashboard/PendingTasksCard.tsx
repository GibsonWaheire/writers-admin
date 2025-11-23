/**
 * Pending Tasks Card Component
 * Shows pending tasks that need attention
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  CheckCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PendingTask {
  id: string;
  title: string;
  type: 'review' | 'revision' | 'approval' | 'assignment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  count?: number;
  actionUrl: string;
}

export interface PendingTasksCardProps {
  tasks: PendingTask[];
  userRole: 'admin' | 'writer';
}

export function PendingTasksCard({ tasks, userRole }: PendingTasksCardProps) {
  const navigate = useNavigate();

  const getTaskIcon = (type: PendingTask['type']) => {
    switch (type) {
      case 'review':
        return <FileText className="h-4 w-4" />;
      case 'revision':
        return <RefreshCw className="h-4 w-4" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4" />;
      case 'assignment':
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: PendingTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const urgentTasks = tasks.filter(t => t.priority === 'urgent');
  const highPriorityTasks = tasks.filter(t => t.priority === 'high');

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Pending Tasks
            {urgentTasks.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {urgentTasks.length} Urgent
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary">
            {tasks.length} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    task.priority === 'urgent' ? 'bg-red-100' :
                    task.priority === 'high' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    {getTaskIcon(task.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {task.title}
                      </p>
                      {task.count && task.count > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {task.count}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                      {task.deadline && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(task.actionUrl)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {tasks.length > 5 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Navigate to appropriate page based on user role
                  if (userRole === 'admin') {
                    navigate('/admin/orders/review');
                  } else {
                    navigate('/orders/assigned');
                  }
                }}
              >
                View All Tasks ({tasks.length})
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No pending tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

