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
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export interface GiftCard {
  id: string;
  balance: string;
  description: string;
  price: string;
}

interface GiftCardTableProps {
  giftCards: GiftCard[];
  companyName?: string;
}

export const GiftCardTable = ({ giftCards, companyName }: GiftCardTableProps) => {
  const handleBuy = (card: GiftCard) => {
    toast.success(`Added ${card.description} to cart!`, {
      description: `Balance: ${card.balance} - Price: ${card.price}`,
    });
  };

  if (giftCards.length === 0) {
    return (
      <Card className="p-8 text-center bg-card">
        <p className="text-muted-foreground">No gift cards available at the moment</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-card bg-card">
      {companyName && (
        <div className="p-4 border-b bg-muted/50">
          <h2 className="text-xl font-semibold">{companyName} Gift Cards</h2>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Balance</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {giftCards.map((card) => (
            <TableRow key={card.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-primary">
                {card.balance}
              </TableCell>
              <TableCell>{card.description}</TableCell>
              <TableCell className="font-semibold text-success">
                {card.price}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleBuy(card)}
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
