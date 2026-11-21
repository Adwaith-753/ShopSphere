
/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);

  // Get the correct user ID
  const userId = user?.id || user?._id;

  // Load the Wishlist belonging to the logged-in user
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setWishlistItems([]);
      setLoadedUserId(null);
      return;
    }

    const userWishlistKey = `wishlist_${userId}`;
    const savedWishlist = localStorage.getItem(userWishlistKey);

    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch {
        setWishlistItems([]);
      }
    } else {
      // Migrate the old Wishlist for the first logged-in user
      const oldWishlist = localStorage.getItem("wishlist");

      if (oldWishlist) {
        try {
          const parsedWishlist = JSON.parse(oldWishlist);

          setWishlistItems(parsedWishlist);

          localStorage.setItem(
            userWishlistKey,
            JSON.stringify(parsedWishlist)
          );
        } catch {
          setWishlistItems([]);
        }

        localStorage.removeItem("wishlist");
      } else {
        setWishlistItems([]);
      }
    }

    setLoadedUserId(userId);
  }, [userId, authLoading]);

  // Save Wishlist only for the correct logged-in user
  useEffect(() => {
    if (!userId || loadedUserId !== userId) return;

    localStorage.setItem(
      `wishlist_${userId}`,
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems, userId, loadedUserId]);

  // Add product to Wishlist
  const addToWishlist = (product) => {
    setWishlistItems((prevItems) => {
      const alreadyExists = prevItems.some(
        (item) => item._id === product._id
      );

      if (alreadyExists) return prevItems;

      return [...prevItems, product];
    });
  };

  // Remove product from Wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
