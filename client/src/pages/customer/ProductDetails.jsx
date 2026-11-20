import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { CartContext } from "../../context/CartContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  // Access the Cart Context
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const products = await getProducts();

        const selectedProduct = products.find((item) => item._id === id);

        if (!selectedProduct) {
          setError("Product not found.");
          return;
        }

        setProduct(selectedProduct);
      } catch {
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Add product to cart
  const handleAddToCart = () => {
    if (!user) {
      navigate("/login", {
        state: { from: `/products/${id}` },
      });

      return;
    }

    addToCart(product, quantity);
    alert(`${product.name} added to cart!`);
  };
  if (loading) {
    return (
      <main className="product-details-page">Loading product details...</main>
    );
  }

  if (error) {
    return <main className="product-details-page">{error}</main>;
  }

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        {/* Product Image Section */}
        <div className="product-details-image">
          <h2>Product Image Coming Soon</h2>
        </div>

        {/* Product Information Section */}
        <div className="product-details-info">
          <span className="product-details-category">{product.category}</span>

          <h1 className="product-details-name">{product.name}</h1>

          <p className="product-details-description">{product.description}</p>

          <h2 className="product-details-price">
            ₹{product.price.toLocaleString("en-IN")}
          </h2>

          {/* Quantity Selector */}
          <div className="product-quantity">
            <span>Quantity:</span>

            <div className="quantity-controls">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity === 1}
              >
                -
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="product-total-price">
            <span>Total Price:</span>

            <h3>₹{(product.price * quantity).toLocaleString("en-IN")}</h3>
          </div>

          {/* Action Buttons */}
          <div className="product-action-buttons">
            <button
              className="add-to-cart-btn"
              type="button"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <button className="buy-now-btn" type="button">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
