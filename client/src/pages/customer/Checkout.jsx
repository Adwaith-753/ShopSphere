import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { CartContext } from "../../context/CartContext.jsx";
import { createOrder, validateCoupon } from "../../services/orderService.js";
import "./Checkout.css";

function Checkout() {
  const { token, user } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountedTotal = Math.max(
    0,
    total - (appliedCoupon?.discount || 0)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  };

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    setCouponMessage("");
    setAppliedCoupon(null);
    setValidatingCoupon(true);

    try {
      const result = await validateCoupon(couponCode, total, token);
      setAppliedCoupon(result);
      setCouponMessage(`${result.code} applied.`);
    } catch (requestError) {
      setCouponMessage(requestError.message || "Unable to apply coupon.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Please log in to place an order.");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        shippingAddress: address,
        paymentMethod: "cod",
        couponCode: appliedCoupon?.code || "",
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      };

      await createOrder(orderData, token);
      clearCart();
      navigate("/orders", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to place the order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h1>Your cart is empty</h1>
          <Link to="/products">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        {error && <div className="checkout-error">{error}</div>}

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Shipping Address</h2>

            {[
              ["fullName", "Full name"],
              ["phone", "Phone number"],
              ["addressLine1", "Address line 1"],
              ["addressLine2", "Address line 2 (optional)"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "Postal code"],
              ["country", "Country"],
            ].map(([name, label]) => (
              <label key={name}>
                {label}
                <input
                  name={name}
                  value={address[name]}
                  onChange={handleChange}
                  required={name !== "addressLine2"}
                />
              </label>
            ))}

            <fieldset>
              <legend>Payment Method</legend>
              <label>
                <input type="radio" name="payment" checked readOnly />
                Cash on Delivery
              </label>
            </fieldset>

            <button type="submit" disabled={submitting}>
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            {cartItems.map((item) => (
              <div className="checkout-item" key={item._id}>
                <span>{item.name} × {item.quantity}</span>
                <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
              </div>
            ))}
            <div className="checkout-total">
              <span>Total</span>
              <strong>₹{discountedTotal.toLocaleString("en-IN")}</strong>
            </div>
            <form className="checkout-coupon" onSubmit={handleApplyCoupon}>
              <label htmlFor="checkout-coupon-code">Coupon code</label>
              <div>
                <input
                  id="checkout-coupon-code"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value);
                    setAppliedCoupon(null);
                    setCouponMessage("");
                  }}
                  maxLength={30}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                >
                  {validatingCoupon ? "Checking..." : "Apply"}
                </button>
              </div>
              {couponMessage && (
                <p
                  className={appliedCoupon ? "coupon-success" : "coupon-error"}
                  role={appliedCoupon ? "status" : "alert"}
                >
                  {couponMessage}
                </p>
              )}
            </form>
            {appliedCoupon && (
              <div className="checkout-discount">
                <span>Discount</span>
                <strong>-₹{appliedCoupon.discount.toLocaleString("en-IN")}</strong>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
