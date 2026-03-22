// frontend/src/context/ProductsContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as baseProducts } from "@/data/products";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(baseProducts);

  useEffect(() => {
    localStorage.setItem("storeweb:products", JSON.stringify(products));
  }, [products]);

  const value = useMemo(() => ({
    products,
    add: (p) => setProducts(prev => [...prev, p])
  }), [products]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}