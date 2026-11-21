
const ADMIN_API_URL = "http://localhost:5000/api/admin";

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

// Get one seller application
export const getSellerApplicationById = async (id, token) => {
  return adminRequest(`/seller-applications/${id}`, token);
};

// Approve seller application
export const approveSellerApplication = async (id, token) => {
  return adminRequest(
    `/seller-applications/${id}/approve`,
    token,
    {
      method: "PUT",
    }
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
