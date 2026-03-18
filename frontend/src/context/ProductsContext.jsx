import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as baseProducts } from "@/data/products";
import { readJson, writeJson } from "@/lib/storage";

const ProductsContext = createContext(undefined);

function normalizeProducts(list) {
  const map = new Map();
  for (const p of list) map.set(p.id, p);
  return Array.from(map.values());
}

export function ProductsProvider({ children }) {
  const [managed, setManaged] = useState(() => {
    const stored = readJson("storeweb:v1:products", null);
    return stored?.products?.length ? stored.products : baseProducts;
  });

  useEffect(() => {
    writeJson("storeweb:v1:products", { products: managed });
  }, [managed]);

  const value = useMemo(() => {
    const products = normalizeProducts(managed);
    return {
      products,
      getById: (id) => products.find((p) => p.id === id),
      upsert: (p) =>
        setManaged((prev) => {
          const next = prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev];
          return normalizeProducts(next);
        }),
      remove: (id) => setManaged((prev) => prev.filter((p) => p.id !== id)),
      resetToDefaults: () => setManaged(baseProducts),
    };
  }, [managed]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}

