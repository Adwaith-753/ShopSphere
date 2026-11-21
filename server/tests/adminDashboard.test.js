const test = require("node:test");
const assert = require("node:assert/strict");
const SellerApplication = require("../models/SellerApplication");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { getDashboardStats } = require("../controllers/adminController");

const stubMethod = (t, target, method, implementation) => {
  const original = target[method];
  target[method] = implementation;
  t.after(() => {
    target[method] = original;
  });
};

const queryFor = (result) => ({
  select() {
    return this;
  },
  sort() {
    return this;
  },
  limit() {
    return this;
  },
  populate: async () => result,
});

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

test("admin overview returns marketplace totals, sales trend, and recent activity", async (t) => {
  const today = new Date().toISOString().slice(0, 10);
  const orderDate = new Date();
  const applicationDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const recentOrders = [
    {
      _id: "order123456",
      user: { name: "Customer One" },
      status: "placed",
      total: 900,
      createdAt: orderDate,
    },
  ];
  const recentApplications = [
    {
      _id: "application123",
      user: { name: "Seller One" },
      storeName: "Seller Store",
      status: "pending",
      createdAt: applicationDate,
      reviewedAt: null,
      updatedAt: applicationDate,
    },
  ];

  stubMethod(t, User, "countDocuments", async (query) => {
    if (!query) return 12;
    return query.role === "customer" ? 8 : 3;
  });
  stubMethod(t, Product, "countDocuments", async () => 11);
  stubMethod(t, Product, "distinct", async () => [
    "Electronics",
    "Fashion",
    "Books",
  ]);
  stubMethod(t, Order, "countDocuments", async () => 14);
  stubMethod(t, SellerApplication, "countDocuments", async () => 2);
  stubMethod(t, Order, "aggregate", async (pipeline) => {
    const isTrendQuery = pipeline.some((stage) => stage.$match?.createdAt);
    return isTrendQuery
      ? [{ _id: today, revenue: 900 }]
      : [{ _id: null, revenue: 2500 }];
  });
  stubMethod(t, Order, "find", () => queryFor(recentOrders));
  stubMethod(t, SellerApplication, "find", () =>
    queryFor(recentApplications)
  );

  const response = makeResponse();
  await getDashboardStats({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(
    {
      totalUsers: response.body.stats.totalUsers,
      customers: response.body.stats.users,
      sellers: response.body.stats.sellers,
      products: response.body.stats.products,
      categories: response.body.stats.categories,
      orders: response.body.stats.orders,
      pendingApplications: response.body.stats.pendingApplications,
      revenue: response.body.stats.revenue,
    },
    {
      totalUsers: 12,
      customers: 8,
      sellers: 3,
      products: 11,
      categories: 3,
      orders: 14,
      pendingApplications: 2,
      revenue: 2500,
    }
  );
  assert.equal(response.body.stats.salesTrend.length, 7);
  assert.equal(
    response.body.stats.salesTrend.find((day) => day.date === today).revenue,
    900
  );
  assert.equal(response.body.stats.recentOrders[0]._id, "order123456");
  assert.equal(response.body.stats.recentActivity.length, 2);
  assert.equal(response.body.stats.recentActivity[0].type, "order");
});
