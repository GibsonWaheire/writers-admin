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

  private constructor() {
    this.loadDatabase();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
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
        messages: [],
        settings: {}
      };
      this.saveDatabase();
    }
  }

  // Save database to localStorage
  private saveDatabase(): void {
    if (this.db) {
      try {
        localStorage.setItem(this.DB_KEY, JSON.stringify(this.db));
        console.log('💾 Database saved to localStorage');
      } catch (error) {
        console.error('Failed to save database:', error);
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

  async create<T extends { id: string }>(collection: keyof Database, item: T): Promise<T> {
    const db = await this.ensureLoaded();
    const data = db[collection] as T[];
    
    if (Array.isArray(data)) {
      data.push(item);
      this.saveDatabase();
    }
    
    return item;
  }

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
    data[index] = { ...data[index], ...updates };
    
    console.log('💾 Database: Updated item:', {
      collection,
      id,
      oldStatus: oldItem.status,
      newStatus: data[index].status,
      oldWriterId: oldItem.writerId,
      newWriterId: data[index].writerId
    });
    
    this.saveDatabase();
    
    return data[index];
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
    return db.financial[subCollection] as T[];
  }

  async createFinancial<T extends { id: string }>(
    subCollection: keyof Database['financial'], 
    item: T
  ): Promise<T> {
    const db = await this.ensureLoaded();
    const data = db.financial[subCollection] as T[];
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
    const data = db.financial[subCollection] as T[];
    
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
