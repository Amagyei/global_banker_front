import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface Company {
  id: string;
  name: string;
  logo: string;
}

interface CompanySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  country: string;
}

export const CompanySelectionModal = ({
  isOpen,
  onClose,
  companies,
  onSelectCompany,
  country,
}: CompanySelectionModalProps) => {
  const handleSelect = (company: Company) => {
    onSelectCompany(company);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-popover">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Gift Card Brand</DialogTitle>
          <DialogDescription>
            Choose from available {country} gift card brands
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="p-4 cursor-pointer hover:shadow-hover transition-all hover:scale-105 bg-card"
              onClick={() => handleSelect(company)}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {company.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-center">
                  {company.name}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
