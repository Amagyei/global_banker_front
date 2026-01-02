import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Menu, Wallet, User, ShoppingBag, LogOut, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { getWallet, clearSession } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

          {/* Right: Cart, Wallet and Menu */}
          <div className="flex items-center gap-3">
            {/* Cart Icon - only show when items are in cart */}
            <CartButton />
            
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

const CartButton = () => {
  const { items, totalQuantity, subtotal, removeFromCart, clearCart } = useCart();
  const [wallet, setWallet] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

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

  const handleCheckout = async () => {
    if (items.length === 0) {
      uiToast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }
    navigate("/checkout");
  };

  // Only show cart icon when there are items
  if (totalQuantity === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative shadow-lg"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs h-4 min-w-[16px] px-1">
            {totalQuantity}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-popover sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} • {item.price}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <SheetFooter className="mt-6">
          <div className="w-full space-y-3">
            {wallet && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Wallet Balance</span>
                <span className={
                  wallet.balance_minor === 0 
                    ? "text-destructive text-2xl font-bold" 
                    : wallet.balance_minor >= Math.round(subtotal * 100) 
                      ? "text-success font-semibold" 
                      : "text-destructive font-semibold"
                }>
                  {wallet.balance || "$0.00"}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {wallet && wallet.balance_minor < Math.round(subtotal * 100) && (
              <div className="text-xs text-destructive text-center">
                Insufficient balance. Top up required.
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={clearCart} disabled={items.length === 0 || checkoutLoading}>
                Clear
              </Button>
              <Button 
                disabled={items.length === 0 || checkoutLoading || (wallet && wallet.balance_minor < Math.round(subtotal * 100))}
                onClick={handleCheckout}
              >
                {checkoutLoading ? "Processing..." : "Checkout"}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
