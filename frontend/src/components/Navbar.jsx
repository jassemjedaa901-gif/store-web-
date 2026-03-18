"use client";

import Link from "next/link";
import { ShoppingBag, User, Menu, X, LogOut, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-foreground">
          <img src="/logo.svg" alt="Store Web" className="w-7 h-7" />
          Store Web
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Accueil
          </Link>
          <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Commandes
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Shield size={16} />
              Admin
            </Link>
          )}
          <Link href="/cart" className="relative flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag size={16} />
            Panier
            {mounted &&
              totalItems > 0 &&
              ((
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              ))}
          </Link>
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <User size={16} />
              Connexion
            </Link>
          ) : (
            <button
              onClick={() => {
                void logout().then(() => toast.message("Déconnecté"));
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              title={user?.email}
            >
              <LogOut size={16} />
              {user?.name || "Compte"}
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-border bg-background"
          >
            <div className="flex flex-col gap-4 p-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Accueil</Link>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Commandes</Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">
                  Admin
                </Link>
              )}
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground flex items-center gap-2">
                Panier{" "}
                {mounted && totalItems > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5">{totalItems}</span>
                )}
              </Link>
              {!isAuthenticated ? (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">
                  Connexion
                </Link>
              ) : (
                <button
                  onClick={() => {
                    void logout().then(() => {
                      toast.message("Déconnecté");
                      setMobileOpen(false);
                    });
                  }}
                  className="text-left text-sm font-medium text-foreground"
                >
                  Se déconnecter ({user?.email})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
