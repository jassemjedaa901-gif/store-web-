"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TooltipProvider } from "../src/components/ui/tooltip.jsx";
import { Toaster } from "../src/components/ui/toaster.jsx";
import { Toaster as Sonner } from "../src/components/ui/sonner.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { CartProvider } from "../src/context/CartContext.jsx";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            {children}
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

