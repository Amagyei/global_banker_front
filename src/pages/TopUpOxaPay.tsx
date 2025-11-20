import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, DollarSign, Copy, Check, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getWallet, getCryptoNetworks, createTopUpV2, getOxaPayPayments } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Hardcoded list of supported networks (mainnet only, no testnet)
const SUPPORTED_NETWORKS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'LTC'];

const TopUpOxaPay = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [networks, setNetworks] = useState<any[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [topupData, setTopupData] = useState<any>(null);
  const [oxaPayData, setOxaPayData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { toast: uiToast } = useToast();
  const quickAmounts = [50, 100, 250, 500, 1000];

  useEffect(() => {
    loadData();
  }, []);

  // Countdown timer for top-up expiration (OXA Pay)
  useEffect(() => {
    if (!oxaPayData?.expired_at) {
      setTimeRemaining("");
      return;
    }

    const updateCountdown = () => {
      // OXA Pay returns expired_at as UNIX timestamp
      const expiresAt = typeof oxaPayData.expired_at === 'number' 
        ? new Date(oxaPayData.expired_at * 1000)
        : new Date(oxaPayData.expired_at);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [oxaPayData?.expired_at]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletRes, networksRes] = await Promise.all([
        getWallet(),
        getCryptoNetworks(),
      ]);
      setWallet(walletRes);
      
      // Filter networks to only include supported currencies (mainnet only, no testnet)
      // Use db_is_testnet (actual DB value) instead of is_testnet (effective value) for OXA Pay
      const networksData = networksRes.results || networksRes;
      console.log('TopUpOxaPay - Raw API response:', networksData);
      
      const filteredNetworks = networksData.filter((network: any) => {
        const symbol = network.native_symbol?.toUpperCase();
        const isSupported = SUPPORTED_NETWORKS.includes(symbol);
        // Use db_is_testnet (actual DB value) for OXA Pay filtering, not effective is_testnet
        const isMainnet = !(network.db_is_testnet ?? network.is_testnet);
        console.log(`Network ${network.name}: symbol=${symbol}, isSupported=${isSupported}, isMainnet=${isMainnet}, db_is_testnet=${network.db_is_testnet}, is_testnet=${network.is_testnet}`);
        return isSupported && isMainnet;
      });
      
      setNetworks(filteredNetworks);
      
      // Auto-select first network
      if (filteredNetworks.length > 0 && !selectedNetwork) {
        setSelectedNetwork(filteredNetworks[0].id);
      }
      
      console.log('TopUpOxaPay - Loaded networks:', filteredNetworks.length, filteredNetworks);
    } catch (error: any) {
      console.error("Failed to load wallet data:", error);
      uiToast({
        title: "Error",
        description: "Failed to load wallet information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (amount: number) => {
    if (!selectedNetwork) {
      uiToast({
        title: "Error",
        description: "Please select a cryptocurrency network",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const amountMinor = amount * 100; // Convert to cents
      // OXA Pay v2 returns both topup and oxapay_payment
      const response = await createTopUpV2(amountMinor, selectedNetwork, false);
      setTopupData(response.topup);
      setOxaPayData(response.oxapay_payment);
      toast.success("Top-up request created!", {
        description: "Send crypto to the OXA Pay address below",
      });
    } catch (error: any) {
      console.error("Failed to create top-up:", error);
      uiToast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create top-up",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCustomTopUp = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      uiToast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    handleTopUp(amount);
  };

  const copyAddress = () => {
    const address = oxaPayData?.address || topupData?.deposit_address?.address;
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Address copied to clipboard!");
    }
  };

  const handleCheckStatus = async () => {
    if (!oxaPayData?.track_id) return;

    try {
      setCheckingStatus(true);
      // Check OXA Pay payment status
      const payments = await getOxaPayPayments();
      const currentPayment = payments.find((p: any) => p.track_id === oxaPayData.track_id);
      
      if (currentPayment) {
        setOxaPayData(currentPayment);
        
        if (currentPayment.status === 'paid') {
          toast.success("Payment confirmed! Your balance has been updated.");
          // Reload wallet balance
          loadData();
        } else if (currentPayment.status === 'expired') {
          toast.error("Payment has expired. Please create a new top-up.");
        } else {
          toast.info("Payment is still pending. Please wait for confirmation.");
        }
      } else {
        toast.info("Payment status not found. Please check again in a few moments.");
      }
    } catch (error: any) {
      console.error("Failed to check status:", error);
      uiToast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to check payment status",
        variant: "destructive",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Top Up Balance (OXA Pay)</h1>
        <p className="text-muted-foreground">Add funds to your wallet via OXA Pay</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
            <div className="flex items-center gap-3 mb-4">
                <Wallet className={`h-8 w-8 ${wallet && wallet.balance_minor === 0 ? "text-destructive" : "text-success"}`} />
                <div className={`font-bold ${wallet && wallet.balance_minor === 0 ? "text-destructive text-8xl" : "text-success text-4xl"}`}>
                  {wallet?.balance || "$0.00"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {oxaPayData && (
          <Card className="shadow-card border-primary">
            <CardHeader>
              <CardTitle>OXA Pay Deposit Address</CardTitle>
              <CardDescription>
                Send {oxaPayData.pay_currency?.toUpperCase()} to this address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code */}
              {oxaPayData.qr_code && (
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <img 
                    src={oxaPayData.qr_code} 
                    alt="Payment QR Code" 
                    className="w-48 h-48"
                  />
                </div>
              )}

              {/* Address */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-sm font-mono break-all flex-1">
                    {oxaPayData.address}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    {oxaPayData.amount_display || `${oxaPayData.amount} ${oxaPayData.currency?.toUpperCase()}`}
                  </span>
                </div>
                {oxaPayData.pay_amount_display && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pay Amount:</span>
                    <span className="font-semibold">{oxaPayData.pay_amount_display}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={
                    oxaPayData.status === 'paid' ? 'default' : 
                    oxaPayData.status === 'expired' ? 'destructive' : 
                    'secondary'
                  }>
                    {oxaPayData.status_display || oxaPayData.status}
                  </Badge>
                </div>
                {oxaPayData.expired_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires in:</span>
                    <span className="font-mono font-semibold">
                      {timeRemaining || "Calculating..."}
                    </span>
                  </div>
                )}
                {oxaPayData.track_id && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Track ID:</span>
                    <span className="font-mono text-xs">{oxaPayData.track_id}</span>
                  </div>
                )}
              </div>

              {/* Check Status Button */}
              {oxaPayData.status === 'pending' && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckStatus}
                    disabled={checkingStatus}
                    className="w-full"
                  >
                    {checkingStatus ? "Checking..." : "Check Payment Status"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Select Network</CardTitle>
            <CardDescription>Choose cryptocurrency network</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : networks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {networks.map((network) => (
                  <Button
                    key={network.id}
                    variant={selectedNetwork === network.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setSelectedNetwork(network.id)}
                    disabled={creating}
                  >
                    <div className="font-semibold text-lg">{network.native_symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {network.name}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No networks available. Please try again later.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Top Up</CardTitle>
            <CardDescription>Select a preset amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="h-20 text-lg font-semibold"
                  onClick={() => handleTopUp(amount)}
                  disabled={creating || !selectedNetwork}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Custom Amount</CardTitle>
            <CardDescription>Enter a specific amount to add</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customAmount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  min="10"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={creating || !selectedNetwork}
                />
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCustomTopUp}
              disabled={creating || !selectedNetwork || !customAmount}
            >
              {creating ? "Creating..." : "Add Funds"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopUpOxaPay;

