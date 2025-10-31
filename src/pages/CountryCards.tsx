import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BankSelectionModal, Bank } from "@/components/BankSelectionModal";
import { BankAccountTable, BankAccount } from "@/components/BankAccountTable";
import { Filter } from "lucide-react";

interface CountryCardsProps {
  country: string;
}

// Mock data - in a real app, this would come from an API
const banksByCountry: Record<string, Bank[]> = {
  US: [
    { id: "1", name: "Chase", logo: "C" },
    { id: "2", name: "Bank Of America", logo: "BOA" },
    { id: "3", name: "Wells Fargo", logo: "WF" },
    
  ],
  UK: [
    { id: "7", name: "Amazon UK", logo: "A" },
    { id: "8", name: "Tesco", logo: "T" },
    { id: "9", name: "Argos", logo: "A" },
    { id: "10", name: "PlayStation UK", logo: "P" },
    { id: "11", name: "iTunes UK", logo: "I" },
    { id: "12", name: "Steam UK", logo: "S" },
  ],
  Canada: [
    { id: "13", name: "Amazon CA", logo: "A" },
    { id: "14", name: "Tim Hortons", logo: "T" },
    { id: "15", name: "Canadian Tire", logo: "C" },
    { id: "16", name: "PlayStation CA", logo: "P" },
    { id: "17", name: "iTunes CA", logo: "I" },
    { id: "18", name: "Steam CA", logo: "S" },
  ],
};

const bankAccountsByBank: Record<string, BankAccount[]> = {
  Chase: [
    { id: "1", balance: "$16,937.00", description: "Chase Plus 10 Years old", price: "$773.00" },
    { id: "2", balance: "$3,2350.00", description: " Chase Premium 3 years old", price: "$45.00" },
    { id: "3", balance: "$100.00", description: "Chase Lite 1 Year + Bonus", price: "$89.99" },
  ],
  Amazon: [
    { id: "4", balance: "$500.00", description: "Amazon Bank", price: "$475.00" },
    { id: "5", balance: "$100.00", description: "Amazon Prime + Credit", price: "$95.00" },
    { id: "6", balance: "$25.00", description: "Amazon Bank", price: "$23.50" },
  ],
  Steam: [
    { id: "7", balance: "$200.00", description: "Steam Wallet Credit", price: "$190.00" },
    { id: "8", balance: "$50.00", description: "Steam Bank", price: "$47.50" },
    { id: "9", balance: "$20.00", description: "Steam Wallet Code", price: "$19.00" },
  ],
};

const CountryCards = ({ country }: CountryCardsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const companies = banksByCountry[country] || [];

  const handleSelectCompany = (company: Bank) => {
    setSelectedBank(company);
  };

  const currentBankAccounts = selectedBank 
    ? bankAccountsByBank[selectedBank.name] || []
    : [];

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

      {selectedBank ? (
        <BankAccountTable 
          bankAccounts={currentBankAccounts} 
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
        companies={companies}
        onSelectCompany={handleSelectCompany}
        country={country}
      />
    </div>
  );
};

export default CountryCards;
