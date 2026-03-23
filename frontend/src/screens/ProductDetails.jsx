import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ProductDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { addToCart, setCart } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api(`/products/${id}`);
      return { ...res.product, id: res.product._id };
    },
  });

  const product = useMemo(() => data, [data]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-muted-foreground mb-4">Produit introuvable.</p>
        <Link href="/" className="text-primary underline hover:text-primary/90">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Continuer les achats
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </motion.div>

        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">{product.name}</h1>
          <p className="text-muted-foreground mt-2">{product.category}</p>

          <p className="font-display text-2xl font-semibold text-foreground mt-6">{product.price} €</p>

          <p className="text-sm text-muted-foreground mt-2">
            Stock: <span className="text-foreground font-medium">{product.stock}</span>
          </p>

          <p className="text-foreground/90 mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                addToCart(product);
                toast.success("Ajouté au panier");
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={16} />
              Ajouter au panier
            </button>
            <button
              onClick={() => {
                setCart([{ ...product, quantity: 1 }]);
                toast.success("Achat direct", { description: "Redirection vers checkout" });
                router.push("/checkout");
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Buy Now
            </button>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Voir le panier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

