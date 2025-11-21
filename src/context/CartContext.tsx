import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BankAccount, CartItem, FullzPackage } from "@/types";

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  addToCart: (item: BankAccount | FullzPackage | CartItem) => void;
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

  const addToCart = (item: BankAccount | FullzPackage | CartItem) => {
    setItems((prev) => {
      let cartItem: CartItem;
      
      // Check if item is already a CartItem (has description but not balance or name)
      if ('description' in item && 'price' in item && 'quantity' in item && !('balance' in item) && !('name' in item)) {
        cartItem = item as CartItem;
      }
      // Handle BankAccount (has balance property)
      else if ('balance' in item) {
        const account = item as BankAccount;
        cartItem = {
          id: account.id,
          description: account.description,
          price: account.price,
          quantity: 1,
        };
      }
      // Handle FullzPackage (has name and quantity properties)
      else if ('name' in item) {
        const pkg = item as FullzPackage;
        cartItem = {
          id: pkg.id,
          description: `${pkg.name} - ${pkg.quantity} fullz`,
          price: pkg.price,
          quantity: 1,
        };
      } else {
        // Unknown item type, return unchanged
        return prev;
      }
      
      // Add or update item in cart
      const existing = prev.find((i) => i.id === cartItem.id);
      if (existing) {
        return prev.map((i) => 
          i.id === cartItem.id 
            ? { ...i, quantity: i.quantity + cartItem.quantity } 
            : i
        );
      }
      return [...prev, cartItem];
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


