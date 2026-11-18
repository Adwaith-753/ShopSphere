
import "./HeroBanner.css";

function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <p className="hero-subtitle">WELCOME TO SHOPSPHERE</p>

        <h1>
          Discover Amazing Products
          <br />
          At Great Prices
        </h1>

        <p className="hero-description">
          Find everything you need in one place.
          Enjoy shopping with amazing deals and offers.
        </p>

        <button className="hero-button">
          Shop Now
        </button>
      </div>
    </section>
  );
}

export default HeroBanner;
