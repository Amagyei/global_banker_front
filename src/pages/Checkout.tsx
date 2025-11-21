import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { getWallet, getCryptoNetworks, generateInvoice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { PaymentMethod } from "@/types";

// Hardcoded list of supported networks (mainnet only, no testnet)
const SUPPORTED_NETWORKS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'LTC'];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [wallet, setWallet] = useState<any>(null);
  const [networks, setNetworks] = useState<any[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast: uiToast } = useToast();

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
      
      // Filter networks (mainnet only, only supported currencies)
      // Use db_is_testnet (actual DB value) instead of is_testnet (effective value) for OXA Pay
      const networksData = networksRes.results || networksRes;
      console.log('Checkout - Raw API response:', networksData);
      
      const filteredNetworks = networksData.filter((network: any) => {
        const symbol = network.native_symbol?.toUpperCase();
        const isSupported = SUPPORTED_NETWORKS.includes(symbol);
        // Use db_is_testnet (actual DB value) for OXA Pay filtering, not effective is_testnet
        const isMainnet = !(network.db_is_testnet ?? network.is_testnet);
        console.log(`Network ${network.name}: symbol=${symbol}, isSupported=${isSupported}, isMainnet=${isMainnet}, db_is_testnet=${network.db_is_testnet}, is_testnet=${network.is_testnet}`);
        return isSupported && isMainnet;
      });
      setNetworks(filteredNetworks);
      
      if (filteredNetworks.length > 0 && !selectedNetwork) {
        setSelectedNetwork(filteredNetworks[0].id);
      }
      
      console.log('Checkout - Loaded networks:', filteredNetworks.length, filteredNetworks);
    } catch (error: any) {
      console.error("Failed to load checkout data:", error);
      uiToast({
        title: "Error",
        description: "Failed to load checkout information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletCheckout = async () => {
    // Redirect to orders page - the existing checkout logic in Sidebar will handle wallet payment
    navigate("/orders");
  };

  const handleCryptoCheckout = async () => {
    if (items.length === 0) {
      uiToast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (!selectedNetwork) {
      uiToast({
        title: "Select Network",
        description: "Please select a payment network",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // Step 1: Sync items to backend cart
      const { addToCart, createOrder } = await import("@/lib/api");
      for (const item of items) {
        try {
          await addToCart(item.id, item.quantity);
        } catch (error) {
          console.log("Item sync:", error);
        }
      }

      // Step 2: Create order first (status: 'pending')
      const recipient = {
        name: "Customer",
        email: wallet?.user?.email || "",
      };

      // Create order first to get order_number (with payment_method: 'crypto')
      const order = await createOrder(recipient, 'crypto');
      
      // Generate invoice with order number and item details
      const itemDescriptions = items.map(item => 
        `${item.quantity}x ${item.description}`
      ).join(', ');
      
      const returnUrl = `${window.location.origin}/payment-success`;
      const callbackUrl = `${window.location.origin}/api/v2/wallet/webhook/`;
      
      const invoice = await generateInvoice({
        amount: subtotal,
        currency: "usd",
        lifetime: 30, // 30 minutes
        return_url: returnUrl,
        callback_url: callbackUrl,
        order_id: order.order_number, // Use actual order number
        email: recipient.email,
        description: `Order ${order.order_number}: ${itemDescriptions} - Total: $${subtotal.toFixed(2)}`,
        thanks_message: "Thank you for your purchase! Your order will be processed once payment is confirmed.",
        fee_paid_by_payer: 0, // Merchant pays fee
        auto_withdrawal: true,
        mixed_payment: true,
      });

      // Store order and invoice data
      localStorage.setItem("pending_invoice", JSON.stringify({
        invoice,
        order: {
          id: order.id,
          order_number: order.order_number,
        },
        items: items.map(item => ({ id: item.id, quantity: item.quantity })),
        subtotal,
      }));

      // Redirect to payment link
      if (invoice.payment_url) {
        window.location.href = invoice.payment_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error("Failed to create invoice:", error);
      uiToast({
        title: "Error",
        description: error.response?.data?.detail || error.message || "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const walletBalance = wallet?.balance_minor || 0;
  const totalCents = Math.round(subtotal * 100);
  const hasSufficientBalance = walletBalance >= totalCents;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.description} x{item.quantity}</span>
                  <span className="font-semibold">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>Wallet Balance</span>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    Balance: ${(walletBalance / 100).toFixed(2)}
                    {!hasSufficientBalance && (
                      <span className="text-destructive ml-2">
                        (Need ${((totalCents - walletBalance) / 100).toFixed(2)} more)
                      </span>
                    )}
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value="crypto" id="crypto" />
                <Label htmlFor="crypto" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Pay with Crypto</span>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    Pay with Bitcoin, Ethereum, USDT, and more
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* Network Selection (only for Crypto) */}
            {paymentMethod === "crypto" && (
              <div className="pt-4 border-t space-y-4">
                <div>
                  <Label>Select Payment Network</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose your preferred cryptocurrency
                  </p>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : networks.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {networks.map((network) => (
                      <Button
                        key={network.id}
                        variant={selectedNetwork === network.id ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setSelectedNetwork(network.id)}
                        disabled={processing}
                      >
                        <div className="font-semibold text-lg">{network.native_symbol}</div>
                        <div className="text-xs text-muted-foreground">
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
              </div>
            )}

            {/* Checkout Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={paymentMethod === "wallet" ? handleWalletCheckout : handleCryptoCheckout}
              disabled={
                processing ||
                (paymentMethod === "wallet" && !hasSufficientBalance) ||
                (paymentMethod === "crypto" && !selectedNetwork)
              }
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "wallet" ? (
                "Complete Purchase"
              ) : (
                "Continue to Payment"
              )}
            </Button>

            {paymentMethod === "wallet" && !hasSufficientBalance && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/top-up")}
              >
                Top Up Wallet
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;

