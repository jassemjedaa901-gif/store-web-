import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { addToCart, setCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${product.id}`} className="hover:underline underline-offset-4">
            <h3 className="font-display text-base font-medium text-foreground">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5">{product.price} €</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => {
              addToCart(product);
              toast.success("Ajoute au panier");
            }}
            className="bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 transition-opacity"
            aria-label={`Ajouter ${product.name} au panier`}
            title="Ajouter au panier"
          >
            <ShoppingBag size={16} />
          </button>
          <button
            onClick={() => {
              setCart([{ ...product, quantity: 1 }]);
              toast.success("Achat direct", { description: "Redirection vers checkout" });
              router.push("/checkout");
            }}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
