
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
          <a href="/">Home</a>
          <a href="/categories">Categories</a>
          <a href="/wishlist">Wishlist</a>
          <a href="/cart">Shopping Cart</a>
        </div>

        <div className="footer-column">
          <h3>Customer Support</h3>
          <a href="/help">Help Center</a>
          <a href="/orders">Track Orders</a>
          <a href="/returns">Returns & Refunds</a>
          <a href="/contact">Contact Us</a>
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
