import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Order } from '../types/order';

interface OrderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  userRole: 'writer' | 'admin';
  onPickOrder?: (orderId: string) => void;

}

export function OrderViewModal({
  isOpen,
  onClose,
  order,
  userRole,
  onPickOrder,

}: OrderViewModalProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Available': { color: 'bg-green-100 text-green-800', icon: '🟢' },
      'In Progress': { color: 'bg-blue-100 text-blue-800', icon: '🔵' },
      'Pending Review': { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      'Completed': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: '❌' },
      'Requires Admin Approval': { color: 'bg-orange-100 text-orange-800', icon: '⚠️' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Available'];
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {status}
      </Badge>
    );
  };

  const handlePickOrder = () => {
    if (onPickOrder) {
      onPickOrder(order.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="lg">
      <div className="space-y-6">
        {/* Order Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-gray-600">{order.description}</p>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📚 Subject:</span>
              <span className="font-medium">{order.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📄 Pages:</span>
              <span className="font-medium">{order.pages}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">💰 Price:</span>
              <span className="font-medium">${order.price}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📅 Deadline:</span>
              <span className="font-medium">{order.deadline}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">🆔 Order ID:</span>
              <span className="font-medium font-mono text-sm">{order.id}</span>
            </div>
            {order.assignedWriter && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">👤 Writer:</span>
                <span className="font-medium">{order.assignedWriter}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Actions:</h4>
          {userRole === 'writer' && order.status === 'Available' && (
            <Button onClick={handlePickOrder} className="w-full bg-green-600 hover:bg-green-700">
              📝 Pick Order
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
