import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useOrders } from './OrderContext';
import { usePOD } from './PODContext';

export interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'refund' | 'pod_earning';
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  orderId?: string;
  podOrderId?: string;
  paymentMethod?: string;
  orderType: 'regular' | 'pod';
}

export interface WalletData {
  availableBalance: number;
  pendingEarnings: number;
  totalEarned: number;
  totalWithdrawn: number;
  regularOrderEarnings: number;
  podOrderEarnings: number;
  transactions: Transaction[];
}

interface WalletContextType {
  wallet: WalletData;
  addEarning: (orderId: string, amount: number, description: string, orderType: 'regular' | 'pod') => void;
  applyFine: (orderId: string, amount: number, reason: string, fineType: 'late' | 'rejection' | 'auto-reassignment') => void;
  requestWithdrawal: (amount: number, paymentMethod: string) => void;
  getMonthlyEarnings: (month?: number, year?: number) => number;
  getPendingOrdersCount: () => number;
  getPendingEarnings: () => number;
  getEarningsBreakdown: () => { regular: number; pod: number; total: number };
  getWithdrawalTransactions: () => Transaction[];
  getTotalWithdrawn: () => number;
  getPendingWithdrawals: () => Transaction[];
  syncWithOrders: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletData>({
    availableBalance: 0,
    pendingEarnings: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    regularOrderEarnings: 0,
    podOrderEarnings: 0,
    transactions: []
  });

  const { orders } = useOrders();
  const { podOrders } = usePOD();
  
  // Use ref to track previous state to avoid infinite loops
  const prevWalletRef = useRef<WalletData>(wallet);

  // Sync wallet with actual orders and POD orders
  const syncWithOrders = useCallback(() => {
    let regularEarnings = 0;
    let podEarnings = 0;
    let pendingEarnings = 0;
    const newTransactions: Transaction[] = [];

    // Calculate earnings from regular orders
    orders.forEach(order => {
      if (order.writerId && order.writerId === 'writer-1') { // Only for current writer
        if (order.status === 'Completed') {
          const orderAmount = order.pages * 350; // 350 KES per page
          regularEarnings += orderAmount;
          
          // Add transaction for completed orders (admin approved)
          newTransactions.push({
            id: `TXN-${order.id}`,
            type: 'earning',
            description: `Order ${order.id} - ${order.title}`,
            amount: orderAmount,
            date: order.completedAt ? order.completedAt.split('T')[0] : order.updatedAt.split('T')[0],
            status: 'completed',
            orderId: order.id,
            orderType: 'regular'
          });
        } else if (order.status === 'Submitted') {
          // Orders submitted but not yet approved are pending
          const orderAmount = order.pages * 350;
          pendingEarnings += orderAmount;
        }
      }
    });

    // Calculate earnings from POD orders
    if (podOrders && Array.isArray(podOrders)) {
      podOrders.forEach(podOrder => {
      if (podOrder.writerId && podOrder.status === 'Payment Received') {
        const podAmount = podOrder.podAmount;
        podEarnings += podAmount;
        
        newTransactions.push({
          id: `TXN-POD-${podOrder.id}`,
          type: 'pod_earning',
          description: `POD Order ${podOrder.id} - ${podOrder.title}`,
          amount: podAmount,
          date: podOrder.paymentReceivedAt || podOrder.updatedAt.split('T')[0],
          status: 'completed',
          podOrderId: podOrder.id,
          orderType: 'pod'
        });
      } else if (podOrder.writerId && ['Delivered', 'Ready for Delivery'].includes(podOrder.status)) {
        pendingEarnings += podOrder.podAmount;
      }
    });
    }

    // Preserve existing transactions (withdrawals, etc.) and merge with new earnings
    const existingTransactions = prevWalletRef.current.transactions.filter(tx => 
      tx.type === 'withdrawal' || tx.type === 'refund'
    );
    
    // Merge existing transactions with new earnings transactions
    const allTransactions = [...existingTransactions, ...newTransactions];

    // Calculate total available balance
    const totalEarned = regularEarnings + podEarnings;
    const availableBalance = totalEarned - prevWalletRef.current.totalWithdrawn;

    setWallet(prev => {
      const newWallet = {
        ...prev,
        availableBalance,
        pendingEarnings,
        totalEarned,
        regularOrderEarnings: regularEarnings,
        podOrderEarnings: podEarnings,
        transactions: allTransactions
      };
      
      // Update the ref with the new state
      prevWalletRef.current = newWallet;
      return newWallet;
    });
  }, [orders, podOrders]);

  // Sync wallet when orders or POD orders change
  useEffect(() => {
    syncWithOrders();
  }, [syncWithOrders]);

  const addEarning = useCallback((orderId: string, amount: number, description: string, orderType: 'regular' | 'pod') => {
    const newTransaction: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: orderType === 'pod' ? 'pod_earning' : 'earning',
      description,
      amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      orderId: orderType === 'regular' ? orderId : undefined,
      podOrderId: orderType === 'pod' ? orderId : undefined,
      orderType
    };

    setWallet(prev => ({
      ...prev,
      availableBalance: prev.availableBalance + amount,
      totalEarned: prev.totalEarned + amount,
      transactions: [newTransaction, ...prev.transactions]
    }));
  }, []);

  const applyFine = useCallback((orderId: string, amount: number, reason: string, fineType: 'late' | 'rejection' | 'auto-reassignment') => {
    const newTransaction: Transaction = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      type: 'refund', // Using refund type for fines (negative amount)
      description: `Fine (${fineType}): ${reason}`,
      amount: -amount, // Negative amount for fines
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      orderId,
      orderType: 'regular'
    };

    setWallet(prev => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - amount), // Ensure balance doesn't go negative
      totalEarned: prev.totalEarned, // Fines don't affect total earned
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
      paymentMethod,
      orderType: 'regular'
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
        if (tx.type !== 'earning' && tx.type !== 'pod_earning') return false;
        const txDate = new Date(tx.date);
        return txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [wallet.transactions]);

  const getPendingOrdersCount = useCallback(() => {
    const pendingRegular = orders && Array.isArray(orders) ? orders.filter(order => 
      order.writerId && order.status === 'Approved'
    ).length : 0;
    
    const pendingPOD = podOrders && Array.isArray(podOrders) ? podOrders.filter(podOrder => 
      podOrder.writerId && ['Delivered', 'Ready for Delivery'].includes(podOrder.status)
    ).length : 0;
    
    return pendingRegular + pendingPOD;
  }, [orders, podOrders]);

  const getPendingEarnings = useCallback(() => {
    let pending = 0;
    
    // Regular orders pending payment
    if (orders && Array.isArray(orders)) {
      orders.forEach(order => {
        if (order.writerId && order.status === 'Approved') {
          pending += order.pages * 350;
        }
      });
    }
    
    // POD orders pending payment
    if (podOrders && Array.isArray(podOrders)) {
      podOrders.forEach(podOrder => {
        if (podOrder.writerId && ['Delivered', 'Ready for Delivery'].includes(podOrder.status)) {
          pending += podOrder.podAmount;
        }
      });
    }
    
    return pending;
  }, [orders, podOrders]);

  const getEarningsBreakdown = useCallback(() => {
    return {
      regular: wallet.regularOrderEarnings,
      pod: wallet.podOrderEarnings,
      total: wallet.totalEarned
    };
  }, [wallet.regularOrderEarnings, wallet.podOrderEarnings, wallet.totalEarned]);

  const getWithdrawalTransactions = useCallback(() => {
    return wallet.transactions.filter(tx => tx.type === 'withdrawal');
  }, [wallet.transactions]);

  const getTotalWithdrawn = useCallback(() => {
    return wallet.transactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [wallet.transactions]);

  const getPendingWithdrawals = useCallback(() => {
    return wallet.transactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'pending');
  }, [wallet.transactions]);

  return (
    <WalletContext.Provider value={{
      wallet,
      addEarning,
      applyFine,
      requestWithdrawal,
      getMonthlyEarnings,
      getPendingOrdersCount,
      getPendingEarnings,
      getEarningsBreakdown,
      getWithdrawalTransactions,
      getTotalWithdrawn,
      getPendingWithdrawals,
      syncWithOrders
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
