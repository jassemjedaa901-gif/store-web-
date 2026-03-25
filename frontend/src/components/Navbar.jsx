"use client";

import Link from "next/link";
import { ShoppingBag, User, Menu, X, LogOut, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner"; // ✅ FIX

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const canRenderAuthUi = mounted;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/icon.svg" alt="Store Web" className="w-7 h-7" />
          Store Web
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/">Accueil</Link>
          <Link href="/orders">Commandes</Link>

          {canRenderAuthUi && isAdmin && <Link href="/admin">Admin</Link>}

          <Link href="/cart" className="relative flex items-center gap-1">
            <ShoppingBag size={16} />
            Panier
            {mounted && totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-4 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          {!canRenderAuthUi ? null : !isAuthenticated ? (
            <Link href="/login">
              <User size={16} /> Connexion
            </Link>
          ) : (
            <button
              onClick={() => {
                logout();
                toast("Déconnecté"); // ✅ FIX
              }}
            >
              <LogOut size={16} /> {user?.name || "Compte"}
            </button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden"
          >
            <div className="flex flex-col p-4 gap-3">
              <Link href="/">Accueil</Link>
              <Link href="/orders">Commandes</Link>
              <Link href="/cart">Panier ({totalItems})</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;