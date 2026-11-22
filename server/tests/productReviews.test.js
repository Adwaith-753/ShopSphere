const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../models/Product");
const Order = require("../models/Order");
const {
  addProductReview,
  reportProductReview,
} = require("../controllers/productController");

const makeResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("customers can review products from a delivered order", async (t) => {
  const originalFindOne = Order.findOne;
  const originalFindById = Product.findById;
  const reviews = [];
  let saved = false;
  Order.findOne = async () => ({ _id: "507f1f77bcf86cd799439015" });
  Product.findById = async () => ({
    reviews,
    save: async () => {
      saved = true;
    },
  });
  t.after(() => {
    Order.findOne = originalFindOne;
    Product.findById = originalFindById;
  });

  const response = makeResponse();
  await addProductReview(
    {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { rating: 5, comment: "Great product." },
      user: { _id: "507f1f77bcf86cd799439014", role: "customer" },
    },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.equal(saved, true);
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].rating, 5);
  assert.equal(reviews[0].comment, "Great product.");
});

test("customers cannot review products they have not received", async (t) => {
  const originalFindOne = Order.findOne;
  const originalFindById = Product.findById;
  Order.findOne = async () => null;
  Product.findById = async () => {
    throw new Error("Product should not be loaded.");
  };
  t.after(() => {
    Order.findOne = originalFindOne;
    Product.findById = originalFindById;
  });

  const response = makeResponse();
  await addProductReview(
    {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { rating: 5, comment: "Great product." },
      user: { _id: "507f1f77bcf86cd799439014", role: "customer" },
    },
    response
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.message, "Only customers who received this product can review it.");
});

test("customers can report another user's review with a reason", async (t) => {
  const originalFindOne = Product.findOne;
  const review = {
    user: "507f1f77bcf86cd799439012",
    isReported: false,
    reportReason: "",
  };
  let saved = false;
  Product.findOne = async () => ({
    reviews: { id: () => review },
    save: async () => {
      saved = true;
    },
  });
  t.after(() => {
    Product.findOne = originalFindOne;
  });

  const response = makeResponse();
  await reportProductReview(
    {
      params: {
        id: "507f1f77bcf86cd799439011",
        reviewId: "507f1f77bcf86cd799439013",
      },
      body: { reason: "This review contains abusive language." },
      user: { _id: "507f1f77bcf86cd799439014" },
    },
    response
  );

  assert.equal(response.statusCode, 200);
  assert.equal(review.isReported, true);
  assert.equal(review.reportReason, "This review contains abusive language.");
  assert.equal(saved, true);
});

test("review authors cannot report their own review", async (t) => {
  const originalFindOne = Product.findOne;
  let saved = false;
  Product.findOne = async () => ({
    reviews: {
      id: () => ({
        user: "507f1f77bcf86cd799439014",
        isReported: false,
      }),
    },
    save: async () => {
      saved = true;
    },
  });
  t.after(() => {
    Product.findOne = originalFindOne;
  });

  const response = makeResponse();
  await reportProductReview(
    {
      params: {
        id: "507f1f77bcf86cd799439011",
        reviewId: "507f1f77bcf86cd799439013",
      },
      body: { reason: "This review contains abusive language." },
      user: { _id: "507f1f77bcf86cd799439014" },
    },
    response
  );

  assert.equal(response.statusCode, 403);
  assert.equal(saved, false);
});
