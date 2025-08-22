import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'bank_transfer' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
}

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_METHOD_TYPES = [
  { value: 'mpesa', label: 'M-Pesa', description: 'Mobile Money Transfer' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Direct Bank Transfer' },
  { value: 'cash', label: 'Cash Pickup', description: 'Physical Cash Collection' }
];

export function PaymentMethodsModal({ isOpen, onClose }: PaymentMethodsModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mpesa',
      name: 'Primary M-Pesa',
      details: '254700000000',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank_transfer',
      name: 'Equity Bank',
      details: '1234567890 - Equity Bank',
      isDefault: false
    }
  ]);
  
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    details: ''
  });

  const handleAddMethod = () => {
    if (!formData.type || !formData.name || !formData.details) return;
    
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: formData.type as 'mpesa' | 'bank_transfer' | 'cash',
      name: formData.name,
      details: formData.details,
      isDefault: paymentMethods.length === 0
    };
    
    setPaymentMethods(prev => [...prev, newMethod]);
    setFormData({ type: '', name: '', details: '' });
    setShowAddForm(false);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      name: method.name,
      details: method.details
    });
  };

  const handleUpdateMethod = () => {
    if (!editingMethod) return;
    
    setPaymentMethods(prev => prev.map(method => 
      method.id === editingMethod.id 
        ? { ...method, ...formData, type: formData.type as 'mpesa' | 'bank_transfer' | 'cash' }
        : method
    ));
    
    setEditingMethod(null);
    setFormData({ type: '', name: '', details: '' });
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'mpesa':
        return '📱';
      case 'bank_transfer':
        return '🏦';
      case 'cash':
        return '💵';
      default:
        return '💰';
    }
  };

  const getMethodTypeLabel = (type: string) => {
    return PAYMENT_METHOD_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Methods" size="lg">
      <div className="w-full max-w-4xl mx-auto">
        {/* Add New Method Button */}
        <div className="mb-6">
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="flex items-center gap-2 h-12 px-6"
          >
            <Plus className="h-5 w-5" />
            Add Payment Method
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingMethod) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-lg mb-4">
              {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="pt-4 pb-8">
                <Label htmlFor="type" className="text-base font-medium">Type</Label>
                <div className="relative">
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent 
                      className="z-[99999] min-w-[250px] bg-white border border-gray-200 shadow-lg rounded-lg"
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={4}
                      avoidCollisions={true}
                      collisionPadding={20}
                    >
                      {PAYMENT_METHOD_TYPES.map((method) => (
                        <SelectItem key={method.value} value={method.value} className="py-3 hover:bg-gray-100 focus:bg-gray-100">
                          <div>
                            <div className="font-medium text-base">{method.label}</div>
                            <div className="text-sm text-gray-500">{method.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="name" className="text-base font-medium">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Primary M-Pesa"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="details" className="text-base font-medium">Details</Label>
                <Input
                  id="details"
                  placeholder="e.g., 254700000000"
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={editingMethod ? handleUpdateMethod : handleAddMethod}
                disabled={!formData.type || !formData.name || !formData.details}
                className="h-12 px-6"
              >
                {editingMethod ? 'Update' : 'Add'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMethod(null);
                  setFormData({ type: '', name: '', details: '' });
                }}
                className="h-12 px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-6 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMethodIcon(method.type)}</div>
                <div>
                  <div className="font-medium text-lg">{method.name}</div>
                  <div className="text-base text-gray-600">{method.details}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-sm">
                      {getMethodTypeLabel(method.type)}
                    </Badge>
                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-700 text-sm">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                    className="h-10 px-4"
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditMethod(method)}
                  className="h-10 px-4"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteMethod(method.id)}
                  className="h-10 px-4 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {paymentMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Payment Methods</h3>
            <p className="text-gray-500">Add your first payment method to start withdrawing earnings.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
