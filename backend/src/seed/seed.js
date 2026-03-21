import "dotenv/config";
import { connectDb } from "../lib/db.js";
import { Product } from "../models/Product.js";
import { seedProducts } from "./products.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

async function main() {
  await connectDb(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/storeweb");

  await Product.deleteMany({});
  await Product.insertMany(seedProducts);

  const adminEmail = "admin@admin.com";
  const existing = await User.findOne({ email: adminEmail });

  if (!existing) {
    const passwordHash = await bcrypt.hash("admin1234", 10);
    await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
  }

  console.log(`✅ Seeded ${seedProducts.length} products`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});