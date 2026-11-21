
const express = require("express");
const cors = require("cors");

const app = express();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
      : ["http://localhost:5173"],
  })
);

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to ShopSphere Backend! Nodemon is working!");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

module.exports = app;
