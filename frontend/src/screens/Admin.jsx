import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/products";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { normalizeImageUrl } from "@/lib/image-url";

const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload) =>
      api("/products", { method: "POST", body: JSON.stringify(payload) }).then((r) => r.product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }).then((r) => r.product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const resetMutation = useMutation({
    mutationFn: () => api("/admin/reset-products", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const { data } = useQuery({
    queryKey: ["products", "admin"],
    enabled: isAuthenticated && isAdmin,
    queryFn: async () => {
      const res = await api("/products?all=1");
      return (res.products || []).map((p) => ({ ...p, id: p._id }));
    },
  });
  const products = data || [];

  const [editing, setEditing] = useState(null);

  const empty = useMemo(
    () => ({
      id: null,
      name: "",
      price: 0,
      image: "",
      description: "",
      stock: 0,
      category: categories[1] ?? "Accessoires",
    }),
    []
  );

  const [draft, setDraft] = useState(empty);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (!isAdmin) router.push("/");
  }, [isAuthenticated, isAdmin, router]);
  if (!isAuthenticated || !isAdmin) return null;

  const startCreate = () => {
    setEditing(null);
    setDraft({ ...empty, id: null });
  };

  const startEdit = (p) => {
    setEditing(p);
    setDraft(p);
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Nom requis");
      return;
    }
    if (!draft.image.trim()) {
      toast.error("Image (URL) requise");
      return;
    }
    if (!Number.isFinite(draft.price) || draft.price <= 0) {
      toast.error("Prix invalide");
      return;
    }
    const normalized = normalizeImageUrl(draft.image);
    if (!normalized.ok) {
      toast.error("Lien image invalide", {
        description:
          normalized.reason === "google_imgres"
            ? "Lien Google Images (imgres) ما يخدمش. استعمل رابط مباشر ينتهي بـ .jpg/.png أو Drive/Direct."
            : normalized.reason === "non_direct_image_url"
              ? "هذا رابط صفحة موش صورة. استعمل رابط مباشر ينتهي بـ .jpg/.png/.webp أو مسار محلي /products/..."
              : "استعمل رابط صورة مباشر (jpg/png/webp) أو /products/...",
      });
      return;
    }

    const payload = {
      name: draft.name.trim(),
      category: draft.category,
      image: normalized.url,
      description: draft.description.trim(),
      stock: Math.max(0, Number(draft.stock) || 0),
      price: Number(draft.price),
      active: true,
    };
    if (editing?.id) {
      void updateMutation
        .mutateAsync({ id: editing.id, payload })
        .then(() => {
          toast.success("Produit mis à jour");
          startCreate();
        })
        .catch(() => toast.error("Erreur"));
    } else {
      void createMutation
        .mutateAsync(payload)
        .then(() => {
          toast.success("Produit ajouté");
          startCreate();
        })
        .catch(() => toast.error("Erreur"));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground">Gestion des produits (stockés localement).</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              void resetMutation
                .mutateAsync()
                .then(() => {
                  toast.message("Catalogue par défaut ajouté (sans suppression)");
                  startCreate();
                })
                .catch(() => toast.error("Erreur"));
            }}
            className="px-4 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ajouter défaut
          </button>
          <button
            onClick={startCreate}
            className="px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Nouveau produit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-background p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category} • {p.stock} stock • {p.price} €
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(p)}
                  className="px-3 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    void deleteMutation
                      .mutateAsync(p.id)
                      .then(() => {
                        toast.message("Produit supprimé");
                        if (editing?.id === p.id) startCreate();
                      })
                      .catch(() => toast.error("Erreur"));
                  }}
                  className="px-3 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-background p-5">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            {editing ? "Modifier" : "Ajouter"} un produit
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nom</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Catégorie</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.filter((c) => c !== "Tout").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Prix (€)</label>
                <input
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Stock</label>
                <input
                  type="number"
                  value={draft.stock}
                  onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Image (URL)</label>
              <input
                value={draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">Astuce: استعمل رابط صورة (http/https) أو خلي URL متاع asset موجود.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={save}
                className="flex-1 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
              <button
                onClick={startCreate}
                className="px-4 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

