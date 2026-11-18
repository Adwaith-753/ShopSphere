
import "./Newsletter.css";

function Newsletter() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <h2>Stay Updated with ShopSphere!</h2>

        <p>
          Subscribe to receive the latest products,
          exclusive offers and shopping updates.
        </p>

        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email address"
          />

          <button type="button">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
