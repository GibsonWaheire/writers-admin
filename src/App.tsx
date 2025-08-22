
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import WriterDashboard from "./pages/WriterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrdersPage from "./pages/OrdersPage";
import WalletPage from "./pages/WalletPage";
import ReviewsPage from "./pages/ReviewsPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ToastProvider } from "./contexts/ToastContext";
import { OrderProvider } from "./contexts/OrderContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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

// Main App Routes
function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  // If user is authenticated, redirect from home page to appropriate dashboard
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/writer" replace />;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Dashboard Routes (only accessible when authenticated)
function DashboardRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/writer" element={
          <ProtectedRoute requiredRole="writer">
            <WriterDashboard />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        <Route path="/reviews" element={
          <ProtectedRoute>
            <ReviewsPage />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Messages</h1>
              <p>Messages functionality coming soon...</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/invoices" element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Invoices</h1>
              <p>Invoices functionality coming soon...</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <OrderProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                {/* Public route - only accessible when NOT authenticated */}
                <Route path="/" element={<AppRoutes />} />
                
                {/* Protected routes - only accessible when authenticated */}
                <Route path="/*" element={<DashboardRoutes />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </OrderProvider>
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

