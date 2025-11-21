import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTransactions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "@/types";

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions({ ordering: '-created_at' });
      const transactionsData = response.results || response;
      const formattedTransactions: Transaction[] = transactionsData.map((tx: any) => ({
        id: tx.id,
        date: tx.date || tx.created_at,
        brand: tx.brand,
        description: tx.description,
        amount: tx.amount,
        status: tx.status,
      }));
      setTransactions(formattedTransactions);
    } catch (error: any) {
      console.error("Failed to load transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
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
        <h1 className="text-4xl font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">View your purchase history and transaction details</p>
      </div>

      <Card className="overflow-hidden shadow-card">
        <div className="p-4 border-b bg-muted/50">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Brand</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {transaction.date}
                </TableCell>
                <TableCell className="font-semibold text-primary">
                    {transaction.brand || '-'}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="font-semibold text-success">
                  {transaction.amount}
                </TableCell>
                <TableCell>
                  {getStatusBadge(transaction.status)}
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Transactions;
