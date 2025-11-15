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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getWallet, getCart, createOrder, clearSession } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, totalQuantity, subtotal, removeFromCart, clearCart } = useCart();
  const [wallet, setWallet] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
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

    // Check wallet balance
    const walletBalance = wallet?.balance_minor || 0;
    const totalCents = Math.round(subtotal * 100);

    if (walletBalance < totalCents) {
      uiToast({
        title: "Insufficient Balance",
        description: `You need $${((totalCents - walletBalance) / 100).toFixed(2)} more. Please top up your wallet.`,
        variant: "destructive",
      });
      navigate("/top-up");
      return;
    }

    // Sync frontend cart items to backend
    try {
      setCheckoutLoading(true);
      
      // Sync items to backend cart
      const { addToCart } = await import("@/lib/api");
      for (const item of items) {
        try {
          await addToCart(item.id, item.quantity);
        } catch (error) {
          // Item might already be in cart, continue
          console.log("Item sync:", error);
        }
      }
      
      // Create order with recipient info (using user's email as default)
      const recipient = {
        name: "Customer", // Could get from profile
        email: "customer@example.com", // Could get from user profile
      };

      const order = await createOrder(recipient);
      
      toast.success("Order placed successfully!", {
        description: `Order ${order.order_number} has been created`,
      });
      
      clearCart();
      loadWallet(); // Refresh wallet balance
      navigate("/orders");
    } catch (error: any) {
      console.error("Failed to create order:", error);
      const errorMsg = error.response?.data;
      
      if (errorMsg?.detail === "Insufficient wallet balance" || errorMsg?.detail?.includes("Insufficient")) {
        uiToast({
          title: "Insufficient Balance",
          description: `You need $${errorMsg.shortfall?.toFixed(2) || "more"} more. Please top up your wallet.`,
          variant: "destructive",
        });
        navigate("/top-up");
      } else {
        uiToast({
          title: "Error",
          description: errorMsg?.detail || "Failed to create order",
          variant: "destructive",
        });
      }
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "US Banks", path: "/us-banks" },
    { name: "UK Banks", path: "/uk-banks" },
    { name: "Canada Banks", path: "/canada-banks" },
    { name: "Transactions", path: "/transactions" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Bank Pro</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="relative inline-flex items-center justify-center rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs h-5 min-w-[20px] px-1">
                      {totalQuantity}
                    </span>
                  )}
                </button>
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
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 font-semibold">
                  <Wallet className="h-4 w-4" />
                  <span className={wallet && wallet.balance_minor === 0 ? "text-destructive text-2xl font-bold" : "text-success"}>
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
          </div>
        </div>
      </div>
    </nav>
  );
};
