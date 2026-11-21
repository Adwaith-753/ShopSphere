const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../models/Product");
const { reportProductReview } = require("../controllers/productController");

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
