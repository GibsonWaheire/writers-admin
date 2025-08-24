import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  UserCheck, 
  Users, 
  BookOpen, 
  Search,
  Star,
  Clock,
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useUsers } from '../contexts/UsersContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useOrders } from '../contexts/OrderContext';
import type { Order } from '../types/order';
import type { SmartAssignmentSuggestion } from '../types/notification';

interface Writer {
  id: string;
  name: string;
  email: string;
  rating: number;
  activeOrders: number;
  maxOrders: number;
  completedOrders: number;
  totalEarnings: number;
  specialties: string[];
  avgCompletionTime: number; // in hours
}

interface OrderAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onAssign: (writerId: string, options: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    deadline?: string;
    requireConfirmation?: boolean;
  }) => void;
  onMakeAvailable: (notes?: string) => void;
}

export function OrderAssignmentModal({ 
  isOpen, 
  onClose, 
  order, 
  onAssign, 
  onMakeAvailable 
}: OrderAssignmentModalProps) {
  const { writers } = useUsers();
  const { getSmartAssignmentSuggestions } = useNotifications();
  const [selectedWriterId, setSelectedWriterId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [assignmentType, setAssignmentType] = useState<'specific' | 'available' | 'smart'>('smart');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [customDeadline, setCustomDeadline] = useState('');
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);

  // Filter writers based on search and specialty
  // Use real data from orders context to calculate active orders
  const { orders } = useOrders();
  
  const realWriters = writers.filter(w => w.status === 'active').map(writer => {
    // Calculate real active orders from orders context
    const writerActiveOrders = orders.filter(order => 
      order.writerId === writer.id && 
      ['Assigned', 'In Progress', 'Submitted', 'Revision'].includes(order.status)
    ).length;
    
    // Calculate average completion time from completed orders
    const completedOrders = orders.filter(order => 
      order.writerId === writer.id && 
      order.status === 'Completed' && 
      order.completedAt && 
      order.assignedAt
    );
    
    let avgCompletionTime = 48; // Default 48 hours
    if (completedOrders.length > 0) {
      const totalTime = completedOrders.reduce((sum, order) => {
        const assigned = new Date(order.assignedAt!);
        const completed = new Date(order.completedAt!);
        return sum + (completed.getTime() - assigned.getTime());
      }, 0);
      avgCompletionTime = Math.round(totalTime / (completedOrders.length * 1000 * 60 * 60)); // Convert to hours
    }
    
    return {
      id: writer.id,
      name: writer.name,
      email: writer.email,
      rating: writer.rating,
      activeOrders: writerActiveOrders,
      maxOrders: writer.maxConcurrentOrders,
      completedOrders: writer.completedOrders,
      totalEarnings: writer.totalEarnings,
      specialties: writer.specializations,
      avgCompletionTime
    };
  });

  const filteredWriters = realWriters.filter(writer => {
    const matchesSearch = 
      writer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = !filterSpecialty || filterSpecialty === 'all' || writer.specialties.includes(filterSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  // Get unique specialties for filter
  const specialties = Array.from(new Set(realWriters.flatMap(w => w.specialties))).sort();

  // Get writer by ID
  const selectedWriter = selectedWriterId ? realWriters.find(w => w.id === selectedWriterId) : null;

  // Check if writer can take the order
  const canTakeOrder = (writer: Writer) => {
    return writer.activeOrders < writer.maxOrders;
  };

  // Get writer status badge
  const getWriterStatusBadge = (writer: Writer) => {
    if (writer.activeOrders >= writer.maxOrders) {
      return <Badge variant="destructive" className="text-xs">At Capacity</Badge>;
    }
    if (writer.activeOrders === 0) {
      return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Available</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">{writer.activeOrders}/{writer.maxOrders} Active</Badge>;
  };

  // Get smart assignment suggestions
  const smartSuggestions = getSmartAssignmentSuggestions(order, writers);
  
  // Handle specific writer assignment
  const handleAssignToWriter = () => {
    if (selectedWriterId && selectedWriter) {
      onAssign(selectedWriterId, {
        notes: assignmentNotes,
        priority,
        deadline: customDeadline || undefined,
        requireConfirmation
      });
      onClose();
    }
  };

  // Handle making order available
  const handleMakeAvailable = () => {
    onMakeAvailable(assignmentNotes);
    onClose();
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedWriterId('');
      setAssignmentNotes('');
      setSearchTerm('');
      setFilterSpecialty('all');
      setAssignmentType('smart');
      setPriority('medium');
      setCustomDeadline('');
      setRequireConfirmation(true);
      setShowSmartSuggestions(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-0 shadow-2xl">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
        </div>

        {/* Content Container with Glass Effect */}
        <div className="relative z-10">
          <DialogHeader className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg -mx-6 -mt-6 pt-6 px-6"></div>
            <DialogTitle className="relative flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              Order Assignment
            </DialogTitle>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
          {/* Order Summary */}
          <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800">Order Details</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-200">
                  <div className="font-semibold text-blue-700 mb-1">{order.title}</div>
                  <div className="text-gray-600 text-xs uppercase tracking-wide">Title</div>
                </div>
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-200">
                  <div className="font-semibold text-blue-700 mb-1">{order.pages}</div>
                  <div className="text-gray-600 text-xs uppercase tracking-wide">Pages</div>
                </div>
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-200">
                  <div className="font-semibold text-blue-700 mb-1">{order.discipline}</div>
                  <div className="text-gray-600 text-xs uppercase tracking-wide">Discipline</div>
                </div>
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-blue-100/50 hover:shadow-md transition-all duration-200">
                  <div className="font-semibold text-blue-700 mb-1">{order.paperType}</div>
                  <div className="text-gray-600 text-xs uppercase tracking-wide">Type</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Type Selection */}
          <Card className="bg-gradient-to-r from-white/80 to-gray-50/80 border border-gray-200/50 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Assignment Type</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    assignmentType === 'specific' 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/80 shadow-lg ring-2 ring-blue-200/50' 
                      : 'border-gray-200/60 bg-white/60 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                  }`}
                  onClick={() => setAssignmentType('specific')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-start gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      assignmentType === 'specific' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg' 
                        : 'bg-gray-100 group-hover:bg-blue-100'
                    }`}>
                      <UserCheck className={`h-6 w-6 transition-colors duration-300 ${
                        assignmentType === 'specific' ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                        assignmentType === 'specific' ? 'text-blue-800' : 'text-gray-800 group-hover:text-blue-700'
                      }`}>Assign to Specific Writer</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Choose a specific writer based on their expertise, rating, and availability</p>
                    </div>
                  </div>
                  {assignmentType === 'specific' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                <div 
                  className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    assignmentType === 'available' 
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100/80 shadow-lg ring-2 ring-green-200/50' 
                      : 'border-gray-200/60 bg-white/60 hover:border-green-300 hover:bg-green-50/50 hover:shadow-md'
                  }`}
                  onClick={() => setAssignmentType('available')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-start gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      assignmentType === 'available' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' 
                        : 'bg-gray-100 group-hover:bg-green-100'
                    }`}>
                      <BookOpen className={`h-6 w-6 transition-colors duration-300 ${
                        assignmentType === 'available' ? 'text-white' : 'text-gray-500 group-hover:text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                        assignmentType === 'available' ? 'text-green-800' : 'text-gray-800 group-hover:text-green-700'
                      }`}>Make Available</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Allow any qualified writer to pick up this order from the available pool</p>
                    </div>
                  </div>
                  {assignmentType === 'available' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writer Selection (only show if assigning to specific writer) */}
          {assignmentType === 'specific' && (
            <Card className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200/50 shadow-lg backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-800">Select Writer</h3>
                </div>
                
                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search writers by name, email, or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Writers List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {filteredWriters.map((writer) => (
                    <div 
                      key={writer.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedWriterId === writer.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!canTakeOrder(writer) ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onClick={() => canTakeOrder(writer) && setSelectedWriterId(writer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{writer.name}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{writer.rating}</span>
                            </div>
                            {getWriterStatusBadge(writer)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Email:</span> {writer.email}
                            </div>
                            <div>
                              <span className="font-medium">Active:</span> {writer.activeOrders}/{writer.maxOrders}
                            </div>
                            <div>
                              <span className="font-medium">Completed:</span> {writer.completedOrders}
                            </div>
                            <div>
                              <span className="font-medium">Earnings:</span> KES {writer.totalEarnings.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <span className="font-medium text-sm">Specialties:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {writer.specialties.map(specialty => (
                                <Badge key={specialty} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredWriters.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No writers found matching your criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assignment Notes */}
          <Card className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800">Assignment Notes (Optional)</h3>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Add any specific instructions, requirements, or notes for the writer... (e.g., special formatting, research sources, deadline reminders)"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={4}
                  className="bg-white/80 border-amber-200/50 focus:border-amber-400 focus:ring-amber-200/50 backdrop-blur-sm resize-none"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {assignmentNotes.length}/500
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Writer Summary */}
          {assignmentType === 'specific' && selectedWriter && (
            <Card className="bg-gradient-to-r from-green-50/90 to-emerald-50/90 border border-green-200/60 shadow-lg backdrop-blur-sm animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Selected Writer</h3>
                  <div className="ml-auto">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">READY TO ASSIGN</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-6 p-4 bg-white/60 rounded-xl border border-green-100/50">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-sm">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl text-green-900 mb-1">{selectedWriter.name}</h4>
                    <p className="text-green-700 mb-3">{selectedWriter.email}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-2 bg-white/80 rounded-lg border border-green-100">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-green-700">{selectedWriter.rating}</span>
                        </div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                      <div className="text-center p-2 bg-white/80 rounded-lg border border-green-100">
                        <div className="font-bold text-green-700 mb-1">{selectedWriter.completedOrders}</div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                      <div className="text-center p-2 bg-white/80 rounded-lg border border-green-100">
                        <div className="font-bold text-green-700 mb-1">{selectedWriter.activeOrders}/{selectedWriter.maxOrders}</div>
                        <div className="text-xs text-gray-600">Active</div>
                      </div>
                      <div className="text-center p-2 bg-white/80 rounded-lg border border-green-100">
                        <div className="font-bold text-green-700 mb-1">KES {(selectedWriter.totalEarnings / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-600">Earnings</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedWriter.specialties.map(specialty => (
                        <Badge key={specialty} variant="outline" className="bg-green-100/80 text-green-800 border-green-300/50 text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          </div>

          <DialogFooter className="relative gap-4 pt-6 mt-6 border-t border-gradient-to-r from-transparent via-gray-300 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-gray-100/50 -mx-6 -mb-6 pb-6 px-6 rounded-b-lg"></div>
            <div className="relative flex gap-4 w-full justify-end">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </Button>
              
              {assignmentType === 'specific' ? (
                <Button 
                  onClick={handleAssignToWriter}
                  disabled={!selectedWriterId}
                  className="px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign to Writer
                </Button>
              ) : (
                <Button 
                  onClick={handleMakeAvailable}
                  className="px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Make Available
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
