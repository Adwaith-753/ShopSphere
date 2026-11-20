
import { createContext, useState, useEffect } from "react";

import {
  getCurrentUser,
  updateUserProfile,
  verifyCurrentPassword as verifyCurrentPasswordRequest,
  changeUserPassword,
} from "../services/authService.js";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  // Save authentication token
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Verify saved login token
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);
        setUser(data.user);
      } catch (error) {
        console.error("Authentication verification failed:", error);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Update logged-in user's profile
  const updateProfile = async (name, email) => {
    if (!token) {
      throw new Error("Please log in to update your profile.");
    }

    const data = await updateUserProfile(name, email, token);

    setUser(data.user);

    return data;
  };

  // Verify current password
  const verifyPassword = async (currentPassword) => {
    if (!token) {
      throw new Error("Please log in to verify your password.");
    }

    const data = await verifyCurrentPasswordRequest(
      currentPassword,
      token
    );

    return data;
  };

  // Change password
  const changePassword = async (
    newPassword,
    passwordChangeToken
  ) => {
    if (!token) {
      throw new Error("Please log in to change your password.");
    }

    const data = await changeUserPassword(
      newPassword,
      token,
      passwordChangeToken
    );

    // Require login again after password change
    logout();

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        logout,
        loading,
        updateProfile,
        verifyPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
