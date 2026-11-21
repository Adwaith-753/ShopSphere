import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react";

import { WishlistContext } from "../../context/WishlistContext.jsx";
import { CartContext } from "../../context/CartContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import SuccessToast from "../common/SuccessToast.jsx";

import "./ProductCard.css";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { wishlistItems, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

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
      setSuccessMessage(`${product.name} added to your wishlist.`);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login", {
        state: { from: "/products" },
      });
      return;
    }

    if (addedToCart) return;

    addToCart(product, 1);
    setAddedToCart(true);
    setSuccessMessage(`${product.name} added to your cart.`);
  };

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="product-card">
      <button
        className={`wishlist-heart-btn ${isWishlisted ? "active" : ""}`}
        type="button"
        onClick={handleWishlist}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <button
        type="button"
        className="product-card-image-button"
        onClick={handleViewDetails}
        aria-label={`View ${product.name}`}
      >
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            className="product-card-image"
          />
        ) : (
          <div className="product-card-image-placeholder">
            {product.name}
          </div>
        )}
      </button>

      <div className="product-card-info">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <h4>₹{product.price.toLocaleString("en-IN")}</h4>

        <div className="product-card-actions">
          <button
            type="button"
            className={`product-add-cart-btn ${addedToCart ? "cart-added" : ""}`}
            onClick={handleAddToCart}
            disabled={addedToCart}
            aria-live="polite"
          >
            {addedToCart ? (
              <>
                <Check size={17} />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart size={17} />
                Add to Cart
              </>
            )}
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

      <SuccessToast
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </div>
  );
}

export default ProductCard;
