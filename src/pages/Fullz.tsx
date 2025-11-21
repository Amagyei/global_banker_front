import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BankSelectionModal } from "@/components/BankSelectionModal";
import { FullzTable } from "@/components/FullzTable";
import { Filter } from "lucide-react";
import { getBanks, getFullzPackages } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Bank, FullzPackage } from "@/types";

const FullzPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [packages, setPackages] = useState<FullzPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBanks({ is_active: true });
      const banksData = response.results || response;
      const formattedBanks: Bank[] = banksData.map((bank: any) => ({
        id: bank.id,
        name: bank.name,
        logo: bank.logo_url || bank.name.charAt(0),
      }));
      setBanks(formattedBanks);
    } catch (error: any) {
      console.error("Failed to load banks:", error);
      toast({
        title: "Error",
        description: "Failed to load banks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadPackages = useCallback(async (bankId: string) => {
    try {
      setLoading(true);
      const response = await getFullzPackages({
        bank: bankId,
        is_active: true,
      });
      const packagesData = response.results || response;
      const formattedPackages: FullzPackage[] = packagesData.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        quantity: pkg.quantity,
        price: pkg.price,
        price_minor: pkg.price_minor,
      }));
      setPackages(formattedPackages);
    } catch (error: any) {
      console.error("Failed to load packages:", error);
      toast({
        title: "Error",
        description: "Failed to load fullz packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setSelectedBank(null);
    setPackages([]);
    setBanks([]);
    loadBanks();
  }, [loadBanks]);

  useEffect(() => {
    if (selectedBank) {
      loadPackages(selectedBank.id);
    } else {
      setPackages([]);
    }
  }, [selectedBank, loadPackages]);

  const handleSelectCompany = (company: Bank) => {
    setSelectedBank(company);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Fullz</h1>
        <p className="text-muted-foreground">Browse and purchase fullz from top brands</p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Filter className="h-5 w-5" />
          {selectedBank ? `Selected: ${selectedBank.name}` : "Select Bank"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : selectedBank ? (
        <FullzTable 
          packages={packages} 
          bankName={selectedBank.name}
        />
      ) : (
        <div className="text-center py-16 bg-card rounded-lg shadow-card">
          <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Select a Brand</h2>
          <p className="text-muted-foreground mb-6">
            Click "Select Bank" to choose from available banks
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            Browse Fullz
          </Button>
        </div>
      )}

      <BankSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companies={banks}
        onSelectCompany={handleSelectCompany}
        country="All"
      />
    </div>
  );
};

export default FullzPage;

