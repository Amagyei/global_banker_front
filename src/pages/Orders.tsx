import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, CreditCard, ChevronDown, ChevronUp, Copy, Check, User, MapPin, Phone, Mail, FileText, DollarSign, Building } from "lucide-react";
import { getOrders } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Extended order type with full item details
interface OrderItem {
  id: string;
  item_type: 'account' | 'fullz_package';
  item_name: string;
  item_description: string;
  item_bank_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  // Account-specific fields
  account_id?: string;
  account_sku?: string;
  account_name?: string;
  account_description?: string;
  account_bank_name?: string;
  account_bank_logo?: string;
  account_balance?: string;
  account_image_url?: string;
  account_country?: string;
  account_country_code?: string;
  account_metadata?: Record<string, any>;
  account_has_fullz?: boolean;
  account_bank_logs?: string;
  // FullzPackage-specific fields
  fullz_package_id?: string;
  fullz_package_name?: string;
  fullz_package_description?: string;
  fullz_package_quantity?: number;
  fullz_package_bank_name?: string;
  fullz_package_bank_logo?: string;
  // Order item metadata (delivery info, etc.)
  metadata?: Record<string, any>;
}

interface FullOrder {
  id: string;
  order_number: string;
  date: string;
  brand: string;
  itemsSummary: string;
  total: string;
  status: string;
  items: OrderItem[];
  recipient?: Record<string, any>;
}

const Orders = () => {
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      const ordersData = response.results || response;
      const formattedOrders: FullOrder[] = ordersData.map((order: any) => {
        // Get first item's bank name as brand
        const brand = order.items && order.items.length > 0 
          ? (order.items[0].item_bank_name || order.items[0].account_bank_name || order.items[0].fullz_package_bank_name || '-')
          : '-';
        // Get items summary
        const itemsSummary = order.items && order.items.length > 0
          ? order.items.map((item: any) => {
              const itemName = item.item_name || item.account_name || item.fullz_package_name || 'Unknown';
              return `${item.quantity}x ${itemName}`;
            }).join(', ')
          : 'No items';
        
        return {
          id: order.id,
          order_number: order.order_number,
          date: order.date || order.created_at,
          brand: brand,
          itemsSummary: itemsSummary,
          total: order.total,
          status: order.status === 'delivered' ? 'paid' : order.status === 'paid' ? 'paid' : order.status,
          items: order.items || [],
          recipient: order.recipient,
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

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: "Copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
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

  // Render a copyable field with label
  const CopyableField = ({ label, value, fieldId, icon: Icon }: { label: string; value: string; fieldId: string; icon?: any }) => {
    if (!value) return null;
    return (
      <div className="flex items-start justify-between gap-2 py-2 border-b border-border/50 last:border-0">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
          <div className="min-w-0 flex-1">
            <span className="text-xs text-muted-foreground block">{label}</span>
            <span className="text-sm font-medium break-all">{value}</span>
          </div>
        </div>
        <button
          onClick={() => copyToClipboard(value, fieldId)}
          className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0"
          title="Copy to clipboard"
        >
          {copiedField === fieldId ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    );
  };

  // Render metadata fields recursively
  const renderMetadata = (metadata: Record<string, any>, prefix = '') => {
    if (!metadata || Object.keys(metadata).length === 0) return null;
    
    return Object.entries(metadata).map(([key, value]) => {
      const fieldId = `${prefix}${key}`;
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div key={fieldId} className="pl-2 border-l-2 border-primary/20 ml-2">
            <span className="text-xs font-semibold text-primary uppercase">{label}</span>
            {renderMetadata(value, `${fieldId}-`)}
          </div>
        );
      }
      
      const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
      return <CopyableField key={fieldId} label={label} value={displayValue} fieldId={fieldId} />;
    });
  };

  // Render item details based on type
  const renderItemDetails = (item: OrderItem, index: number) => {
    const isAccount = item.item_type === 'account';
    
    return (
      <div key={item.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            {(isAccount ? item.account_bank_logo : item.fullz_package_bank_logo) && (
              <img 
                src={isAccount ? item.account_bank_logo : item.fullz_package_bank_logo} 
                alt="Bank logo" 
                className="h-10 w-10 rounded-full object-cover bg-white p-1"
              />
            )}
            <div>
              <h4 className="font-semibold text-lg">{item.item_name}</h4>
              <p className="text-sm text-muted-foreground">{item.item_bank_name}</p>
            </div>
          </div>
          <Badge variant="outline" className="uppercase">
            {isAccount ? 'Bank Account' : 'Fullz Package'}
          </Badge>
        </div>

        {isAccount ? (
          // Account details
          <div className="space-y-1">
            <CopyableField label="SKU" value={item.account_sku || ''} fieldId={`${item.id}-sku`} icon={FileText} />
            <CopyableField label="Account Balance" value={item.account_balance || ''} fieldId={`${item.id}-balance`} icon={DollarSign} />
            <CopyableField label="Country" value={item.account_country || ''} fieldId={`${item.id}-country`} icon={MapPin} />
            <CopyableField label="Description" value={item.account_description || ''} fieldId={`${item.id}-desc`} icon={FileText} />
            
            {/* Bank Logs - Important login information */}
            {item.account_bank_logs && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h5 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Login Information
                </h5>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-background/50 p-3 rounded border overflow-x-auto">
                  {item.account_bank_logs}
                </pre>
                <button
                  onClick={() => copyToClipboard(item.account_bank_logs || '', `${item.id}-logs`)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === `${item.id}-logs` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy all
                </button>
              </div>
            )}
            
            {/* Account Metadata - Additional purchased data */}
            {item.account_metadata && Object.keys(item.account_metadata).length > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Account Details
                </h5>
                <div className="space-y-1">
                  {renderMetadata(item.account_metadata)}
                </div>
              </div>
            )}

            {/* Order Item Metadata - Delivery info */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Delivery Information
                </h5>
                <div className="space-y-1">
                  {renderMetadata(item.metadata)}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Fullz Package details
          <div className="space-y-1">
            <CopyableField label="Package Name" value={item.fullz_package_name || ''} fieldId={`${item.id}-name`} icon={Package} />
            <CopyableField label="Quantity" value={String(item.fullz_package_quantity || 0)} fieldId={`${item.id}-qty`} icon={FileText} />
            <CopyableField label="Description" value={item.fullz_package_description || ''} fieldId={`${item.id}-desc`} icon={FileText} />
            
            {/* Order Item Metadata - Fullz delivery info */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Fullz Data
                </h5>
                <div className="space-y-1">
                  {renderMetadata(item.metadata)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">Unit Price: {item.unit_price}</span>
          <span className="font-semibold text-success">{item.total_price}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your bank purchases. Click an order to view details.</p>
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
          <Card 
            key={order.id} 
            className={`shadow-card hover:shadow-hover transition-all cursor-pointer ${
              expandedOrder === order.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            {/* Order Header - Always visible, clickable */}
            <div 
              className="p-6"
              onClick={() => toggleOrder(order.id)}
            >
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

                  <p className="text-sm">{order.itemsSummary}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-success">{order.total}</div>
                  </div>
                  <div className="text-muted-foreground">
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-6 w-6" />
                    ) : (
                      <ChevronDown className="h-6 w-6" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {expandedOrder === order.id && (
              <div className="border-t border-border px-6 pb-6 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Purchased Items ({order.items.length})
                </h3>
                
                <div className="space-y-4">
                  {order.items.map((item, index) => renderItemDetails(item, index))}
                </div>

                {/* Click to collapse hint */}
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Click header to collapse
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
      )}

      {/* Support Message */}
      <div className="mt-8 pt-8 border-t">
        <p className="text-center font-bold text-destructive text-lg">
          If you experience any issues with your purchase, please reach out to  👉👉👉<a href="https://t.me/mentor_kev" target="_blank" rel="noopener noreferrer">@mentor_kev</a>👈👈👈 on Telegram to resolve any issues.
        </p>
      </div>
    </div>
  );
};

export default Orders;
