import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addProductReview,
  getProductById,
  reportProductReview,
} from "../../services/productService";
import { CartContext } from "../../context/CartContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import ProductDetailsSkeleton from "../../components/products/ProductDetailsSkeleton";
import SuccessToast from "../../components/common/SuccessToast.jsx";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  // Access the Cart Context
  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reportedReviews, setReportedReviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const selectedProduct = await getProductById(id);
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

    if (addedToCart) return;

    addToCart(product, quantity);
    setAddedToCart(true);
    setSuccessMessage(`${product.name} added to your cart.`);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate("/login", {
        state: { from: `/products/${id}` },
      });
      return;
    }

    addToCart(product, quantity);
    navigate("/checkout");
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewMessage("");
    try {
      const result = await addProductReview(
        id,
        { rating: Number(reviewRating), comment: reviewComment },
        token
      );
      setProduct(await getProductById(id));
      setReviewComment("");
      setReviewMessage(result.message);
    } catch (reviewRequestError) {
      setReviewError(reviewRequestError.message);
    }
  };

  const handleReportReview = async (review) => {
    const reason = window.prompt("Why should an admin review this review?");
    if (reason === null) return;
    setReviewError("");
    setReviewMessage("");
    try {
      const result = await reportProductReview(id, review._id, reason, token);
      setReportedReviews((current) => [...current, review._id]);
      setReviewMessage(result.message);
    } catch (reviewRequestError) {
      setReviewError(reviewRequestError.message);
    }
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (error) {
    return <main className="product-details-page">{error}</main>;
  }

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        {/* Product Image Section */}
        <div className="product-details-image">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
            />
          ) : (
            <h2>{product.name}</h2>
          )}
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
                onClick={() =>
                  setQuantity((prev) =>
                    typeof product.stock === "number"
                      ? Math.min(product.stock, prev + 1)
                      : prev + 1
                  )
                }
                disabled={
                  typeof product.stock === "number" &&
                  quantity >= product.stock
                }
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
              className={`add-to-cart-btn ${addedToCart ? "cart-added" : ""}`}
              type="button"
              onClick={handleAddToCart}
              disabled={addedToCart}
              aria-live="polite"
            >
              {addedToCart ? (
                <>
                  <span>✓</span>
                  Added to Cart
                </>
              ) : (
                "Add to Cart"
              )}
            </button>

            <button className="buy-now-btn" type="button" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <section className="product-reviews" aria-labelledby="product-reviews-title">
        <h2 id="product-reviews-title">Customer reviews</h2>
        {reviewError && <p className="product-review-error" role="alert">{reviewError}</p>}
        {reviewMessage && <p className="product-review-message" role="status">{reviewMessage}</p>}
        {product.reviews?.length ? (
          <div className="product-review-list">
            {product.reviews.map((review) => {
              const isAuthor =
                review.user?._id === user?._id || review.user === user?._id;
              return (
                <article className="product-review-card" key={review._id}>
                  <div className="product-review-heading">
                    <strong>{review.user?.name || "Shopper"}</strong>
                    <span>{review.rating}/5</span>
                  </div>
                  <p>{review.comment || "No written comment."}</p>
                  {user && !isAuthor && (
                    <button
                      type="button"
                      className="product-review-report"
                      disabled={reportedReviews.includes(review._id)}
                      onClick={() => handleReportReview(review)}
                    >
                      {reportedReviews.includes(review._id) ? "Reported" : "Report review"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
        {user?.role === "customer" && (
          <form className="product-review-form" onSubmit={handleReviewSubmit}>
            <h3>Write a review</h3>
            <label>
              Rating
              <select
                value={reviewRating}
                onChange={(event) => setReviewRating(event.target.value)}
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} / 5</option>
                ))}
              </select>
            </label>
            <label>
              Comment
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                maxLength={1000}
                rows={4}
              />
            </label>
            <button type="submit">Submit review</button>
          </form>
        )}
      </section>

      <SuccessToast
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
    </main>
  );
}

export default ProductDetails;
