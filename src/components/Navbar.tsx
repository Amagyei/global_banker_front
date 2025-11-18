import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Menu, Wallet, User, ShoppingBag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWallet, clearSession } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarContext } from "./Sidebar";

export const Navbar = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const walletData = await getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error("Failed to load wallet:", error);
    }
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {/* Horizontal Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Left: Bank Pro Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Bank Pro</span>
          </Link>

          {/* Right: Wallet and Menu */}
          <div className="flex items-center gap-3">
            {/* Wallet Balance */}
            <WalletButton wallet={wallet} />
            
            {/* Burger Menu Icon */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Sidebar and main content */}
      {children}
    </SidebarContext.Provider>
  );
};

const WalletButton = ({ wallet }: { wallet: any }) => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 font-semibold shadow-lg",
            wallet && wallet.balance_minor === 0
              ? "border-destructive bg-destructive/10 hover:bg-destructive/20"
              : "border-success bg-success/10 hover:bg-success/20"
          )}
        >
          <Wallet className="h-4 w-4" />
          <span
            className={cn(
              wallet && wallet.balance_minor === 0
                ? "text-destructive text-xl font-bold"
                : "text-success"
            )}
          >
            {wallet?.balance || "$0.00"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/top-up" className="flex items-center gap-2 cursor-pointer">
            <Wallet className="h-4 w-4" />
            Top Up
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer"
          onClick={() => {
            clearSession();
            clearCart();
            toast.success("Logged out successfully");
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
