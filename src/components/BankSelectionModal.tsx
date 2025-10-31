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

export interface Bank {
  id: string;
  name: string;
  logo: string;
}

interface BankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Bank[];
  onSelectCompany: (company: Bank) => void;
  country: string;
}

export const BankSelectionModal = ({
  isOpen,
  onClose,
  companies,
  onSelectCompany,
  country,
}: BankSelectionModalProps) => {
  const handleSelect = (company: Bank) => {
    onSelectCompany(company);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-popover">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Bank </DialogTitle>
          <DialogDescription>
            Choose from available {country} bank 
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


