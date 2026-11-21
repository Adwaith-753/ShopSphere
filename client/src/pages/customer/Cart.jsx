import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { CartContext } from "../../context/CartContext.jsx";
import "./Cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } =
    useContext(CartContext);
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );


if (cartItems.length === 0) {
  return (
    <main className="cart-page">
      <div className="cart-empty">
        <div className="empty-cart-icon">
          <ShoppingCart size={65} />
        </div>

        <h1>Your Cart is Empty!</h1>

        <p>
          Looks like you haven't added anything to your cart yet.
          Let's find something you'll love!
        </p>

        <Link to="/products" className="continue-shopping-btn">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}


  return (
    <main className="cart-page">
      <div className="cart-container">
        <h1>Your Shopping Cart</h1>

        <button className="clear-cart-btn" type="button" onClick={clearCart}>
          Clear Cart
        </button>

        <p className="cart-item-count">{totalItems} item(s) in your cart</p>

        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <div className="cart-item-image">
                {item.images?.[0]?.url ? (
                  <img
                    src={item.images[0].url}
                    alt={item.images[0].alt || item.name}
                  />
                ) : (
                  <span>{item.name}</span>
                )}
              </div>

              <div className="cart-item-details">
                <h2>{item.name}</h2>
                <p className="cart-item-category">{item.category}</p>

                <p className="cart-item-price">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>

                <div className="cart-quantity-controls">
                  <span>Quantity:</span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity === 1}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={
                      typeof item.stock === "number" &&
                      item.quantity >= item.stock
                    }
                  >
                    +
                  </button>
                </div>

                <p className="cart-item-subtotal">
                  Subtotal: ₹
                  {(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
                <button type="button" onClick={() => removeFromCart(item._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="cart-summary-row">
            <span>Total Price</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>

          <Link to="/checkout" className="cart-checkout-btn">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Cart;
