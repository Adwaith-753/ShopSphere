const test = require("node:test");
const assert = require("node:assert/strict");
const Category = require("../models/Category");
const { getProductCategories } = require("../controllers/productController");

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

test("public categories include active custom categories and exclude deleted ones", async (t) => {
  const originalFind = Category.find;
  Category.find = () => ({
    select() {
      return this;
    },
    sort: async () => [
      { name: "Custom", imageUrl: "", isActive: true, isDeleted: false },
      {
        name: "Electronics",
        imageUrl: "",
        isActive: false,
        isDeleted: true,
      },
    ],
  });
  t.after(() => {
    Category.find = originalFind;
  });

  const response = makeResponse();
  await getProductCategories({}, response);

  assert.equal(response.statusCode, 200);
  assert(response.body.categories.some((category) => category.name === "Custom"));
  assert(
    !response.body.categories.some(
      (category) => category.name === "Electronics"
    )
  );
});
