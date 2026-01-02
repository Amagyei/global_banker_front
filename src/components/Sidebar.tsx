import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CreditCard, User, ShoppingBag, Wallet, LogOut, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button as UIButton } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getWallet, getCart, createOrder, clearSession } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { createContext, useContext } from "react";

// Context for sidebar state
export const SidebarContext = createContext<{ sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void } | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarContext.Provider");
  }
  return context;
};

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, totalQuantity, subtotal, removeFromCart, clearCart } = useCart();
  const [wallet, setWallet] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast: uiToast } = useToast();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

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

    // Redirect to checkout page where user can choose payment method
    navigate("/checkout");
  };
  
  const navLinks = [
    { name: "Dashboard", path: "/", icon: CreditCard },
    { name: "US Banks", path: "/us-banks", icon: ShoppingBag },
    { name: "UK Banks", path: "/uk-banks", icon: ShoppingBag },
    { name: "Canada Banks", path: "/canada-banks", icon: ShoppingBag },
    { name: "Fullz", path: "/fullz", icon: ShoppingBag },
    { name: "Orders", path: "/orders", icon: ShoppingBag },
    { name: "Transactions", path: "/transactions", icon: Wallet },
  ];

  return (
    <>
      {/* Backdrop overlay when sidebar is open - mimics Sheet overlay */}
      {sidebarOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/80 transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Vertical Sidebar - Overlay */}
      {sidebarOpen && (
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300 flex flex-col shadow-lg"
          )}
        >
          {/* Sidebar Header */}
          <div 
            className="flex h-16 items-center border-b border-border px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to="/" className="flex items-center justify-center w-full">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav 
            className="flex-1 overflow-y-auto p-4 space-y-2 md:space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-all gap-4 px-4 py-3 md:gap-5 md:px-5 md:py-4",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "shrink-0 h-5 w-5 md:h-6 md:w-6"
                  )} />
                  <span className="flex-1">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Wallet Balance & Account Section */}
          <div 
            className="border-t border-border p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wallet Balance */}
            <div className={cn(
              "flex items-center rounded-lg gap-4 px-4 py-3 md:gap-5 md:px-5 md:py-4",
              wallet && wallet.balance_minor === 0 
                ? "bg-destructive/10 text-destructive" 
                : "bg-muted"
            )}>
              <Wallet className={cn(
                "shrink-0 h-5 w-5 md:h-6 md:w-6"
              )} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className={cn(
                  "font-semibold truncate",
                  wallet && wallet.balance_minor === 0 ? "text-destructive text-lg" : "text-success"
                )}>
                  {wallet?.balance || "$0.00"}
                </div>
              </div>
            </div>

            {/* Shopping Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 px-4 py-3 md:gap-5 md:px-5 md:py-4"
                >
                  <div className="relative flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                    {totalQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs h-4 min-w-[16px] px-1">
                        {totalQuantity}
                      </span>
                    )}
                  </div>
                  <span>Cart ({totalQuantity})</span>
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
                          <UIButton variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </UIButton>
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
                      <UIButton variant="outline" onClick={clearCart} disabled={items.length === 0 || checkoutLoading}>
                        Clear
                      </UIButton>
                      <UIButton 
                        disabled={items.length === 0 || checkoutLoading || (wallet && wallet.balance_minor < Math.round(subtotal * 100))}
                        onClick={handleCheckout}
                      >
                        {checkoutLoading ? "Processing..." : "Checkout"}
                      </UIButton>
                    </div>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 px-4 py-3 md:gap-5 md:px-5 md:py-4"
                >
                  <User className="shrink-0 h-5 w-5 md:h-6 md:w-6" />
                  <span>Account</span>
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
          </div>
        </aside>
      )}
    </>
  );
};

