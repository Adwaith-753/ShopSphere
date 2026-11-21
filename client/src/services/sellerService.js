
import { API_BASE_URL } from "../config/api.js";

const API_URL = `${API_BASE_URL}/api/users`;
const PRODUCT_API_URL = `${API_BASE_URL}/api/products`;
const ORDER_API_URL = `${API_BASE_URL}/api/orders`;

const authorizedJson = (token, options = {}) => ({
  ...options,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  },
});

export const getMySellerProducts = async (token) => {
  const response = await fetch(`${PRODUCT_API_URL}/seller/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load products.");
  return data;
};

export const getProductCategories = async () => {
  const response = await fetch(`${PRODUCT_API_URL}/categories`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load product categories.");
  }
  return data.categories || [];
};

export const createSellerProduct = async (productData, token) => {
  const response = await fetch(PRODUCT_API_URL, authorizedJson(token, {
    method: "POST",
    body: JSON.stringify(productData),
  }));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to create product.");
  return data;
};

export const updateSellerProduct = async (productId, productData, token) => {
  const response = await fetch(`${PRODUCT_API_URL}/${productId}`, authorizedJson(token, {
    method: "PUT",
    body: JSON.stringify(productData),
  }));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to update product.");
  return data;
};

export const deleteSellerProduct = async (productId, token) => {
  const response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to delete product.");
  return data;
};

export const getMySellerOrders = async (token) => {
  const response = await fetch(`${ORDER_API_URL}/seller/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to load orders.");
  return data;
};

// Submit seller application
export const submitSellerApplication = async (applicationData, token) => {
  const response = await fetch(`${API_URL}/seller-application`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(applicationData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to submit seller application.");
  }

  return data;
};

// Get logged-in user's seller application
export const getMySellerApplication = async (token) => {
  const response = await fetch(`${API_URL}/seller-application`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch seller application.");
  }

  return data;
};
