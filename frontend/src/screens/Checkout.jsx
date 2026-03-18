"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

function prettyApiError(err) {
  const raw = String(err?.message || "").trim();
  if (!raw) return "Erreur inconnue";
  try {
    const j = JSON.parse(raw);
    if (j?.error === "stripe_not_configured") return "Stripe غير مكوّن: حط STRIPE_SECRET_KEY في backend/.env";
    if (j?.error) return `Erreur: ${j.error}`;
  } catch {
    // ignore
  }
  return raw.length > 180 ? `${raw.slice(0, 180)}...` : raw;
}

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const canSubmit = useMemo(() => {
    if (!isAuthenticated) return false;
    if (cart.length === 0) return false;
    return (
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.address.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.postalCode.trim().length > 0
    );
  }, [cart.length, form, isAuthenticated]);

  const createOrder = async () => {
    const res = await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: cart.map((it) => ({ productId: it.id, quantity: it.quantity })),
        shipping: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
        },
      }),
    });
    return res.order;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[60vh]">
      <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-8">Total: {totalPrice.toFixed(2)} €</p>

      {!isAuthenticated ? (
        <div className="rounded-lg border border-border bg-background p-6">
          <p className="text-muted-foreground">Veuillez vous connecter pour continuer.</p>
        </div>
      ) : cart.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-6">
          <p className="text-muted-foreground">Votre panier est vide.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nom</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Prénom</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Téléphone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+216 ..."
              className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Adresse</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ville</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Code postal</label>
              <input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              disabled={!canSubmit}
              onClick={() => {
                void createOrder()
                  .then((order) => {
                    clearCart();
                    toast.success("Commande créée", {
                      description: `Référence: #${String(order._id).slice(-6).toUpperCase()}`,
                    });
                    router.push("/orders");
                  })
                  .catch((err) => {
                    if (err?.status === 401) {
                      toast.message("Veuillez vous connecter");
                      router.push("/login");
                      return;
                    }
                    toast.error("Erreur commande", { description: prettyApiError(err) });
                  });
              }}
              className="flex-1 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Valider la commande
            </button>
            <button
              disabled={!canSubmit}
              onClick={() => {
                void createOrder()
                  .then(async (order) => {
                    const pay = await api("/payments/checkout", {
                      method: "POST",
                      body: JSON.stringify({ orderId: order._id }),
                    });
                    clearCart();
                    window.open(pay.url, "_blank", "noopener,noreferrer");
                  })
                  .catch((err) => {
                    if (err?.status === 401) {
                      toast.message("Veuillez vous connecter");
                      router.push("/login");
                      return;
                    }
                    toast.error("Erreur paiement", { description: prettyApiError(err) });
                  });
              }}
              className="flex-1 px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Payer en ligne
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

