import { Product } from "../models/Product.js";
import { seedProducts } from "../seed/products.js";

/** Inserts catalog seed when the products collection is empty (local dev only). */
export async function seedIfEmpty() {
  if (process.env.NODE_ENV === "production") return;
  if (process.env.AUTO_SEED_IF_EMPTY === "0") return;
  const n = await Product.countDocuments();
  if (n === 0) {
    await Product.insertMany(seedProducts);
    console.log(`[seed] ${seedProducts.length} products (DB was empty)`);
  }
}
