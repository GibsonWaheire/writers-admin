import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Writer, WriterInvite, WriterStats, WriterActivity, WriterFilter } from '../types/user';
import { db } from '../services/database';

interface UsersContextType {
  writers: Writer[];
  writerInvites: WriterInvite[];
  writerActivities: WriterActivity[];
  writerStats: WriterStats;
  isLoading: boolean;
  createWriter: (writerData: Partial<Writer>) => Promise<Writer>;
  updateWriter: (writerId: string, updates: Partial<Writer>) => Promise<void>;
  suspendWriter: (writerId: string, reason: string, suspendedBy: string) => Promise<void>;
  activateWriter: (writerId: string) => Promise<void>;
  deleteWriter: (writerId: string) => Promise<void>;
  inviteWriter: (email: string, phone?: string, message?: string) => Promise<WriterInvite>;
  getWriterById: (writerId: string) => Writer | undefined;
  filterWriters: (filters: WriterFilter) => Writer[];
  logActivity: (writerId: string, activityType: WriterActivity['activityType'], description: string, metadata?: Record<string, unknown>) => Promise<void>;
  getWriterActivities: (writerId: string) => WriterActivity[];
  sendWhatsAppMessage: (writerId: string, message: string) => void;
  sendEmailMessage: (writerId: string, subject: string, message: string) => void;
  // New approval functions
  approveWriterApplication: (writerId: string, reviewedBy: string, notes?: string) => Promise<void>;
  rejectWriterApplication: (writerId: string, reason: string, reviewedBy: string, notes?: string) => Promise<void>;
  submitWriterApplication: (userId: string, applicationData: Partial<Writer>) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [writerInvites, setWriterInvites] = useState<WriterInvite[]>([]);
  const [writerActivities, setWriterActivities] = useState<WriterActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [writersData, invitesData, activitiesData] = await Promise.all([
          db.find<Writer>('writers'),
          db.find<WriterInvite>('writerInvites'),
          db.find<WriterActivity>('writerActivities')
        ]);

        setWriters(writersData);
        setWriterInvites(invitesData);
        setWriterActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateWriterStats = useCallback((): WriterStats => {
    const totalWriters = writers.length;
    const activeWriters = writers.filter(w => w.status === 'active').length;
    const suspendedWriters = writers.filter(w => w.status === 'suspended').length;
    const pendingWriters = writers.filter(w => w.status === 'pending' || w.status === 'application_submitted').length;
    
    // Performance distribution
    const topPerformers = writers.filter(w => w.rating >= 4.5).length;
    const averagePerformers = writers.filter(w => w.rating >= 3.5 && w.rating < 4.5).length;
    const needsImprovement = writers.filter(w => w.rating > 0 && w.rating < 3.5).length;
    
    // Activity metrics
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyActiveWriters = writers.filter(writer => {
      if (!writer.lastActiveAt) return false;
      const lastActive = new Date(writer.lastActiveAt);
      return lastActive.getMonth() === currentMonth && lastActive.getFullYear() === currentYear;
    }).length;
    
    const newWritersThisMonth = writers.filter(writer => {
      const created = new Date(writer.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;
    
    // Calculate retention rate (simplified)
    const writerRetentionRate = totalWriters > 0 ? (monthlyActiveWriters / totalWriters) * 100 : 0;
    
    // Specialization stats
    const specializationCounts: Record<string, { count: number; totalRating: number; totalOrders: number }> = {};
    writers.forEach(writer => {
      writer.specializations.forEach(spec => {
        if (!specializationCounts[spec]) {
          specializationCounts[spec] = { count: 0, totalRating: 0, totalOrders: 0 };
        }
        specializationCounts[spec].count++;
        specializationCounts[spec].totalRating += writer.rating;
        specializationCounts[spec].totalOrders += writer.completedOrders;
      });
    });

    const specializationStats = Object.entries(specializationCounts).map(([discipline, data]) => ({
      discipline,
      writerCount: data.count,
      averageRating: data.count > 0 ? data.totalRating / data.count : 0,
      totalOrders: data.totalOrders
    }));

    // Country stats
    const countryCounts = writers.reduce((acc, writer) => {
      if (!acc[writer.country]) {
        acc[writer.country] = { count: 0, totalRating: 0 };
      }
      acc[writer.country].count++;
      acc[writer.country].totalRating += writer.rating;
      return acc;
    }, {} as Record<string, { count: number; totalRating: number }>);

    const countryStats = Object.entries(countryCounts).map(([country, data]) => ({
      country,
      writerCount: data.count,
      averageRating: data.count > 0 ? data.totalRating / data.count : 0
    }));

    return {
      totalWriters,
      activeWriters,
      suspendedWriters,
      pendingWriters,
      topPerformers,
      averagePerformers,
      needsImprovement,
      monthlyActiveWriters,
      newWritersThisMonth,
      writerRetentionRate,
      specializationStats,
      countryStats
    };
  }, [writers]);

  const writerStats = calculateWriterStats();

  const createWriter = useCallback(async (writerData: Partial<Writer>): Promise<Writer> => {
    const newWriter: Writer = {
      id: `writer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: writerData.email || '',
      name: writerData.name || '',
      phone: writerData.phone,
      status: 'pending',
      role: 'writer',
      specializations: writerData.specializations || [],
      languages: writerData.languages || ['English'],
      timezone: writerData.timezone || 'Africa/Nairobi',
      country: writerData.country || 'Kenya',
      rating: 0,
      totalReviews: 0,
      completedOrders: 0,
      totalEarnings: 0,
      successRate: 0,
      maxConcurrentOrders: 2,
      createdAt: new Date().toISOString(),
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false,
      isEmailVerified: false,
      isPhoneVerified: false,
      isDocumentVerified: false,
      ...writerData
    };

    const savedWriter = await db.create('writers', newWriter);
    setWriters(prev => [savedWriter, ...prev]);
    return savedWriter;
  }, []);

  const updateWriter = useCallback(async (writerId: string, updates: Partial<Writer>) => {
    const updatedWriter = await db.update('writers', writerId, updates);
    if (updatedWriter) {
      setWriters(prev => prev.map(writer => 
        writer.id === writerId ? updatedWriter : writer
      ));
    }
  }, []);

  const suspendWriter = useCallback(async (writerId: string, reason: string, suspendedBy: string) => {
    const updates = {
      status: 'suspended' as const,
      suspendedAt: new Date().toISOString(),
      suspendedBy,
      suspensionReason: reason
    };
    
    await updateWriter(writerId, updates);
  }, [updateWriter]);

  const activateWriter = useCallback(async (writerId: string) => {
    const updates = {
      status: 'active' as const,
      suspendedAt: undefined,
      suspendedBy: undefined,
      suspensionReason: undefined
    };
    
    await updateWriter(writerId, updates);
  }, [updateWriter]);

  const deleteWriter = useCallback(async (writerId: string) => {
    const success = await db.delete('writers', writerId);
    if (success) {
      setWriters(prev => prev.filter(writer => writer.id !== writerId));
    }
  }, []);

  const inviteWriter = useCallback(async (email: string, phone?: string, message?: string): Promise<WriterInvite> => {
    const invite: WriterInvite = {
      id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      phone,
      invitedBy: 'admin-1', // Mock admin ID
      invitedAt: new Date().toISOString(),
      status: 'sent',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      token: `inv_${Math.random().toString(36).substr(2, 20)}`,
      personalizedMessage: message
    };

    const savedInvite = await db.create('writerInvites', invite);
    setWriterInvites(prev => [savedInvite, ...prev]);
    return savedInvite;
  }, []);

  const getWriterById = useCallback((writerId: string) => {
    return writers.find(writer => writer.id === writerId);
  }, [writers]);

  const filterWriters = useCallback((filters: WriterFilter): Writer[] => {
    let filtered = [...writers];

    if (filters.status) {
      filtered = filtered.filter(writer => writer.status === filters.status);
    }

    if (filters.specialization) {
      filtered = filtered.filter(writer => 
        writer.specializations.includes(filters.specialization!)
      );
    }

    if (filters.country) {
      filtered = filtered.filter(writer => writer.country === filters.country);
    }

    if (filters.ratingRange) {
      filtered = filtered.filter(writer => 
        writer.rating >= filters.ratingRange!.min && 
        writer.rating <= filters.ratingRange!.max
      );
    }

    if (filters.orderCountRange) {
      filtered = filtered.filter(writer => 
        writer.completedOrders >= filters.orderCountRange!.min && 
        writer.completedOrders <= filters.orderCountRange!.max
      );
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(writer =>
        writer.name.toLowerCase().includes(searchLower) ||
        writer.email.toLowerCase().includes(searchLower) ||
        writer.specializations.some(spec => spec.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'orders':
            aValue = a.completedOrders;
            bValue = b.completedOrders;
            break;
          case 'earnings':
            aValue = a.totalEarnings;
            bValue = b.totalEarnings;
            break;
          case 'joinDate':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return filtered;
  }, [writers]);

  const logActivity = useCallback(async (
    writerId: string, 
    activityType: WriterActivity['activityType'], 
    description: string, 
    metadata?: Record<string, unknown>
  ) => {
    const writer = getWriterById(writerId);
    if (!writer) return;

    const activity: WriterActivity = {
      writerId,
      writerName: writer.name,
      activityType,
      description,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    await db.create('writerActivities', activity);
    setWriterActivities(prev => [activity, ...prev]);
  }, [getWriterById]);

  const getWriterActivities = useCallback((writerId: string) => {
    return writerActivities.filter(activity => activity.writerId === writerId);
  }, [writerActivities]);

  const sendWhatsAppMessage = useCallback((writerId: string, message: string) => {
    const writer = getWriterById(writerId);
    if (!writer || !writer.phone) {
      console.error('Writer not found or no phone number');
      return;
    }

    // Format phone number for WhatsApp
    const phoneNumber = writer.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    logActivity(writerId, 'profile_updated', 'Admin sent WhatsApp message', { message });
  }, [getWriterById, logActivity]);

  const sendEmailMessage = useCallback((writerId: string, subject: string, message: string) => {
    const writer = getWriterById(writerId);
    if (!writer) {
      console.error('Writer not found');
      return;
    }

    // In a real app, this would send an actual email
    console.log('Sending email to:', writer.email, { subject, message });
    
    logActivity(writerId, 'profile_updated', 'Admin sent email message', { subject, message });
  }, [getWriterById, logActivity]);

  // New approval functions
  const approveWriterApplication = useCallback(async (writerId: string, reviewedBy: string, notes?: string) => {
    const updates = {
      status: 'active' as const,
      applicationReviewedAt: new Date().toISOString(),
      applicationReviewedBy: reviewedBy,
      applicationNotes: notes
    };
    
    await updateWriter(writerId, updates);
    await logActivity(writerId, 'profile_updated', 'Writer application approved', 
      { reviewedBy, notes });
  }, [updateWriter, logActivity]);

  const rejectWriterApplication = useCallback(async (writerId: string, reason: string, reviewedBy: string, notes?: string) => {
    const updates = {
      status: 'rejected' as const,
      rejectionReason: reason,
      applicationReviewedAt: new Date().toISOString(),
      applicationReviewedBy: reviewedBy,
      applicationNotes: notes
    };
    
    await updateWriter(writerId, updates);
    await logActivity(writerId, 'profile_updated', `Writer application rejected: ${reason}`, 
      { reviewedBy, reason, notes });
  }, [updateWriter, logActivity]);

  const submitWriterApplication = useCallback(async (userId: string, applicationData: Partial<Writer>) => {
    // Check if writer already exists (from signup)
    const existingWriter = writers.find(w => w.email === applicationData.email);
    
    if (existingWriter) {
      // Update existing writer with application data
      const updates = {
        ...applicationData,
        status: 'application_submitted' as const,
        applicationSubmittedAt: new Date().toISOString()
      };
      
      await updateWriter(existingWriter.id, updates);
      await logActivity(existingWriter.id, 'profile_updated', 'Writer application submitted', 
        { applicationData });
    } else {
      // Create new writer with application data
      const newWriter = await createWriter({
        ...applicationData,
        status: 'application_submitted',
        applicationSubmittedAt: new Date().toISOString()
      });
      
      await logActivity(newWriter.id, 'profile_updated', 'New writer application submitted', 
        { applicationData });
    }
  }, [writers, createWriter, updateWriter, logActivity]);

  return (
    <UsersContext.Provider value={{
      writers,
      writerInvites,
      writerActivities,
      writerStats,
      isLoading,
      createWriter,
      updateWriter,
      suspendWriter,
      activateWriter,
      deleteWriter,
      inviteWriter,
      getWriterById,
      filterWriters,
      logActivity,
      getWriterActivities,
      sendWhatsAppMessage,
      sendEmailMessage,
      approveWriterApplication,
      rejectWriterApplication,
      submitWriterApplication
    }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
