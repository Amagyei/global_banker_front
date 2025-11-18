import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, ShoppingBag, Wallet, LogOut } from "lucide-react";
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
import { cn } from "@/lib/utils";

export const TopRightMenu = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
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
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      {/* Wallet Balance */}
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
    </div>
  );
};

