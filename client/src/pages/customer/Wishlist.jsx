
import { useContext } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { WishlistContext } from "../../context/WishlistContext.jsx";
import { CartContext } from "../../context/CartContext.jsx";
import "./Wishlist.css";

function Wishlist() {
  const { wishlistItems, removeFromWishlist } =
    useContext(WishlistContext);

  const { addToCart } = useContext(CartContext);

  // Move product to cart
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  // Empty Wishlist
  if (wishlistItems.length === 0) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-empty">
          <Heart size={65} />
          <h1>Your Wishlist is Empty</h1>
          <p>
            You haven't saved any products yet.
            Explore our products and add your favourites!
          </p>
          <Link to="/products" className="wishlist-shop-btn">
            Explore Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Wishlist</h1>

        <p className="wishlist-count">
          {wishlistItems.length} saved product(s)
        </p>

        <div className="wishlist-grid">
          {wishlistItems.map((product) => (
            <div className="wishlist-card" key={product._id}>
              <div className="wishlist-product-info">
                <span className="wishlist-category">
                  {product.category}
                </span>

                <h2>{product.name}</h2>

                <p>{product.description}</p>

                <h3>
                  ₹{product.price.toLocaleString("en-IN")}
                </h3>
              </div>

              <div className="wishlist-actions">
                <button
                  type="button"
                  className="wishlist-add-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart size={17} />
                  Add to Cart
                </button>

                <button
                  type="button"
                  className="wishlist-remove-btn"
                  onClick={() => removeFromWishlist(product._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Wishlist;
