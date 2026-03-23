"use client";

import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getApiBase, isUsingDefaultLocalApi } from "@/lib/api";
import Image from "next/image";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [query, setQuery] = useState("");
  const q = query.trim();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { q, activeCategory }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (activeCategory && activeCategory !== "Tout") params.set("category", activeCategory);
      const res = await api(`/products?${params.toString()}`);
      return (res.products || []).map((p) => ({ ...p, id: p._id }));
    },
    retry: 0,
  });

  const products = data || [];
  const categories = useMemo(
    () => ["Tout", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <Image src={heroBanner} alt="Collection" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl font-semibold text-primary-foreground max-w-lg"
          >
            Nouvelle Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-primary-foreground/80 mt-3 text-lg max-w-md font-body"
          >
            Découvrez nos produits soigneusement sélectionnés.
          </motion.p>
        </div>
      </section>

      {/* Categories & Products */}
      <section className="container mx-auto px-4 py-12">
        {/* Search */}
        <div className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full sm:max-w-md px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {activeCategory === "Tout" ? "Tous les Produits" : activeCategory}
          </h2>
          <span className="text-sm text-muted-foreground">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </span>
        </div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {isLoading ? (
            <div className="col-span-full text-muted-foreground">Chargement...</div>
          ) : isError ? (
            <div className="col-span-full space-y-2 text-destructive">
              <p className="font-medium">Impossible de charger les produits (API injoignable).</p>
              <p className="text-sm text-foreground font-normal">
                URL appelée : <code className="rounded bg-muted px-1 py-0.5 text-xs">{getApiBase()}</code>
                {isUsingDefaultLocalApi() ? (
                  <>
                    . Démarre le backend sur le port 5000 ou définis{" "}
                    <code className="rounded bg-muted px-0.5 text-xs">NEXT_PUBLIC_API_URL</code> dans <code className="rounded bg-muted px-0.5 text-xs">.env.local</code>.
                  </>
                ) : (
                  <>
                    . Vérifie que le déploiement répond (MongoDB <code className="rounded bg-muted px-0.5 text-xs">MONGO_URI</code> sur Vercel,{" "}
                    <code className="rounded bg-muted px-0.5 text-xs">CLIENT_URL</code> = URL du site pour le CORS).
                  </>
                )}
              </p>
            </div>
          ) : (
            products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
