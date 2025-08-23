import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Writer, WriterInvite, WriterStats, WriterActivity, WriterFilter } from '../types/user';

interface UsersContextType {
  writers: Writer[];
  writerInvites: WriterInvite[];
  writerActivities: WriterActivity[];
  writerStats: WriterStats;
  createWriter: (writerData: Partial<Writer>) => Writer;
  updateWriter: (writerId: string, updates: Partial<Writer>) => void;
  suspendWriter: (writerId: string, reason: string, suspendedBy: string) => void;
  activateWriter: (writerId: string) => void;
  deleteWriter: (writerId: string) => void;
  inviteWriter: (email: string, phone?: string, message?: string) => WriterInvite;
  getWriterById: (writerId: string) => Writer | undefined;
  filterWriters: (filters: WriterFilter) => Writer[];
  logActivity: (writerId: string, activityType: WriterActivity['activityType'], description: string, metadata?: Record<string, unknown>) => void;
  getWriterActivities: (writerId: string) => WriterActivity[];
  sendWhatsAppMessage: (writerId: string, message: string) => void;
  sendEmailMessage: (writerId: string, subject: string, message: string) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [writers, setWriters] = useState<Writer[]>([
    {
      id: 'writer-1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+254712345678',
      status: 'active',
      role: 'writer',
      specializations: ['Business Administration', 'Marketing', 'Psychology'],
      languages: ['English', 'Swahili'],
      timezone: 'Africa/Nairobi',
      country: 'Kenya',
      rating: 4.8,
      totalReviews: 24,
      completedOrders: 18,
      totalEarnings: 63000,
      successRate: 94.7,
      maxConcurrentOrders: 3,
      preferredPaymentMethod: 'mobile_money',
      paymentDetails: {
        mobileMoneyNumber: '+254712345678'
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastActiveAt: '2024-01-25T10:30:00Z',
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isDocumentVerified: true,
      bio: 'Experienced academic writer specializing in business and psychology papers. Over 3 years of experience in academic writing.',
      documents: [
        {
          type: 'id',
          filename: 'national_id.jpg',
          url: '/documents/john_doe_id.jpg',
          uploadedAt: '2024-01-01T10:00:00Z',
          status: 'approved'
        },
        {
          type: 'certificate',
          filename: 'degree_certificate.pdf',
          url: '/documents/john_doe_degree.pdf',
          uploadedAt: '2024-01-01T10:05:00Z',
          status: 'approved'
        }
      ]
    },
    {
      id: 'writer-2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phone: '+254723456789',
      status: 'active',
      role: 'writer',
      specializations: ['Computer Science', 'Engineering', 'Mathematics'],
      languages: ['English'],
      timezone: 'Africa/Nairobi',
      country: 'Kenya',
      rating: 4.6,
      totalReviews: 15,
      completedOrders: 12,
      totalEarnings: 42000,
      successRate: 91.7,
      maxConcurrentOrders: 2,
      preferredPaymentMethod: 'bank_transfer',
      paymentDetails: {
        bankName: 'KCB Bank',
        accountNumber: '1234567890'
      },
      createdAt: '2024-01-15T00:00:00Z',
      lastActiveAt: '2024-01-24T14:20:00Z',
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isDocumentVerified: true,
      bio: 'Technical writer with expertise in computer science and engineering topics. Strong background in software development and technical documentation.',
      documents: [
        {
          type: 'id',
          filename: 'national_id.jpg',
          url: '/documents/jane_smith_id.jpg',
          uploadedAt: '2024-01-15T10:00:00Z',
          status: 'approved'
        }
      ]
    },
    {
      id: 'writer-3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      phone: '+254734567890',
      status: 'pending',
      role: 'writer',
      specializations: ['Literature', 'History', 'Philosophy'],
      languages: ['English', 'French'],
      timezone: 'Africa/Nairobi',
      country: 'Kenya',
      rating: 0,
      totalReviews: 0,
      completedOrders: 0,
      totalEarnings: 0,
      successRate: 0,
      maxConcurrentOrders: 2,
      createdAt: '2024-01-20T00:00:00Z',
      lastActiveAt: '2024-01-20T09:15:00Z',
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false,
      isEmailVerified: true,
      isPhoneVerified: false,
      isDocumentVerified: false,
      bio: 'New writer specializing in humanities subjects. Master\'s degree in Literature with experience in academic research.',
      documents: [
        {
          type: 'id',
          filename: 'national_id.jpg',
          url: '/documents/mike_johnson_id.jpg',
          uploadedAt: '2024-01-20T10:00:00Z',
          status: 'pending'
        }
      ]
    }
  ]);

  const [writerInvites, setWriterInvites] = useState<WriterInvite[]>([
    {
      id: 'INV-001',
      email: 'sarah.wilson@example.com',
      phone: '+254745678901',
      invitedBy: 'admin-1',
      invitedAt: '2024-01-23T12:00:00Z',
      status: 'sent',
      expiresAt: '2024-01-30T12:00:00Z',
      token: 'inv_token_123',
      personalizedMessage: 'We would love to have you join our team of professional writers!'
    }
  ]);

  const [writerActivities, setWriterActivities] = useState<WriterActivity[]>([
    {
      writerId: 'writer-1',
      writerName: 'John Doe',
      activityType: 'order_submitted',
      description: 'Submitted order ORD-COMPLETED-001',
      timestamp: '2024-01-25T10:30:00Z',
      metadata: { orderId: 'ORD-COMPLETED-001' }
    },
    {
      writerId: 'writer-1',
      writerName: 'John Doe',
      activityType: 'login',
      description: 'Logged into the platform',
      timestamp: '2024-01-25T08:00:00Z'
    },
    {
      writerId: 'writer-2',
      writerName: 'Jane Smith',
      activityType: 'order_picked',
      description: 'Picked up order ORD-TEST-002',
      timestamp: '2024-01-24T14:20:00Z',
      metadata: { orderId: 'ORD-TEST-002' }
    }
  ]);

  const calculateWriterStats = useCallback((): WriterStats => {
    const totalWriters = writers.length;
    const activeWriters = writers.filter(w => w.status === 'active').length;
    const suspendedWriters = writers.filter(w => w.status === 'suspended').length;
    const pendingWriters = writers.filter(w => w.status === 'pending').length;

    const topPerformers = writers.filter(w => w.rating >= 4.5).length;
    const averagePerformers = writers.filter(w => w.rating >= 3.5 && w.rating < 4.5).length;
    const needsImprovement = writers.filter(w => w.rating < 3.5 && w.rating > 0).length;

    // Mock monthly active writers (would be calculated from activity data)
    const monthlyActiveWriters = Math.floor(activeWriters * 0.8);
    const newWritersThisMonth = writers.filter(w => {
      const createdDate = new Date(w.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    const writerRetentionRate = 85; // Mock data

    // Specialization stats
    const specializationCounts = writers.reduce((acc, writer) => {
      writer.specializations.forEach(spec => {
        if (!acc[spec]) {
          acc[spec] = { count: 0, totalRating: 0, totalOrders: 0 };
        }
        acc[spec].count++;
        acc[spec].totalRating += writer.rating;
        acc[spec].totalOrders += writer.completedOrders;
      });
      return acc;
    }, {} as Record<string, { count: number; totalRating: number; totalOrders: number }>);

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

  const createWriter = useCallback((writerData: Partial<Writer>): Writer => {
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

    setWriters(prev => [newWriter, ...prev]);
    return newWriter;
  }, []);

  const updateWriter = useCallback((writerId: string, updates: Partial<Writer>) => {
    setWriters(prev => prev.map(writer => 
      writer.id === writerId 
        ? { ...writer, ...updates }
        : writer
    ));
  }, []);

  const suspendWriter = useCallback((writerId: string, reason: string, suspendedBy: string) => {
    setWriters(prev => prev.map(writer => 
      writer.id === writerId 
        ? { 
            ...writer, 
            status: 'suspended',
            suspendedAt: new Date().toISOString(),
            suspendedBy,
            suspensionReason: reason
          }
        : writer
    ));
  }, []);

  const activateWriter = useCallback((writerId: string) => {
    setWriters(prev => prev.map(writer => 
      writer.id === writerId 
        ? { 
            ...writer, 
            status: 'active',
            suspendedAt: undefined,
            suspendedBy: undefined,
            suspensionReason: undefined
          }
        : writer
    ));
  }, []);

  const deleteWriter = useCallback((writerId: string) => {
    setWriters(prev => prev.filter(writer => writer.id !== writerId));
  }, []);

  const inviteWriter = useCallback((email: string, phone?: string, message?: string): WriterInvite => {
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

    setWriterInvites(prev => [invite, ...prev]);
    return invite;
  }, []);

  const getWriterById = useCallback((writerId: string) => {
    return writers.find(writer => writer.id === writerId);
  }, [writers]);

  const filterWriters = useCallback((filters: WriterFilter) => {
    return writers.filter(writer => {
      if (filters.status && writer.status !== filters.status) return false;
      if (filters.specialization && !writer.specializations.includes(filters.specialization)) return false;
      if (filters.country && writer.country !== filters.country) return false;
      if (filters.ratingRange) {
        if (writer.rating < filters.ratingRange.min || writer.rating > filters.ratingRange.max) return false;
      }
      if (filters.orderCountRange) {
        if (writer.completedOrders < filters.orderCountRange.min || writer.completedOrders > filters.orderCountRange.max) return false;
      }
      if (filters.joinedDateRange) {
        const joinedDate = new Date(writer.createdAt);
        const startDate = new Date(filters.joinedDateRange.start);
        const endDate = new Date(filters.joinedDateRange.end);
        if (joinedDate < startDate || joinedDate > endDate) return false;
      }
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = writer.name.toLowerCase().includes(searchLower);
        const matchesEmail = writer.email.toLowerCase().includes(searchLower);
        const matchesSpecialization = writer.specializations.some(spec => 
          spec.toLowerCase().includes(searchLower)
        );
        if (!matchesName && !matchesEmail && !matchesSpecialization) return false;
      }
      return true;
    });
  }, [writers]);

  const logActivity = useCallback((
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
      metadata
    };

    setWriterActivities(prev => [activity, ...prev.slice(0, 99)]); // Keep last 100 activities
  }, [getWriterById]);

  const getWriterActivities = useCallback((writerId: string) => {
    return writerActivities.filter(activity => activity.writerId === writerId);
  }, [writerActivities]);

  const sendWhatsAppMessage = useCallback((writerId: string, message: string) => {
    const writer = getWriterById(writerId);
    if (!writer || !writer.phone) {
      console.error('Writer not found or phone number missing');
      return;
    }

    // In a real app, this would integrate with WhatsApp Business API
    const whatsappUrl = `https://wa.me/${writer.phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
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

  return (
    <UsersContext.Provider value={{
      writers,
      writerInvites,
      writerActivities,
      writerStats,
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
      sendEmailMessage
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
