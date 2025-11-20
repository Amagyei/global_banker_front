import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { getWebhookStatus, getWebhookPaymentDetail, testWebhook } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface WebhookStatus {
  webhook_endpoint: string;
  status: string;
  last_24_hours: {
    total_payments: number;
    status_breakdown: {
      pending: number;
      paid: number;
      failed: number;
      expired: number;
    };
    expired_but_pending: number;
  };
  recent_pending: Array<{
    track_id: string;
    address: string;
    amount: string;
    currency: string;
    pay_currency: string;
    created_at: string;
    expired_at: string | null;
    is_expired: boolean;
    user: string;
  }>;
  recent_paid: Array<{
    track_id: string;
    address: string;
    amount: string;
    currency: string;
    pay_currency: string;
    paid_at: string;
    user: string;
  }>;
}

export default function WebhookStatus() {
  const [status, setStatus] = useState<WebhookStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWebhookStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch webhook status");
      toast({
        title: "Error",
        description: "Failed to load webhook status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestWebhook = async (trackId: string) => {
    try {
      setTesting(trackId);
      const result = await testWebhook(trackId, "paid");
      toast({
        title: "Webhook Test",
        description: `Test completed. Status: ${result.new_status}`,
      });
      // Refresh status
      await fetchStatus();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to test webhook",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      paid: "default",
      failed: "destructive",
      expired: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor webhook activity and payment status
          </p>
        </div>
        <Button onClick={fetchStatus} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.last_24_hours.total_payments}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.last_24_hours.status_breakdown.pending}</div>
                <p className="text-xs text-muted-foreground">Waiting for webhook</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {status.last_24_hours.status_breakdown.paid}
                </div>
                <p className="text-xs text-muted-foreground">Successfully processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {status.last_24_hours.status_breakdown.failed}
                </div>
                <p className="text-xs text-muted-foreground">Payment failures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expired</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {status.last_24_hours.status_breakdown.expired + status.last_24_hours.expired_but_pending}
                </div>
                <p className="text-xs text-muted-foreground">Expired payments</p>
              </CardContent>
            </Card>
          </div>

          {/* Webhook Endpoint Info */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoint</CardTitle>
              <CardDescription>Payment notifications are sent to this URL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <code className="text-sm bg-muted px-3 py-2 rounded">{status.webhook_endpoint}</code>
                <Badge variant={status.status === "active" ? "default" : "destructive"}>
                  {status.status}
                </Badge>
              </div>
              {status.last_24_hours.expired_but_pending > 0 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {status.last_24_hours.expired_but_pending} payments expired but still marked as pending.
                    These may need manual review.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Payments waiting for webhook confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              {status.recent_pending.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending payments</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track ID</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status.recent_pending.map((payment) => (
                      <TableRow key={payment.track_id}>
                        <TableCell className="font-mono text-xs">{payment.track_id}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {payment.address.slice(0, 10)}...
                        </TableCell>
                        <TableCell>
                          {payment.amount} {payment.currency}
                          {payment.pay_amount && ` (${payment.pay_amount} ${payment.pay_currency})`}
                        </TableCell>
                        <TableCell>{payment.user}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.is_expired ? "expired" : "pending")}
                            {getStatusBadge(payment.is_expired ? "expired" : "pending")}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestWebhook(payment.track_id)}
                            disabled={testing === payment.track_id}
                          >
                            {testing === payment.track_id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Test"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Paid Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Paid Payments</CardTitle>
              <CardDescription>Successfully processed payments</CardDescription>
            </CardHeader>
            <CardContent>
              {status.recent_paid.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No paid payments in last 24 hours</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track ID</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Paid At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status.recent_paid.map((payment) => (
                      <TableRow key={payment.track_id}>
                        <TableCell className="font-mono text-xs">{payment.track_id}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {payment.address.slice(0, 10)}...
                        </TableCell>
                        <TableCell>
                          {payment.amount} {payment.currency}
                          {payment.pay_amount && ` (${payment.pay_amount} ${payment.pay_currency})`}
                        </TableCell>
                        <TableCell>{payment.user}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(payment.paid_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

