import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, CreditCard } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  brand: string;
  items: string;
  total: string;
  status: "completed" | "processing" | "pending";
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    date: "2024-01-20",
    brand: "PlayStation",
    items: "PlayStation Plus 10 Years Subscription",
    total: "$773.00",
    status: "completed",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    date: "2024-01-20",
    brand: "Amazon",
    items: "Amazon Gift Card $100",
    total: "$95.00",
    status: "completed",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    date: "2024-01-19",
    brand: "Steam",
    items: "Steam Wallet Credit $50",
    total: "$47.50",
    status: "processing",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    date: "2024-01-18",
    brand: "iTunes",
    items: "iTunes Gift Card $25",
    total: "$23.50",
    status: "pending",
  },
];

const Orders = () => {
  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      completed: "default",
      processing: "secondary",
      pending: "outline",
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your gift card purchases</p>
      </div>

      <div className="grid gap-4">
        {mockOrders.map((order) => (
          <Card key={order.id} className="p-6 shadow-card hover:shadow-hover transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">{order.orderNumber}</span>
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
    </div>
  );
};

export default Orders;
