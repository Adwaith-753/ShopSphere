
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-column">
          <h2>ShopSphere</h2>
          <p>
            Your one-stop destination for quality products
            and an amazing shopping experience.
          </p>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Categories</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Shopping Cart</Link>
        </div>

        <div className="footer-column">
          <h3>Customer Support</h3>
          <Link to="/support">Help Center</Link>
          <Link to="/orders">Track Orders</Link>
          <Link to="/support">Returns & Refunds</Link>
          <Link to="/support">Contact Us</Link>
        </div>

        <div className="footer-column">
          <h3>Contact Information</h3>
          <p>Email: support@shopsphere.com</p>
          <p>Phone: +91 9876543210</p>
          <p>India</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 ShopSphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
