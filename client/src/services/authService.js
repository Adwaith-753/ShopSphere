
const API_URL = "http://localhost:5000/api/auth";
const USER_API_URL = "http://localhost:5000/api/users";

// Login user
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};


// Register new user
export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};


// Get currently logged-in user
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to get user information");
  }

  return data;
};


// Update logged-in user's profile
export const updateUserProfile = async (name, email, token) => {
  const response = await fetch(`${USER_API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      email,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Profile update failed");
  }

  return data;
};


// Verify current password
export const verifyCurrentPassword = async (currentPassword, token) => {
  const response = await fetch(`${USER_API_URL}/verify-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Password verification failed");
  }

  return data;
};


// Change password after successful verification
export const changeUserPassword = async (
  newPassword,
  token,
  passwordChangeToken
) => {
  const response = await fetch(`${USER_API_URL}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-password-change-token": passwordChangeToken,
    },
    body: JSON.stringify({
      newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Password change failed");
  }

  return data;
};


export default API_URL;
