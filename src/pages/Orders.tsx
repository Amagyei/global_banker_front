import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, CreditCard } from "lucide-react";
import { getOrders } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/types";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      const ordersData = response.results || response;
      const formattedOrders: Order[] = ordersData.map((order: any) => {
        // Get first item's bank name as brand
        const brand = order.items && order.items.length > 0 
          ? order.items[0].account_bank_name || '-' 
          : '-';
        // Get items description
        const itemsDesc = order.items && order.items.length > 0
          ? order.items.map((item: any) => `${item.quantity}x ${item.account_name}`).join(', ')
          : 'No items';
        
        return {
          id: order.id,
          order_number: order.order_number,
          date: order.date || order.created_at,
          brand: brand,
          items: itemsDesc,
          total: order.total,
          status: order.status === 'delivered' ? 'paid' : order.status === 'paid' ? 'paid' : order.status,
        };
      });
      setOrders(formattedOrders);
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      paid: "default",
      delivered: "default",
      processing: "secondary",
      pending: "outline",
      canceled: "destructive",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your bank purchases</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
      <div className="grid gap-4">
          {orders.map((order) => (
          <Card key={order.id} className="p-6 shadow-card hover:shadow-hover transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">{order.order_number}</span>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {order.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    {order.brand}
                  </div>
                </div>

                <p className="text-sm">{order.items}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-success">{order.total}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
};

export default Orders;
