const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../models/Product");
const Order = require("../models/Order");

test("Product rejects negative prices", () => {
  const product = new Product({
    name: "Test",
    description: "Test product",
    price: -1,
    category: "Electronics",
  });

  assert.equal(product.validateSync().errors.price !== undefined, true);
});

test("Product review rating must be between 1 and 5", () => {
  const product = new Product({
    name: "Test",
    description: "Test product",
    price: 100,
    category: "Electronics",
    reviews: [{ user: "507f1f77bcf86cd799439011", rating: 6 }],
  });

  assert.equal(product.validateSync().errors["reviews.0.rating"] !== undefined, true);
});

test("Order requires at least one item", () => {
  const order = new Order({
    user: "507f1f77bcf86cd799439011",
    items: [],
    shippingAddress: {
      fullName: "Test",
      phone: "123",
      addressLine1: "Address",
      city: "City",
      state: "State",
      postalCode: "123456",
      country: "India",
    },
    subtotal: 0,
    shippingFee: 0,
    total: 0,
  });

  assert.equal(order.validateSync().errors.items !== undefined, true);
});
