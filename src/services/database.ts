import type { Writer, WriterInvite, WriterActivity } from '../types/user';
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
import type { 
  Notification, 
  NotificationPreferences, 
  AssignmentHistory, 
  AssignmentConfirmation 
} from '../types/notification';

// Database structure interface
interface Database {
  users: Array<{
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'writer' | 'admin';
  }>;
  writers: Writer[];
  writerInvites: WriterInvite[];
  writerActivities: WriterActivity[];
  orders: Order[];
  podOrders: PODOrder[];
  reviews: Review[];
  financial: {
    invoices: Invoice[];
    fines: Fine[];
    payments: Payment[];
    clientPayments: ClientPayment[];
    platformFunds: PlatformFunds[];
    withdrawalRequests: WithdrawalRequest[];
    transactionLogs: TransactionLog[];
  };
  notifications: Notification[];
  notificationPreferences: NotificationPreferences[];
  assignmentHistory: AssignmentHistory[];
  assignmentConfirmations: AssignmentConfirmation[];
  messages: any[];
  settings: Record<string, any>;
}

class DatabaseService {
  private static instance: DatabaseService;
  private db: Database | null = null;
  private readonly DB_KEY = 'writers_admin_db';
  private updateCallbacks: Map<string, Set<() => void>> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;
  private syncInProgress: boolean = false;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 3000; // 3 seconds for faster updates

  private constructor() {
    this.loadDatabase();
    this.startAutoSync();
    this.setupVisibilityChangeHandler();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Subscribe to specific collection updates
  public subscribeToCollection(collection: keyof Database, callback: () => void): () => void {
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

  // Subscribe to all database updates
  public subscribeToAllUpdates(callback: () => void): () => void {
    return this.subscribeToCollection('orders', callback); // Use orders as the main collection
  }

  // Notify subscribers of specific collection changes
  private notifyCollectionSubscribers(collection: keyof Database): void {
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

  // Notify all subscribers
  private notifyAllSubscribers(): void {
    this.updateCallbacks.forEach((callbacks, collection) => {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error(`Error in ${collection} update callback:`, error);
        }
      });
    });
  }

  // Handle page visibility changes for better sync
  private setupVisibilityChangeHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible, sync immediately
        this.forceSync();
      }
    });

    // Sync when window gains focus
    window.addEventListener('focus', () => {
      this.forceSync();
    });
  }

  // Start automatic synchronization with db.json
  private startAutoSync(): void {
    this.syncInterval = setInterval(async () => {
      if (!this.syncInProgress && !document.hidden) {
        await this.syncWithJSON();
      }
    }, this.SYNC_INTERVAL);
  }

  // Stop auto-sync (useful for cleanup)
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Force immediate sync
  public async forceSync(): Promise<void> {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      await this.syncWithJSON();
    } finally {
      this.syncInProgress = false;
    }
  }

  // Synchronize local database with db.json with improved error handling
  private async syncWithJSON(): Promise<void> {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      const now = Date.now();
      
      // Don't sync too frequently
      if (now - this.lastSyncTime < 1000) return;
      
      const response = await fetch('/db.json', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const jsonData = await response.json();
        
        // Check if there are actual changes
        if (this.hasSignificantChanges(jsonData)) {
          // Merge data instead of completely overwriting
          this.db = this.mergeData(this.db || jsonData, jsonData);
          this.lastSyncTime = now;
          this.retryCount = 0;
          
          // Notify subscribers of the change
          this.notifyAllSubscribers();
          
          console.log('🔄 Database synchronized with db.json', {
            timestamp: new Date().toISOString(),
            ordersCount: this.db.orders?.length || 0,
            availableOrders: this.db.orders?.filter((o: any) => o.status === 'Available').length || 0
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Auto-sync warning:', error);
      this.handleSyncError(error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Merge local data with db.json data, preserving newer local data
  private mergeData(localData: Database, jsonData: Database): Database {
    if (!localData) return jsonData;
    
    const merged = { ...jsonData };
    
    // Preserve local orders if they're newer or don't exist in db.json
    if (localData.orders && localData.orders.length > 0) {
      const localOrderIds = new Set(localData.orders.map(o => o.id));
      const jsonOrderIds = new Set(jsonData.orders?.map(o => o.id) || []);
      
      // Add local orders that don't exist in db.json
      localData.orders.forEach(localOrder => {
        if (!jsonOrderIds.has(localOrder.id)) {
          merged.orders = merged.orders || [];
          merged.orders.push(localOrder);
          console.log('🔄 Preserving local order:', localOrder.id);
        }
      });
    }
    
    return merged;
  }

  // Check if there are significant changes that warrant an update
  private hasSignificantChanges(newData: Database): boolean {
    if (!this.db) return true;
    
    // Check orders collection specifically
    const currentOrders = this.db.orders || [];
    const newOrders = newData.orders || [];
    
    // If local has more orders than db.json, don't overwrite (local is more up-to-date)
    if (currentOrders.length > newOrders.length) {
      console.log('🔄 Local has more orders than db.json, skipping overwrite');
      return false;
    }
    
    // Check if number of available orders changed (but only if we're not losing data)
    const currentAvailable = currentOrders.filter((o) => o.status === 'Available').length;
    const newAvailable = newOrders.filter((o) => o.status === 'Available').length;
    
    // Only consider it a significant change if we're not losing orders
    if (currentAvailable !== newAvailable && newOrders.length >= currentOrders.length) {
      return true;
    }
    
    // Check if any existing order statuses changed (but only for orders that exist in both)
    for (let i = 0; i < Math.min(currentOrders.length, newOrders.length); i++) {
      if (currentOrders[i].status !== newOrders[i].status) return true;
      if (currentOrders[i].writerId !== newOrders[i].writerId) return true;
    }
    
    return false;
  }

  // Handle sync errors with exponential backoff
  private handleSyncError(error: unknown): void {
    this.retryCount++;
    
    if (this.retryCount <= this.MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
      console.log(`Retrying sync in ${delay}ms (attempt ${this.retryCount}/${this.MAX_RETRIES})`);
      
      setTimeout(() => {
        this.syncWithJSON();
      }, delay);
    } else {
      console.error('Max sync retries reached, stopping auto-sync');
      this.stopAutoSync();
    }
  }

  // Load database from localStorage or initialize with default data
  private async loadDatabase(): Promise<void> {
    try {
      const storedDb = localStorage.getItem(this.DB_KEY);
      if (storedDb) {
        this.db = JSON.parse(storedDb);
        console.log('📊 Database loaded from localStorage');
      } else {
        // Load initial data from db.json file
        await this.initializeFromJSON();
      }
    } catch (error) {
      console.error('Failed to load database:', error);
      await this.initializeFromJSON();
    }
  }

  // Initialize database from the db.json file
  private async initializeFromJSON(): Promise<void> {
    try {
      const response = await fetch('/db.json');
      if (response.ok) {
        this.db = await response.json();
        this.saveDatabase();
        console.log('📊 Database initialized from db.json');
      } else {
        throw new Error('Failed to fetch db.json');
      }
    } catch (error) {
      console.error('Failed to initialize from db.json:', error);
      // Fallback to empty database structure
      this.db = {
        users: [],
        writers: [],
        writerInvites: [],
        writerActivities: [],
        orders: [],
        podOrders: [],
        reviews: [],
        financial: {
          invoices: [],
          fines: [],
          payments: [],
          clientPayments: [],
          platformFunds: [],
          withdrawalRequests: [],
          transactionLogs: []
        },
        notifications: [],
        notificationPreferences: [],
        assignmentHistory: [],
        assignmentConfirmations: [],
        messages: [],
        settings: {}
      };
      this.saveDatabase();
    }
  }

  // Save database to localStorage and trigger sync with improved error handling
  private saveDatabase(): void {
    if (this.db) {
      try {
        localStorage.setItem(this.DB_KEY, JSON.stringify(this.db));
        console.log('💾 Database saved to localStorage');
        
        // Notify subscribers of the change
        this.notifyAllSubscribers();
        
        // Trigger immediate sync with db.json
        this.forceSync();
      } catch (error) {
        console.error('Failed to save database:', error);
        // Try to recover by forcing a sync
        this.forceSync();
      }
    }
  }

  // Ensure database is loaded
  private async ensureLoaded(): Promise<Database> {
    if (!this.db) {
      await this.loadDatabase();
    }
    return this.db!;
  }

  // Generic CRUD operations
  async find<T>(collection: keyof Database, predicate?: (item: T) => boolean): Promise<T[]> {
    const db = await this.ensureLoaded();
    const data = db[collection] as T[];
    
    if (!Array.isArray(data)) {
      console.error('❌ Database: Collection is not an array:', collection);
      return [];
    }
    
    console.log('📊 Database: Loading collection:', {
      collection,
      count: data.length,
      sample: data.slice(0, 3).map(item => ({ 
        id: item.id, 
        status: item.status,
        writerId: item.writerId 
      }))
    });
    
    return predicate ? data.filter(predicate) : data;
  }

  async findOne<T>(collection: keyof Database, predicate: (item: T) => boolean): Promise<T | undefined> {
    const items = await this.find<T>(collection, predicate);
    return items[0];
  }

  async findById<T extends { id: string }>(collection: keyof Database, id: string): Promise<T | undefined> {
    return this.findOne<T>(collection, (item) => item.id === id);
  }

  // Create with immediate availability and better logging
  async create<T extends { id: string }>(collection: keyof Database, item: T): Promise<T> {
    const db = await this.ensureLoaded();
    const data = db[collection] as T[];
    
    if (Array.isArray(data)) {
      data.push(item);
      this.saveDatabase();
      
      // For orders, ensure they're immediately available
      if (collection === 'orders') {
        const order = item as Order;
        console.log('🚀 New order created:', {
          orderId: order.id,
          status: order.status,
          title: order.title,
          discipline: order.discipline,
          pages: order.pages,
          deadline: order.deadline,
          isAvailable: order.status === 'Available',
          timestamp: new Date().toISOString()
        });
        
        // If order is available, notify immediately
        if (order.status === 'Available') {
          this.notifyCollectionSubscribers('orders');
        }
      }
    }
    
    return item;
  }

  // Update with immediate notification and better tracking
  async update<T extends { id: string }>(
    collection: keyof Database, 
    id: string, 
    updates: Partial<T>
  ): Promise<T | null> {
    const db = await this.ensureLoaded();
    const data = db[collection] as T[];
    
    if (!Array.isArray(data)) {
      console.error('❌ Database: Collection is not an array:', collection);
      return null;
    }
    
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      console.error('❌ Database: Item not found for update:', { collection, id });
      return null;
    }
    
    const oldItem = data[index];
    const updatedItem = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    data[index] = updatedItem;
    
    // Type-safe logging for orders
    if (collection === 'orders') {
      const oldOrder = oldItem as Order;
      const updatedOrder = updatedItem as Order;
      console.log('💾 Database: Updated order:', {
        collection,
        id,
        oldStatus: oldOrder.status,
        newStatus: updatedOrder.status,
        oldWriterId: oldOrder.writerId,
        newWriterId: updatedOrder.writerId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('💾 Database: Updated item:', {
        collection,
        id,
        timestamp: new Date().toISOString()
      });
    }
    
    this.saveDatabase();
    
    // Notify specific collection subscribers
    this.notifyCollectionSubscribers(collection);
    
    return updatedItem;
  }

  async delete(collection: keyof Database, id: string): Promise<boolean> {
    const db = await this.ensureLoaded();
    const data = db[collection] as Array<{ id: string }>;
    
    if (!Array.isArray(data)) {
      return false;
    }
    
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    
    data.splice(index, 1);
    this.saveDatabase();
    
    return true;
  }

  // Specialized methods for nested financial data
  async findFinancial<T>(subCollection: keyof Database['financial']): Promise<T[]> {
    const db = await this.ensureLoaded();
    return db.financial[subCollection] as unknown as T[];
  }

  async createFinancial<T extends { id: string }>(
    subCollection: keyof Database['financial'], 
    item: T
  ): Promise<T> {
    const db = await this.ensureLoaded();
    const data = db.financial[subCollection] as unknown as T[];
    data.push(item);
    this.saveDatabase();
    return item;
  }

  async updateFinancial<T extends { id: string }>(
    subCollection: keyof Database['financial'],
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    const db = await this.ensureLoaded();
    const data = db.financial[subCollection] as unknown as T[];
    
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }
    
    data[index] = { ...data[index], ...updates };
    this.saveDatabase();
    
    return data[index];
  }

  // Reset database to initial state
  async reset(): Promise<void> {
    localStorage.removeItem(this.DB_KEY);
    await this.initializeFromJSON();
    console.log('🔄 Database reset to initial state');
  }

  // Export database for backup
  async export(): Promise<string> {
    const db = await this.ensureLoaded();
    return JSON.stringify(db, null, 2);
  }

  // Import database from JSON string
  async import(jsonData: string): Promise<void> {
    try {
      const importedDb = JSON.parse(jsonData);
      this.db = importedDb;
      this.saveDatabase();
      console.log('📥 Database imported successfully');
    } catch (error) {
      console.error('Failed to import database:', error);
      throw new Error('Invalid JSON data');
    }
  }

  // Force refresh from db.json with better error handling
  async forceRefresh(): Promise<void> {
    try {
      console.log('🔄 Starting force refresh...');
      await this.initializeFromJSON();
      this.lastSyncTime = Date.now();
      this.retryCount = 0;
      this.notifyAllSubscribers();
      console.log('✅ Database force refreshed from db.json');
    } catch (error) {
      console.error('❌ Failed to force refresh database:', error);
      throw error;
    }
  }

  // Get real-time order statistics
  async getOrderStats(): Promise<{
    total: number;
    available: number;
    assigned: number;
    inProgress: number;
    submitted: number;
    completed: number;
    lastUpdated: string;
  }> {
    const db = await this.ensureLoaded();
    const orders = db.orders || [];
    
    return {
      total: orders.length,
      available: orders.filter((o: any) => o.status === 'Available').length,
      assigned: orders.filter((o: any) => o.status === 'Assigned').length,
      inProgress: orders.filter((o: any) => o.status === 'In Progress').length,
      submitted: orders.filter((o: any) => o.status === 'Submitted').length,
      completed: orders.filter((o: any) => ['Completed', 'Approved'].includes(o.status)).length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get database statistics
  async getStats(): Promise<Record<string, number>> {
    const db = await this.ensureLoaded();
    
    return {
      users: db.users.length,
      writers: db.writers.length,
      writerInvites: db.writerInvites.length,
      writerActivities: db.writerActivities.length,
      orders: db.orders.length,
      podOrders: db.podOrders.length,
      reviews: db.reviews.length,
      invoices: db.financial.invoices.length,
      fines: db.financial.fines.length,
      payments: db.financial.payments.length,
      clientPayments: db.financial.clientPayments.length,
      platformFunds: db.financial.platformFunds.length,
      withdrawalRequests: db.financial.withdrawalRequests.length,
      transactionLogs: db.financial.transactionLogs.length
    };
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Export types for convenience
export type { Database };
