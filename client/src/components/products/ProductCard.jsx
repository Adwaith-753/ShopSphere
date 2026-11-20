import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Heart, ShoppingCart } from "lucide-react";

import { WishlistContext } from "../../context/WishlistContext.jsx";
import { CartContext } from "../../context/CartContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

import "./ProductCard.css";

function ProductCard({ product }) {
  const navigate = useNavigate();

  // Wishlist information
  const { wishlistItems, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);

  // Cart information
  const { addToCart } = useContext(CartContext);

  // Authentication information
  const { user } = useContext(AuthContext);

  // Check whether product is already in Wishlist
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  // Toggle Wishlist
  const handleWishlist = () => {
    if (!user) {
      navigate("/login", {
        state: { from: "/products" },
      });
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // Add product to Cart
  const handleAddToCart = () => {
    if (!user) {
      navigate("/login", {
        state: { from: "/products" },
      });
      return;
    }

    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  // View product details
  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="product-card">
      {/* Wishlist Button */}
      <button
        className={`wishlist-heart-btn ${isWishlisted ? "active" : ""}`}
        type="button"
        onClick={handleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <div className="product-card-info">
        <p>{product.category}</p>

        <h3>{product.name}</h3>

        <p>{product.description}</p>

        <h4>₹{product.price.toLocaleString("en-IN")}</h4>

        {/* Product Action Buttons */}
        <div className="product-card-actions">
          <button
            type="button"
            className="product-add-cart-btn"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={17} />
            Add to Cart
          </button>

          <button
            type="button"
            className="product-view-details-btn"
            onClick={handleViewDetails}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
