import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard as CreditCardIcon, DollarSign } from "lucide-react";
import { toast } from "sonner";

const TopUp = () => {
  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleTopUp = (amount: number) => {
    toast.success(`Top up of $${amount} initiated!`, {
      description: "Your balance will be updated shortly",
    });
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
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="h-8 w-8 text-success" />
              <div className="text-4xl font-bold text-success">$2,450.00</div>
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
                />
              </div>
            </div>

            <Button className="w-full" size="lg">
              Add Funds
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCardIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Visa •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Badge className="bg-success">Default</Badge>
            </div>

            <Button variant="outline" className="w-full">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded ${className}`}>
    {children}
  </span>
);

export default TopUp;
