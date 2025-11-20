import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { items, clearCart } = useCart();

  useEffect(() => {
    processPaymentSuccess();
  }, []);

  const processPaymentSuccess = async () => {
    try {
      // Get pending invoice data from localStorage
      const pendingInvoiceStr = localStorage.getItem("pending_invoice");
      if (!pendingInvoiceStr) {
        // Order might already be created and payment confirmed via webhook
        // Just clear and redirect
        setProcessing(false);
        return;
      }

      const pendingInvoice = JSON.parse(pendingInvoiceStr);
      const trackId = searchParams.get("track_id");
      const status = searchParams.get("status");

      // Check if payment was successful
      if (status !== "Paid" && status !== "paid") {
        setError("Payment was not completed successfully");
        setProcessing(false);
        return;
      }

      // Order should already be created and marked as paid by webhook
      // Just clear pending invoice and cart
      localStorage.removeItem("pending_invoice");
      clearCart();

      if (pendingInvoice.order) {
        toast.success("Payment confirmed!", {
          description: `Order ${pendingInvoice.order.order_number} has been paid`,
        });
      } else {
        toast.success("Payment confirmed!", {
          description: "Your order has been processed",
        });
      }

      setProcessing(false);
    } catch (error: any) {
      console.error("Failed to process payment success:", error);
      setError(error.response?.data?.detail || error.message || "Failed to process order");
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processing your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Payment Processing Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/orders")} className="w-full">
              View Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-success mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Your payment has been confirmed and your order has been placed.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/orders")}>
              View Orders
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

