import { Link } from "react-router-dom";
import "./Support.css";

function Support() {
  return (
    <main className="support-page">
      <div className="support-container">
        <h1>ShopSphere Customer Support</h1>
        <p>
          Find help with orders, account access, returns and product questions.
        </p>

        <div className="support-grid">
          <article>
            <h2>Track an Order</h2>
            <p>View order status and cancel eligible orders.</p>
            <Link to="/orders">View My Orders</Link>
          </article>
          <article>
            <h2>Manage Your Account</h2>
            <p>Update profile details or change your password.</p>
            <Link to="/profile">Open Profile</Link>
          </article>
          <article>
            <h2>Contact ShopSphere</h2>
            <p>Email: support@shopsphere.com</p>
            <p>Phone: +91 9876543210</p>
          </article>
        </div>
      </div>
    </main>
  );
}

export default Support;
