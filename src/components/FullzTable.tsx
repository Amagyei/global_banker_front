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
import { useCart } from "@/context/CartContext";
import type { FullzPackage } from "@/types";

interface FullzTableProps {
  packages: FullzPackage[];
  bankName?: string;
}

export const FullzTable = ({ packages, bankName }: FullzTableProps) => {
  const { addToCart } = useCart();
  
  const handleBuy = (pkg: FullzPackage) => {
    toast.success(`Added ${pkg.name} to cart!`, {
      description: `${pkg.quantity} fullz for ${pkg.price}`,
    });
    // CartContext now handles FullzPackage directly
    addToCart(pkg);
  };

  if (packages.length === 0) {
    return (
      <Card className="p-8 text-center bg-card">
        <p className="text-muted-foreground">No packages available at the moment</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-card bg-card">
      {bankName && (
        <div className="p-4 border-b bg-muted/50">
          <h2 className="text-xl font-semibold">{bankName} Fullz Packages</h2>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Package Name</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Quantity</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-primary">
                {pkg.name}
              </TableCell>
              <TableCell>{pkg.description}</TableCell>
              <TableCell className="font-semibold">{pkg.quantity} fullz</TableCell>
              <TableCell className="font-semibold text-success">
                {pkg.price}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleBuy(pkg)}
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

