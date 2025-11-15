import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, DollarSign, Copy, Check, QrCode } from "lucide-react";
import { toast } from "sonner";
import { getWallet, getCryptoNetworks, createTopUp } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CryptoNetwork {
  id: string;
  name: string;
  native_symbol: string;
  is_testnet: boolean;
}

const TopUp = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [networks, setNetworks] = useState<CryptoNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [topupData, setTopupData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast: uiToast } = useToast();
  const quickAmounts = [50, 100, 250, 500, 1000];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletRes, networksRes] = await Promise.all([
        getWallet(),
        getCryptoNetworks(),
      ]);
      setWallet(walletRes);
      setNetworks(networksRes.results || networksRes);
      if (networksRes.results?.length > 0 || networksRes.length > 0) {
        const firstNetwork = networksRes.results?.[0] || networksRes[0];
        setSelectedNetwork(firstNetwork.id);
      }
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
      const topup = await createTopUp(amountMinor, selectedNetwork, 30);
      setTopupData(topup);
      toast.success("Top-up request created!", {
        description: "Send crypto to the address below",
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
    if (topupData?.deposit_address?.address) {
      navigator.clipboard.writeText(topupData.deposit_address.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Address copied to clipboard!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Top Up Balance</h1>
        <p className="text-muted-foreground">Add funds to your wallet</p>
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

        {topupData && (
          <Card className="shadow-card border-primary">
            <CardHeader>
              <CardTitle>Deposit Address</CardTitle>
              <CardDescription>
                Send {topupData.network?.native_symbol} to this address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-sm font-mono break-all flex-1">
                    {topupData.deposit_address?.address}
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{topupData.amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={topupData.status === 'succeeded' ? 'default' : 'secondary'}>
                  {topupData.status_display}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expires in:</span>
                <span>{topupData.expires_in_minutes} minutes</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Select Network</CardTitle>
            <CardDescription>Choose cryptocurrency network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {networks.map((network) => (
                <Button
                  key={network.id}
                  variant={selectedNetwork === network.id ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => setSelectedNetwork(network.id)}
                >
                  <div className="font-semibold">{network.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {network.native_symbol} {network.is_testnet && "(Testnet)"}
                  </div>
                </Button>
              ))}
            </div>
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

export default TopUp;
