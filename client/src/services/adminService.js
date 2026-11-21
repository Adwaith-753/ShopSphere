
import { API_BASE_URL } from "../config/api.js";

const ADMIN_API_URL = `${API_BASE_URL}/api/admin`;

// Common function for admin API requests
const adminRequest = async (endpoint, token, options = {}) => {
  const response = await fetch(`${ADMIN_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Admin request failed.");
  }

  return data;
};

// Get all seller applications
export const getSellerApplications = async (token) => {
  return adminRequest("/seller-applications", token);
};

export const getAdminDashboardStats = async (token) => {
  return adminRequest("/dashboard", token);
};

// Get one seller application
export const getSellerApplicationById = async (id, token) => {
  return adminRequest(`/seller-applications/${id}`, token);
};

// Approve seller application
export const approveSellerApplication = async (id, token) => {
  return adminRequest(
    `/seller-applications/${id}/approve`,
    token,
    { method: "PUT" }
  );
};

// Reject seller application
export const rejectSellerApplication = async (
  id,
  rejectionReason,
  token
) => {
  return adminRequest(
    `/seller-applications/${id}/reject`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ rejectionReason }),
    }
  );
};

const queryString = (filters = {}) => {
  const search = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")
  );
  return search.toString();
};

export const getAdminProducts = (token, filters = {}) =>
  adminRequest(`/products?${queryString(filters)}`, token);

export const createAdminProduct = (product, token) =>
  adminRequest("/products", token, {
    method: "POST",
    body: JSON.stringify(product),
  });

export const updateAdminProduct = (id, changes, token) =>
  adminRequest(`/products/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(changes),
  });

export const archiveAdminProduct = (id, token) =>
  adminRequest(`/products/${id}`, token, { method: "DELETE" });

export const restoreAdminProduct = (id, token) =>
  adminRequest(`/products/${id}/restore`, token, { method: "PUT" });

export const getAdminCategories = (token) =>
  adminRequest("/categories", token);

export const createAdminCategory = (category, token) =>
  adminRequest("/categories", token, {
    method: "POST",
    body: JSON.stringify(category),
  });

export const updateAdminCategory = (id, changes, token) =>
  adminRequest(`/categories/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(changes),
  });

export const deleteAdminCategory = (id, token) =>
  adminRequest(`/categories/${id}`, token, { method: "DELETE" });

export const getAdminInventory = (token, lowStock = false) =>
  adminRequest(`/inventory?lowStock=${lowStock}`, token);

export const updateAdminInventory = (id, stock, token) =>
  adminRequest(`/inventory/${id}`, token, {
    method: "PUT",
    body: JSON.stringify({ stock }),
  });

export const getAdminOrders = (token, status = "all") =>
  adminRequest(`/orders?status=${encodeURIComponent(status)}`, token);

export const updateAdminOrderStatus = (id, status, token) =>
  adminRequest(`/orders/${id}/status`, token, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const getAdminUsers = (token, filters = {}) =>
  adminRequest(`/users?${queryString(filters)}`, token);

export const getAdminUserDetails = (id, token) =>
  adminRequest(`/users/${id}`, token);

export const setAdminUserActive = (id, isActive, token) =>
  adminRequest(`/users/${id}/status`, token, {
    method: "PUT",
    body: JSON.stringify({ isActive }),
  });

export const getAdminReviews = (token, reportedOnly = false) =>
  adminRequest(`/reviews?reported=${reportedOnly}`, token);

export const deleteAdminReview = (productId, reviewId, token) =>
  adminRequest(`/products/${productId}/reviews/${reviewId}`, token, {
    method: "DELETE",
  });

export const getAdminPayments = (token) =>
  adminRequest("/payments", token);

export const updateAdminPaymentStatus = (id, paymentStatus, token) =>
  adminRequest(`/payments/${id}/status`, token, {
    method: "PUT",
    body: JSON.stringify({ paymentStatus }),
  });

export const getAdminCoupons = (token) =>
  adminRequest("/coupons", token);

export const saveAdminCoupon = (coupon, token, id) =>
  adminRequest(id ? `/coupons/${id}` : "/coupons", token, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(coupon),
  });

export const deactivateAdminCoupon = (id, token) =>
  adminRequest(`/coupons/${id}`, token, { method: "DELETE" });

export const getAdminAnalytics = (token) =>
  adminRequest("/analytics", token);

export const getAdminSettings = (token) =>
  adminRequest("/settings", token);

export const updateAdminSettings = (settings, token) =>
  adminRequest("/settings", token, {
    method: "PUT",
    body: JSON.stringify(settings),
  });

export const getAdminActivity = (token) =>
  adminRequest("/activity", token);

export const askAdminAssistant = (question, token) =>
  adminRequest("/ai/ask", token, {
    method: "POST",
    body: JSON.stringify({ question }),
  });

export const uploadAdminImage = async (file, token) => {
  const signature = await adminRequest("/cloudinary/signature", token);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", signature.timestamp);
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Image upload failed.");
  }
  return { url: data.secure_url, publicId: data.public_id };
};
