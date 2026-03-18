import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { readJson, writeJson } from "@/lib/storage";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart from localStorage after mount to avoid SSR hydration mismatches.
    const stored = readJson("storeweb:v1:cart", []);
    setCart(Array.isArray(stored) ? stored : []);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson("storeweb:v1:cart", cart);
  }, [cart, hydrated]);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((p) => p.id !== id));
    } else {
      setCart((prev) =>
        prev.map((p) => (p.id === id ? { ...p, quantity } : p))
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
