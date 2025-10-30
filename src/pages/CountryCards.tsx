import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CompanySelectionModal, Company } from "@/components/CompanySelectionModal";
import { GiftCardTable, GiftCard } from "@/components/GiftCardTable";
import { Filter } from "lucide-react";

interface CountryCardsProps {
  country: string;
}

// Mock data - in a real app, this would come from an API
const companiesByCountry: Record<string, Company[]> = {
  US: [
    { id: "1", name: "Amazon", logo: "A" },
    { id: "2", name: "PlayStation", logo: "P" },
    { id: "3", name: "Xbox", logo: "X" },
    { id: "4", name: "iTunes", logo: "I" },
    { id: "5", name: "Steam", logo: "S" },
    { id: "6", name: "Walmart", logo: "W" },
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

const giftCardsByCompany: Record<string, GiftCard[]> = {
  PlayStation: [
    { id: "1", balance: "$16,937.00", description: "PlayStation Plus 10 Years Subscription", price: "$773.00" },
    { id: "2", balance: "$50.00", description: "PlayStation Store Credit", price: "$45.00" },
    { id: "3", balance: "$100.00", description: "PlayStation Plus 1 Year + Bonus", price: "$89.99" },
  ],
  Amazon: [
    { id: "4", balance: "$500.00", description: "Amazon Gift Card", price: "$475.00" },
    { id: "5", balance: "$100.00", description: "Amazon Prime + Credit", price: "$95.00" },
    { id: "6", balance: "$25.00", description: "Amazon Gift Card", price: "$23.50" },
  ],
  Steam: [
    { id: "7", balance: "$200.00", description: "Steam Wallet Credit", price: "$190.00" },
    { id: "8", balance: "$50.00", description: "Steam Gift Card", price: "$47.50" },
    { id: "9", balance: "$20.00", description: "Steam Wallet Code", price: "$19.00" },
  ],
};

const CountryCards = ({ country }: CountryCardsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const companies = companiesByCountry[country] || [];

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
  };

  const currentGiftCards = selectedCompany 
    ? giftCardsByCompany[selectedCompany.name] || []
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{country} Gift Cards</h1>
        <p className="text-muted-foreground">Browse and purchase gift cards from top brands</p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Filter className="h-5 w-5" />
          {selectedCompany ? `Selected: ${selectedCompany.name}` : "Select Brand"}
        </Button>
      </div>

      {selectedCompany ? (
        <GiftCardTable 
          giftCards={currentGiftCards} 
          companyName={selectedCompany.name}
        />
      ) : (
        <div className="text-center py-16 bg-card rounded-lg shadow-card">
          <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Select a Brand</h2>
          <p className="text-muted-foreground mb-6">
            Click "Select Brand" to choose from available gift card brands
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            Browse Brands
          </Button>
        </div>
      )}

      <CompanySelectionModal
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
