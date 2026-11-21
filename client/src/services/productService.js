
import { API_BASE_URL } from "../config/api.js";

const API_URL = `${API_BASE_URL}/api/products`;

// Get all products from the backend
export const getProducts = async () => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    return data.products;
  } catch (error) {
    console.error("Product API Error:", error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  const response = await fetch(`${API_URL}/${productId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const data = await response.json();
  return data.product;
};

export const addProductReview = async (productId, review, token) => {
  const response = await fetch(`${API_URL}/${productId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(review),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to save review.");
  }
  return data;
};

export const reportProductReview = async (productId, reviewId, reason, token) => {
  const response = await fetch(
    `${API_URL}/${productId}/reviews/${reviewId}/report`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to report review.");
  }
  return data;
};
