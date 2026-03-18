import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";

const OrdersContext = createContext(undefined);

function genId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => readJson("storeweb:v1:orders", { orders: [] }).orders);

  useEffect(() => {
    writeJson("storeweb:v1:orders", { orders });
  }, [orders]);

  const value = useMemo(
    () => ({
      orders,
      placeOrder: ({ items, totalPrice, customerEmail }) => {
        const order = {
          id: genId(),
          createdAt: new Date().toISOString(),
          customerEmail,
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          totalPrice,
        };
        setOrders((prev) => [order, ...prev]);
        return order;
      },
      clearOrders: () => setOrders([]),
    }),
    [orders]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

