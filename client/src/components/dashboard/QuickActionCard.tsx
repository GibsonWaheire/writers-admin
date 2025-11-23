/**
 * Quick Action Card Component
 * Provides quick access to common actions
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  badge?: string | number;
}

export interface QuickActionCardProps {
  title: string;
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
}

export function QuickActionCard({ 
  title, 
  actions, 
  columns = 2 
}: QuickActionCardProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-3`}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={action.onClick}
            >
              <div className="relative">
                <action.icon className="h-5 w-5" />
                {action.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </div>
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

