import { useCart } from "@/context/CartContext";
import CartItemRow from "@/components/CartItemRow";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Cart = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const createOrder = async () => {
    if (cart.length === 0) return;
    if (!isAuthenticated) {
      toast.message("Veuillez vous connecter pour continuer");
      router.push("/login");
      return;
    }
    toast.message("Veuillez compléter votre adresse au checkout");
    router.push("/checkout");
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[60vh]">
      <h1 className="font-display text-3xl font-semibold text-foreground mb-8">
        Votre Panier
      </h1>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Le panier est vide.</p>
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Continuer les achats
          </Link>
        </motion.div>
      ) : (
        <div>
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </AnimatePresence>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-display text-xl font-semibold text-foreground">
              Total : {totalPrice.toFixed(2)} €
            </p>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Vider le panier
              </button>
              <button
                onClick={() => router.push("/checkout")}
                className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Checkout
              </button>
              <button
                onClick={() => {
                  void createOrder();
                }}
                className="px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Payer en ligne
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
