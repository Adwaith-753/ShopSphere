import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { cancelMyOrder, getMyOrders } from "../../services/orderService.js";
import "./Orders.css";

function Orders() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        const data = await getMyOrders(token);
        if (active) setOrders(data.orders || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) fetchOrders();

    return () => {
      active = false;
    };
  }, [token]);

  const handleCancel = async (orderId) => {
    try {
      const data = await cancelMyOrder(orderId, token);
      setOrders((current) =>
        current.map((order) =>
          order._id === orderId ? data.order : order
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <main className="orders-page">Loading orders...</main>;

  return (
    <main className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        {error && <div className="orders-error">{error}</div>}
        {orders.length === 0 ? (
          <p>You have not placed any orders yet.</p>
        ) : (
          orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`order-status ${order.status}`}>
                  {order.status}
                </span>
              </div>

              {order.items.map((item) => (
                <div className="order-item" key={`${order._id}-${item.product}`}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                </div>
              ))}

              <div className="order-card-footer">
                <strong>Total: ₹{order.total.toLocaleString("en-IN")}</strong>
                {["placed", "confirmed"].includes(order.status) && (
                  <button type="button" onClick={() => handleCancel(order._id)}>
                    Cancel Order
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

export default Orders;
