require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product");

const catalog = [
  {
    name: "Wireless Headphones",
    description: "Over-ear wireless headphones with clear audio, soft cushions and long battery life.",
    price: 1999,
    category: "Electronics",
    stock: 25,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Smart Watch",
    description: "Fitness-focused smart watch with activity tracking and smartphone notifications.",
    price: 2499,
    category: "Electronics",
    stock: 18,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Wireless Mouse",
    description: "Comfortable wireless mouse with precise tracking for work and everyday use.",
    price: 899,
    category: "Accessories",
    stock: 40,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with powerful sound and compact wireless design.",
    price: 1499,
    category: "Electronics",
    stock: 22,
    isFeatured: true,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Wireless Earbuds",
    description: "Lightweight true wireless earbuds with touch controls and an included charging case.",
    price: 1299,
    category: "Electronics",
    stock: 30,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Travel Backpack",
    description: "Durable everyday backpack with padded compartments for travel and commuting.",
    price: 1799,
    category: "Fashion",
    stock: 20,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Smart LED Lamp",
    description: "Modern adjustable LED desk lamp for study, work and ambient room lighting.",
    price: 899,
    category: "Home & Living",
    stock: 35,
    isFeatured: false,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Fitness Band",
    description: "Activity and sleep tracking band with a lightweight comfortable display.",
    price: 1999,
    category: "Sports & Fitness",
    stock: 16,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Gaming Laptop",
    description: "High-performance gaming laptop designed for games, streaming and creative work.",
    price: 59999,
    category: "Electronics",
    stock: 8,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with breathable material and supportive cushioning.",
    price: 2999,
    category: "Sports & Fitness",
    stock: 24,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Smart Phone",
    description: "Modern smartphone with a vivid display, capable camera system and all-day battery.",
    price: 18999,
    category: "Electronics",
    stock: 12,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Digital Camera",
    description: "Versatile mirrorless-style camera for travel, portrait and everyday photography.",
    price: 25999,
    category: "Electronics",
    stock: 10,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
  },
];

const seedCatalog = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const item of catalog) {
    await Product.updateOne(
      { name: item.name },
      {
        $set: {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          stock: item.stock,
          status: "active",
          isFeatured: item.isFeatured,
          isTrending: item.isTrending,
          images: [
            {
              url: item.image,
              publicId: "",
              alt: item.name,
            },
          ],
        },
      },
      { upsert: true }
    );
  }

  console.log(`Catalog ready: ${catalog.length} products.`);
  await mongoose.disconnect();
};

seedCatalog().catch(async (error) => {
  console.error("Catalog seed failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
