
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import WriterDashboard from "./pages/WriterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AllOrdersPage from "./pages/admin/AllOrdersPage";
import PendingReviewPage from "./pages/admin/PendingReviewPage";
import AssignmentCenterPage from "./pages/admin/AssignmentCenterPage";
import WriterMonitorPage from "./pages/admin/WriterMonitorPage";
import OrderAnalyticsPage from "./pages/admin/OrderAnalyticsPage";
import AdminWritersPage from "./pages/AdminWritersPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminFinancialPage from "./pages/AdminFinancialPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminPODOrdersPage from "./pages/admin/AdminPODOrdersPage";
import AvailableOrdersPage from "./pages/writer/AvailableOrdersPage";
import AssignedOrdersPage from "./pages/writer/AssignedOrdersPage";
import RevisionsPage from "./pages/writer/RevisionsPage";
import CompletedOrdersPage from "./pages/writer/CompletedOrdersPage";
import RejectedOrdersPage from "./pages/writer/RejectedOrdersPage";
import PODOrdersPage from "./pages/PODOrdersPage";
import InvoicesPage from "./pages/InvoicesPage";
import WalletPage from "./pages/WalletPage";
import ReviewsPage from "./pages/ReviewsPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ToastProvider } from "./contexts/ToastContext";
import { OrderProvider } from "./contexts/OrderContext";
import { PODProvider } from "./contexts/PODContext";
import { WalletProvider } from "./contexts/WalletContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MessagesProvider } from './contexts/MessagesContext';
import { InvoicesProvider } from './contexts/InvoicesContext';
import { ReviewsProvider } from './contexts/ReviewsContext';
import { FinancialProvider } from './contexts/FinancialContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { UsersProvider } from './contexts/UsersContext';
import { NotificationProvider as AppNotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import MessagesPage from './pages/MessagesPage';

const queryClient = new QueryClient();  

// Protected Route Component
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'writer' | 'admin' }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/writer" replace />;
    }
  }

  return <>{children}</>;
}



// Main App Router
function AppRouter() {
  const { isAuthenticated, user, isInitialized } = useAuth();

  // Show loading state while initializing authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // If user is authenticated, show dashboard routes
  return (
    <Routes>
      <Route path="/" element={
        user?.role === 'admin' ? 
          <Navigate to="/admin" replace /> : 
          <Navigate to="/writer" replace />
      } />
      <Route path="/writer" element={
        <ProtectedRoute requiredRole="writer">
          <Layout>
            <WriterDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={<Navigate to="/orders/available" replace />} />
      <Route path="/orders/available" element={
        <ProtectedRoute>
          <Layout>
            <AvailableOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders/assigned" element={
        <ProtectedRoute>
          <Layout>
            <AssignedOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders/revisions" element={
        <ProtectedRoute>
          <Layout>
            <RevisionsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders/completed" element={
        <ProtectedRoute>
          <Layout>
            <CompletedOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders/rejected" element={
        <ProtectedRoute>
          <Layout>
            <RejectedOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/pod-orders" element={
        <ProtectedRoute>
          <Layout>
            <PODOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={<Navigate to="/orders/assigned" replace />} />
      <Route path="/wallet" element={
        <ProtectedRoute>
          <Layout>
            <WalletPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reviews" element={
        <ProtectedRoute>
          <Layout>
            <ReviewsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Layout>
            <MessagesPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Layout>
            <InvoicesPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/all" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AllOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/review" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <PendingReviewPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/assign" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AssignmentCenterPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/writers" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <WriterMonitorPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/analytics" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <OrderAnalyticsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/writers" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminWritersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reviews" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminReviewsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/financial" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminFinancialPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminUsersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminAnalyticsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/pod-orders" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminPODOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <OrderProvider>
          <PODProvider>
            <WalletProvider>
              <ReviewsProvider>
                <FinancialProvider>
                  <UsersProvider>
                    <AnalyticsProvider>
                      <MessagesProvider>
                        <InvoicesProvider>
                          <AppNotificationProvider>
                            <SettingsProvider>
                              <TooltipProvider>
                                <BrowserRouter>
                                  <AppRouter />
                                </BrowserRouter>
                              </TooltipProvider>
                            </SettingsProvider>
                          </AppNotificationProvider>
                        </InvoicesProvider>
                      </MessagesProvider>
                    </AnalyticsProvider>
                  </UsersProvider>
                </FinancialProvider>
              </ReviewsProvider>
            </WalletProvider>
          </PODProvider>
        </OrderProvider>
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

