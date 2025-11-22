import type { Writer } from '../types/user';
import type { Order } from '../types/order';
import type { PODOrder } from '../types/pod';
import type { Review } from '../types/review';
import type { 
  Invoice, 
  Fine, 
  Payment, 
  ClientPayment, 
  PlatformFunds, 
  WithdrawalRequest, 
  TransactionLog 
} from '../types/financial';
import type { Notification } from '../types/notification';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  private static instance: ApiService;
  private updateCallbacks: Map<string, Set<() => void>> = new Map();

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Subscribe to specific collection updates
  public subscribeToCollection(collection: string, callback: () => void): () => void {
    if (!this.updateCallbacks.has(collection)) {
      this.updateCallbacks.set(collection, new Set());
    }
    
    const callbacks = this.updateCallbacks.get(collection)!;
    callbacks.add(callback);
    
    return () => {
      const callbacks = this.updateCallbacks.get(collection);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.updateCallbacks.delete(collection);
        }
      }
    };
  }

  public subscribeToAllUpdates(callback: () => void): () => void {
    return this.subscribeToCollection('orders', callback);
  }

  private notifyCollectionSubscribers(collection: string): void {
    const callbacks = this.updateCallbacks.get(collection);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in update callback:', error);
        }
      });
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Generic CRUD operations
  async find<T>(collection: string, params?: Record<string, string>): Promise<T[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T[]>(`/${collection}${queryString}`);
  }

  async findOne<T>(collection: string, id: string): Promise<T | undefined> {
    try {
      return await this.request<T>(`/${collection}/${id}`);
    } catch (error) {
      return undefined;
    }
  }

  async findById<T extends { id: string }>(collection: string, id: string): Promise<T | undefined> {
    return this.findOne<T>(collection, id);
  }

  async create<T extends { id: string }>(collection: string, item: T): Promise<T> {
    const result = await this.request<T>(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
    this.notifyCollectionSubscribers(collection);
    return result;
  }

  async update<T extends { id: string }>(
    collection: string, 
    id: string, 
    updates: Partial<T>
  ): Promise<T | null> {
    try {
      const result = await this.request<T>(`/${collection}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      this.notifyCollectionSubscribers(collection);
      return result;
    } catch (error) {
      console.error(`Failed to update ${collection}:`, error);
      return null;
    }
  }

  async delete(collection: string, id: string): Promise<boolean> {
    try {
      await this.request(`/${collection}/${id}`, {
        method: 'DELETE',
      });
      this.notifyCollectionSubscribers(collection);
      return true;
    } catch (error) {
      console.error(`Failed to delete ${collection}:`, error);
      return false;
    }
  }

  // Specialized methods for orders
  async getOrders(status?: string, writerId?: string): Promise<Order[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (writerId) params.writerId = writerId;
    return this.find<Order>('orders', params);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.findById<Order>('orders', id);
  }

  async createOrder(order: Order): Promise<Order> {
    return this.create<Order>('orders', order);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    return this.update<Order>('orders', id, updates);
  }

  // Specialized methods for writers
  async getWriters(): Promise<Writer[]> {
    return this.find<Writer>('writers');
  }

  async getWriter(id: string): Promise<Writer | undefined> {
    return this.findById<Writer>('writers', id);
  }

  async createWriter(writer: Writer): Promise<Writer> {
    return this.create<Writer>('writers', writer);
  }

  async updateWriter(id: string, updates: Partial<Writer>): Promise<Writer | null> {
    return this.update<Writer>('writers', id, updates);
  }

  // Specialized methods for POD orders
  async getPODOrders(status?: string, writerId?: string): Promise<PODOrder[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (writerId) params.writerId = writerId;
    return this.find<PODOrder>('pod-orders', params);
  }

  async getPODOrder(id: string): Promise<PODOrder | undefined> {
    return this.findById<PODOrder>('pod-orders', id);
  }

  async createPODOrder(order: PODOrder): Promise<PODOrder> {
    return this.create<PODOrder>('pod-orders', order);
  }

  async updatePODOrder(id: string, updates: Partial<PODOrder>): Promise<PODOrder | null> {
    return this.update<PODOrder>('pod-orders', id, updates);
  }

  // Specialized methods for reviews
  async getReviews(writerId?: string, orderId?: string): Promise<Review[]> {
    const params: Record<string, string> = {};
    if (writerId) params.writerId = writerId;
    if (orderId) params.orderId = orderId;
    return this.find<Review>('reviews', params);
  }

  async createReview(review: Review): Promise<Review> {
    return this.create<Review>('reviews', review);
  }

  // Specialized methods for financial
  async getInvoices(writerId?: string, status?: string): Promise<Invoice[]> {
    const params: Record<string, string> = {};
    if (writerId) params.writerId = writerId;
    if (status) params.status = status;
    return this.request<Invoice[]>(`/financial/invoices${params ? '?' + new URLSearchParams(params).toString() : ''}`);
  }

  async createInvoice(invoice: Invoice): Promise<Invoice> {
    return this.request<Invoice>('/financial/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  async getFines(writerId?: string): Promise<Fine[]> {
    const params: Record<string, string> = {};
    if (writerId) params.writerId = writerId;
    return this.request<Fine[]>(`/financial/fines${params ? '?' + new URLSearchParams(params).toString() : ''}`);
  }

  async createFine(fine: Fine): Promise<Fine> {
    return this.request<Fine>('/financial/fines', {
      method: 'POST',
      body: JSON.stringify(fine),
    });
  }

  async getPayments(writerId?: string): Promise<Payment[]> {
    const params: Record<string, string> = {};
    if (writerId) params.writerId = writerId;
    return this.request<Payment[]>(`/financial/payments${params ? '?' + new URLSearchParams(params).toString() : ''}`);
  }

  async createPayment(payment: Payment): Promise<Payment> {
    return this.request<Payment>('/financial/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async getWithdrawals(writerId?: string, status?: string): Promise<WithdrawalRequest[]> {
    const params: Record<string, string> = {};
    if (writerId) params.writerId = writerId;
    if (status) params.status = status;
    return this.request<WithdrawalRequest[]>(`/financial/withdrawals${params ? '?' + new URLSearchParams(params).toString() : ''}`);
  }

  async createWithdrawal(withdrawal: WithdrawalRequest): Promise<WithdrawalRequest> {
    return this.request<WithdrawalRequest>('/financial/withdrawals', {
      method: 'POST',
      body: JSON.stringify(withdrawal),
    });
  }

  // Specialized methods for notifications
  async getNotifications(userId?: string, isRead?: boolean): Promise<Notification[]> {
    const params: Record<string, string> = {};
    if (userId) params.userId = userId;
    if (isRead !== undefined) params.isRead = isRead.toString();
    return this.find<Notification>('notifications', params);
  }

  async createNotification(notification: Notification): Promise<Notification> {
    return this.create<Notification>('notifications', notification);
  }

  async markNotificationRead(id: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Specialized methods for messages
  async getMessages(userId?: string, relatedOrderId?: string): Promise<any[]> {
    const params: Record<string, string> = {};
    if (userId) params.userId = userId;
    if (relatedOrderId) params.relatedOrderId = relatedOrderId;
    return this.find<any>('messages', params);
  }

  async createMessage(message: any): Promise<any> {
    return this.create<any>('messages', message);
  }

  // Financial helper methods
  async findFinancial<T>(subCollection: string, params?: Record<string, string>): Promise<T[]> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T[]>(`/financial/${subCollection}${queryString}`);
  }

  async createFinancial<T extends { id: string }>(
    subCollection: string, 
    item: T
  ): Promise<T> {
    return this.request<T>(`/financial/${subCollection}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateFinancial<T extends { id: string }>(
    subCollection: string,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    try {
      return await this.request<T>(`/financial/${subCollection}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      return null;
    }
  }

  // Stats methods
  async getOrderStats(): Promise<{
    total: number;
    available: number;
    assigned: number;
    inProgress: number;
    submitted: number;
    completed: number;
    lastUpdated: string;
  }> {
    const orders = await this.getOrders();
    return {
      total: orders.length,
      available: orders.filter(o => o.status === 'Available').length,
      assigned: orders.filter(o => o.status === 'Assigned').length,
      inProgress: orders.filter(o => o.status === 'In Progress').length,
      submitted: orders.filter(o => o.status === 'Submitted').length,
      completed: orders.filter(o => ['Completed', 'Approved'].includes(o.status)).length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Legacy compatibility methods
  async reset(): Promise<void> {
    console.warn('Reset not implemented in API service');
  }

  async export(): Promise<string> {
    console.warn('Export not implemented in API service');
    return '';
  }

  async import(jsonData: string): Promise<void> {
    console.warn('Import not implemented in API service');
  }

  async forceRefresh(): Promise<void> {
    this.notifyCollectionSubscribers('orders');
  }

  async debugOrderVisibility(): Promise<any> {
    const orders = await this.getOrders();
    return {
      totalOrders: orders.length,
      availableOrders: orders.filter(o => o.status === 'Available' && !o.writerId).length,
      orderDetails: orders.map(o => ({
        id: o.id,
        status: o.status,
        title: o.title,
        writerId: o.writerId
      }))
    };
  }
}

// Export singleton instance
export const api = ApiService.getInstance();

// Export for backward compatibility
export const db = api;

