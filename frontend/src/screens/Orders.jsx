import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function resolveOrderItemImageSrc(image) {
  const raw = String(image || "").trim();
  if (!raw) return "/placeholder.svg";
  if (raw.includes("via.placeholder.com")) return "/placeholder.svg";
  if (raw.startsWith("http")) return raw;
  if (typeof window === "undefined") return "/placeholder.svg";
  return `${window.location.origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

const Orders = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "me"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api("/orders/me");
      return res.orders || [];
    },
  });

  const orders = data || [];

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl min-h-[60vh]">
      <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
        Mes commandes
      </h1>

      <p className="text-sm text-muted-foreground mb-8">
        Connecté en tant que {user?.email}
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-6">
          <p className="text-muted-foreground mb-4">
            Aucune commande pour le moment.
          </p>
          <Link
            href="/"
            className="text-primary underline hover:text-primary/90"
          >
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="rounded-lg border border-border bg-background p-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    Commande #{String(o._id).slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString()} • {o.status} •{" "}
                    {o.paymentStatus}
                  </p>
                </div>
                <p className="font-display text-lg font-semibold text-foreground">
                  {o.totalPrice.toFixed(2)} €
                </p>
              </div>

              {/* Items */}
              <div className="mt-4 space-y-3">
                {o.items.map((it) => (
                  <div
                    key={`${o._id}-${it.productId}`}
                    className="flex items-center gap-3"
                  >
                    {/* 🔥 IMAGE FIX */}
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-secondary shrink-0">
                      <img
                        src={resolveOrderItemImageSrc(it.image)}
                        alt={it.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {it.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {it.quantity} × {it.price} €
                      </p>
                    </div>

                    {/* Total */}
                    <p className="text-sm font-medium text-foreground">
                      {(it.price * it.quantity).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;