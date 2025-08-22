import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'refund';
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  orderId?: string;
  paymentMethod?: string;
}

export interface WalletData {
  availableBalance: number;
  pendingEarnings: number;
  totalEarned: number;
  totalWithdrawn: number;
  transactions: Transaction[];
}

interface WalletContextType {
  wallet: WalletData;
  addEarning: (orderId: string, amount: number, description: string) => void;
  requestWithdrawal: (amount: number, paymentMethod: string) => void;
  getMonthlyEarnings: (month?: number, year?: number) => number;
  getPendingOrdersCount: () => number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletData>({
    availableBalance: 1247.50,
    pendingEarnings: 380.00,
    totalEarned: 5890.75,
    totalWithdrawn: 4643.25,
    transactions: [
      {
        id: "TXN-001",
        type: "earning",
        description: "Order ORD-045 - Research Paper",
        amount: 450.00,
        date: "2024-01-20",
        status: "completed",
        orderId: "ORD-045"
      },
      {
        id: "TXN-002",
        type: "withdrawal",
        description: "Bank Transfer to ****1234",
        amount: -800.00,
        date: "2024-01-18",
        status: "completed",
        paymentMethod: "Bank Transfer"
      },
      {
        id: "TXN-003",
        type: "earning",
        description: "Order ORD-044 - Marketing Analysis",
        amount: 280.00,
        date: "2024-01-15",
        status: "completed",
        orderId: "ORD-044"
      },
      {
        id: "TXN-004",
        type: "earning",
        description: "Order ORD-043 - Literature Review",
        amount: 360.00,
        date: "2024-01-12",
        status: "completed",
        orderId: "ORD-043"
      },
      {
        id: "TXN-005",
        type: "withdrawal",
        description: "PayPal Transfer",
        amount: -500.00,
        date: "2024-01-10",
        status: "completed",
        paymentMethod: "PayPal"
      }
    ]
  });

  const addEarning = useCallback((orderId: string, amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: 'earning',
      description,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      orderId
    };

    setWallet(prev => ({
      ...prev,
      availableBalance: prev.availableBalance + amount,
      totalEarned: prev.totalEarned + amount,
      transactions: [newTransaction, ...prev.transactions]
    }));
  }, []);

  const requestWithdrawal = useCallback((amount: number, paymentMethod: string) => {
    if (amount > wallet.availableBalance) {
      throw new Error('Insufficient balance');
    }

    const newTransaction: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: 'withdrawal',
      description: `${paymentMethod} Withdrawal`,
      amount: -amount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      paymentMethod
    };

    setWallet(prev => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      totalWithdrawn: prev.totalWithdrawn + amount,
      transactions: [newTransaction, ...prev.transactions]
    }));
  }, [wallet.availableBalance]);

  const getMonthlyEarnings = useCallback((month?: number, year?: number) => {
    const targetMonth = month ?? new Date().getMonth();
    const targetYear = year ?? new Date().getFullYear();
    
    return wallet.transactions
      .filter(tx => {
        if (tx.type !== 'earning') return false;
        const txDate = new Date(tx.date);
        return txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [wallet.transactions]);

  const getPendingOrdersCount = useCallback(() => {
    // This would typically come from OrderContext
    // For now, return a mock value
    return 3;
  }, []);

  return (
    <WalletContext.Provider value={{
      wallet,
      addEarning,
      requestWithdrawal,
      getMonthlyEarnings,
      getPendingOrdersCount
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
