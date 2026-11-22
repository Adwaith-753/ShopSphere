import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { getMyOrderById } from "../../services/orderService.js";
import "./OrderDetails.css";

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function OrderDetails() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      try {
        const data = await getMyOrderById(id, token);
        if (active) setOrder(data.order);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) fetchOrder();

    return () => {
      active = false;
    };
  }, [id, token]);

  if (loading) {
    return <main className="order-details-page">Loading order details...</main>;
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <div className="order-details-container">
          <p className="orders-error" role="alert">
            {error || "Order not found."}
          </p>
          <Link to="/orders">Back to my orders</Link>
        </div>
      </main>
    );
  }

  const address = order.shippingAddress;

  return (
    <main className="order-details-page">
      <div className="order-details-container">
        <Link className="order-details-back" to="/orders">
          ← Back to my orders
        </Link>
        <header className="order-details-header">
          <div>
            <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p>Placed {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className={`order-status ${order.status}`}>{order.status}</span>
        </header>

        <section className="order-details-section">
          <h2>Items ({order.items.length})</h2>
          <div className="order-details-items">
            {order.items.map((item, index) => {
              const productId = item.product?._id || item.product;
              return (
                <article
                  className="order-details-item"
                  key={`${productId || item.name}-${index}`}
                >
                  <div>
                    <h3>{item.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                    <p>Unit price: {formatCurrency(item.price)}</p>
                    {order.status === "delivered" && productId && (
                      <Link to={`/products/${productId}`}>Review product</Link>
                    )}
                  </div>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </article>
              );
            })}
          </div>
          <dl className="order-details-totals">
            <div><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd></div>
            {order.discountTotal > 0 && (
              <div><dt>Discount</dt><dd>-{formatCurrency(order.discountTotal)}</dd></div>
            )}
            <div><dt>Shipping</dt><dd>{formatCurrency(order.shippingFee)}</dd></div>
            <div className="order-details-grand-total">
              <dt>Total</dt><dd>{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="order-details-section order-details-information">
          <div>
            <h2>Shipping address</h2>
            <address>
              {address.fullName}<br />
              {address.addressLine1}
              {address.addressLine2 && <><br />{address.addressLine2}</>}<br />
              {address.city}, {address.state} {address.postalCode}<br />
              {address.country}<br />
              {address.phone}
            </address>
          </div>
          <div>
            <h2>Payment</h2>
            <p>Method: {order.paymentMethod.toUpperCase()}</p>
            <p>Status: {order.paymentStatus}</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderDetails;
