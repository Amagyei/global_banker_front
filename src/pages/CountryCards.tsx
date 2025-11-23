import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BankSelectionModal } from "@/components/BankSelectionModal";
import { BankAccountTable } from "@/components/BankAccountTable";
import { Filter } from "lucide-react";
import { getBanks, getAccounts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Bank, BankAccount } from "@/types";

interface CountryCardsProps {
  country: string;
}

// Map country display names to country codes
const countryCodeMap: Record<string, string> = {
  US: "US",
  UK: "UK",
  Canada: "CA",
};

const CountryCards = ({ country }: CountryCardsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const countryCode = countryCodeMap[country] || country;

  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBanks({ country: countryCode, is_active: true });
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
  }, [countryCode, toast]);

  const loadAccounts = useCallback(async (bankId: string) => {
    try {
      setLoading(true);
      const response = await getAccounts({
        country: countryCode,
        bank: bankId,
        is_active: true,
      });
      const accountsData = response.results || response;
      const formattedAccounts: BankAccount[] = accountsData.map((account: any) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        description: account.description,
        price: account.price,
      }));
      setAccounts(formattedAccounts);
    } catch (error: any) {
      console.error("Failed to load accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load bank accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [countryCode, toast]);

  // Reset state when country changes
  useEffect(() => {
    setSelectedBank(null);
    setAccounts([]);
    setBanks([]);
    loadBanks();
  }, [countryCode, loadBanks]);

  useEffect(() => {
    if (selectedBank) {
      loadAccounts(selectedBank.id);
    } else {
      setAccounts([]);
    }
  }, [selectedBank, countryCode, loadAccounts]);

  const handleSelectCompany = (company: Bank) => {
    setSelectedBank(company);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{country} Banks</h1>
        <p className="text-muted-foreground">Browse and purchase banks from top brands</p>
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
        <BankAccountTable 
          bankAccounts={accounts} 
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
            Browse Bank Accounts
          </Button>
        </div>
      )}

      <BankSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companies={banks}
        onSelectCompany={handleSelectCompany}
        country={country}
      />
    </div>
  );
};

export default CountryCards;
