import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCryptoNetworks } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export interface CryptoNetwork {
  id: string;
  name: string;
  native_symbol: string;
  is_testnet: boolean;
}

interface NetworkSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const NetworkSelect = ({
  value,
  onValueChange,
  label = "Select Network",
  description = "Choose cryptocurrency network",
  disabled = false,
  className,
}: NetworkSelectProps) => {
  const [networks, setNetworks] = useState<CryptoNetwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworks();
  }, []);

  const loadNetworks = async () => {
    try {
      setLoading(true);
      const response = await getCryptoNetworks();
      const networksData = response.results || response;
      setNetworks(networksData);
      
      // Auto-select first network if no value is set
      if (!value && networksData.length > 0) {
        onValueChange(networksData[0].id);
      }
    } catch (error) {
      console.error("Failed to load networks:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedNetwork = networks.find((n) => n.id === value);

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor="network-select">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger id="network-select" className="w-full">
          <SelectValue placeholder={loading ? "Loading networks..." : "Select a network"}>
            {selectedNetwork ? (
              `${selectedNetwork.name} (${selectedNetwork.native_symbol}${selectedNetwork.is_testnet ? " Testnet" : ""})`
            ) : (
              "Select a network"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => (
            <SelectItem key={network.id} value={network.id}>
              <div className="flex items-center justify-between w-full">
                <span>{network.name}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {network.native_symbol}
                  {network.is_testnet && " (Testnet)"}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

