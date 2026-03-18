import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

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
        <button
          onClick={() => addToCart(product)}
          className="shrink-0 bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 transition-opacity"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingBag size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
