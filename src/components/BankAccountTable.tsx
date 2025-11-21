import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import type { BankAccount } from "@/types";

interface BankAccountTableProps {
  bankAccounts: BankAccount[];
  bankName?: string;
}

export const BankAccountTable = ({ bankAccounts, bankName }: BankAccountTableProps) => {
  const { addToCart } = useCart();
  const handleBuy = (account: BankAccount) => {
    toast.success(`Added ${account.description} to cart!`, {
      description: `Balance: ${account.balance} - Price: ${account.price}`,
    });
    addToCart(account);
  };

  if (bankAccounts.length === 0) {
    return (
      <Card className="p-8 text-center bg-card">
        <p className="text-muted-foreground">No banks available at the moment</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-card bg-card">
      {bankName && (
        <div className="p-4 border-b bg-muted/50">
          <h2 className="text-xl font-semibold">{bankName} Banks</h2>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Balance</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Has Fullz</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bankAccounts.map((account) => (
            <TableRow key={account.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-primary">
                {account.balance}
              </TableCell>
              <TableCell className="font-medium">
                {account.name || '-'}
              </TableCell>
              <TableCell>{account.description}</TableCell>
              <TableCell>
                <Checkbox 
                  checked={account.has_fullz || false} 
                  disabled
                  aria-label="Has Fullz"
                />
              </TableCell>
              <TableCell className="font-semibold text-success">
                {account.price}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleBuy(account)}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};


