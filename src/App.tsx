
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <OrderProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/writer" element={<WriterDashboard />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/my-orders" element={<OrdersPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/messages" element={<div className="p-6"><h1 className="text-2xl font-bold">Messages</h1><p>Messages functionality coming soon...</p></div>} />
                <Route path="/invoices" element={<div className="p-6"><h1 className="text-2xl font-bold">Invoices</h1><p>Invoices functionality coming soon...</p></div>} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </OrderProvider>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;

