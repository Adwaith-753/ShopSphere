
/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);

  // Get the correct user ID
  const userId = user?.id || user?._id;

  // Load the cart belonging to the logged-in user
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setCartItems([]);
      setLoadedUserId(null);
      return;
    }

    const userCartKey = `cart_${userId}`;
    const savedCart = localStorage.getItem(userCartKey);

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    } else {
      // Migrate the old cart for the first logged-in user
      const oldCart = localStorage.getItem("cart");

      if (oldCart) {
        try {
          const parsedCart = JSON.parse(oldCart);
          setCartItems(parsedCart);

          localStorage.setItem(
            userCartKey,
            JSON.stringify(parsedCart)
          );
        } catch {
          setCartItems([]);
        }

        localStorage.removeItem("cart");
      } else {
        setCartItems([]);
      }
    }

    setLoadedUserId(userId);
  }, [userId, authLoading]);

  // Save cart only for the correct logged-in user
  useEffect(() => {
    if (!userId || loadedUserId !== userId) return;

    localStorage.setItem(
      `cart_${userId}`,
      JSON.stringify(cartItems)
    );
  }, [cartItems, userId, loadedUserId]);

  // Add product to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { ...product, quantity }];
    });
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId)
    );
  };

  // Clear all products from cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Update product quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
