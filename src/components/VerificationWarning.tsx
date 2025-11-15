import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { getWallet } from "@/lib/api";

export const VerificationWarning = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadWallet();
  }, [location.pathname]); // Refresh when navigating (in case they top up)

  const loadWallet = async () => {
    try {
      const walletData = await getWallet();
      setWallet(walletData);
      // Reset dismissed state if balance is no longer 0
      if (walletData && walletData.balance_minor > 0) {
        setDismissed(false);
      }
    } catch (error) {
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show warning if balance is 0 and not dismissed
  const showWarning = !loading && wallet && wallet.balance_minor === 0 && !dismissed;

  if (!showWarning) {
    return null;
  }

  return (
    <Alert className="border-destructive bg-destructive/10 rounded-none border-x-0 border-t-0">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertDescription className="text-sm font-medium">
            Your account is not verified. Please top up your wallet to verify your account and start making purchases.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/top-up")}
            className="bg-destructive hover:bg-destructive/90"
          >
            Top Up Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
};

