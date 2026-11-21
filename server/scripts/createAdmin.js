
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("../models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const createAdmin = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Admin creation script cannot run in production."
      );
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    const name = (await ask("Enter admin name: ")).trim();
    const email = (await ask("Enter admin email: "))
      .trim()
      .toLowerCase();
    const password = await ask("Enter admin password: ");

    if (!name || !email || !password) {
      throw new Error("All fields are required.");
    }

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. Choose a different email."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      sellerApplicationStatus: "not-applied",
    });

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

createAdmin();
