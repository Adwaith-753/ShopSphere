
import { useState } from "react";
import { API_BASE_URL } from "../../config/api.js";
import "./Newsletter.css";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMessage(data.message);
      setEmail("");
    } catch (error) {
      setMessage(error.message || "Unable to subscribe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <h2>Stay Updated with ShopSphere!</h2>

        <p>
          Subscribe to receive the latest products,
          exclusive offers and shopping updates.
        </p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {message && <p className="newsletter-message">{message}</p>}
      </div>
    </section>
  );
}

export default Newsletter;
