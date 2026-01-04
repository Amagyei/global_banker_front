import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { VerificationWarning } from "./components/VerificationWarning";
import { CyberBackground } from "./components/CyberBackground";
import Dashboard from "./pages/Dashboard";
import CountryCards from "./pages/CountryCards";
import Fullz from "./pages/Fullz";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import TopUp from "./pages/TopUp";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import WebhookStatus from "./pages/WebhookStatus";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/lib/auth";

const queryClient = new QueryClient();

const MainContent = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <CyberBackground />
      <Navbar>
        <Sidebar />
        <div className="flex min-h-screen">
          <div className="flex-1 overflow-auto pt-16">
            <VerificationWarning />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/us-banks" element={<CountryCards country="US" />} />
              <Route path="/uk-banks" element={<CountryCards country="UK" />} />
              <Route path="/canada-banks" element={<CountryCards country="Canada" />} />
              <Route path="/fullz" element={<Fullz />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/top-up" element={<TopUp />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/webhook-status" element={<WebhookStatus />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Navbar>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes without navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Main app routes (protected) with navbar */}
            <Route element={<ProtectedRoute /> }>
              <Route path="/*" element={
                <CartProvider>
                  <MainContent />
                </CartProvider>
              } />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
