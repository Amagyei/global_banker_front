import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BankAccount } from "@/components/BankAccountTable";

export interface CartItem {
  id: string;
  description: string;
  price: string; // currency string like "$95.00"
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  addToCart: (account: BankAccount) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("cart.items");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart.items", JSON.stringify(items));
    } catch {
      // ignore persistence errors
    }
  }, [items]);

  const addToCart = (account: BankAccount) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === account.id);
      if (existing) {
        return prev.map((i) => (i.id === account.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: account.id,
          description: account.description,
          price: account.price,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalQuantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, totalQuantity, subtotal, addToCart, removeFromCart, clearCart }),
    [items, totalQuantity, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


