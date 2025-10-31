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

interface Transaction {
  id: string;
  date: string;
  brand: string;
  description: string;
  amount: string;
  status: "completed" | "pending" | "failed";
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-20 14:32",
    brand: "PlayStation",
    description: "PlayStation Plus 10 Years Subscription",
    amount: "$773.00",
    status: "completed",
  },
  {
    id: "2",
    date: "2024-01-20 12:15",
    brand: "Amazon",
    description: "Amazon Bank $100",
    amount: "$95.00",
    status: "completed",
  },
  {
    id: "3",
    date: "2024-01-19 16:45",
    brand: "Steam",
    description: "Steam Wallet Credit $50",
    amount: "$47.50",
    status: "pending",
  },
  {
    id: "4",
    date: "2024-01-19 10:20",
    brand: "iTunes",
    description: "iTunes Bank $25",
    amount: "$23.50",
    status: "completed",
  },
  {
    id: "5",
    date: "2024-01-18 18:30",
    brand: "Xbox",
    description: "Xbox Live Gold 12 Months",
    amount: "$55.00",
    status: "failed",
  },
];

const Transactions = () => {
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
            {mockTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {transaction.date}
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {transaction.brand}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="font-semibold text-success">
                  {transaction.amount}
                </TableCell>
                <TableCell>
                  {getStatusBadge(transaction.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Transactions;
