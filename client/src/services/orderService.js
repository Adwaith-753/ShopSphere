import { API_BASE_URL } from "../config/api.js";

const API_URL = `${API_BASE_URL}/api/orders`;

const orderRequest = async (endpoint, token, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Order request failed.");
  }

  return data;
};

export const createOrder = (orderData, token) =>
  orderRequest("", token, {
    method: "POST",
    body: JSON.stringify(orderData),
  });

export const validateCoupon = (code, subtotal, token) =>
  orderRequest("/coupons/validate", token, {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });

export const getMyOrders = (token) => orderRequest("", token);

export const getMyOrderById = (orderId, token) =>
  orderRequest(`/${orderId}`, token);

export const cancelMyOrder = (orderId, token) =>
  orderRequest(`/${orderId}/cancel`, token, { method: "PUT" });
