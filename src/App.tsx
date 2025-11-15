import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { VerificationWarning } from "./components/VerificationWarning";
import Dashboard from "./pages/Dashboard";
import CountryCards from "./pages/CountryCards";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import TopUp from "./pages/TopUp";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { CartProvider } from "@/context/CartContext";
import { ProtectedRoute } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes without navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Main app routes (protected) with navbar */}
          <Route element={<ProtectedRoute /> }>
            <Route path="/*" element={
              <CartProvider>
                <div className="min-h-screen bg-background">
                  <Navbar />
                  <VerificationWarning />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/us-banks" element={<CountryCards country="US" />} />
                    <Route path="/uk-banks" element={<CountryCards country="UK" />} />
                    <Route path="/canada-banks" element={<CountryCards country="Canada" />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/top-up" element={<TopUp />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </CartProvider>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
