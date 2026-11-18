
import "./OffersSection.css";

const offers = [
  {
    id: 1,
    title: "Electronics Sale",
    discount: "Up to 40% OFF",
    description: "Discover amazing electronics deals.",
    emoji: "💻",
  },
  {
    id: 2,
    title: "Fashion Deals",
    discount: "Up to 50% OFF",
    description: "Upgrade your style for less.",
    emoji: "👕",
  },
];

function OffersSection() {
  return (
    <section className="offers-section">
      <h2>Special Offers</h2>
      <p className="offers-subtitle">
        Don't miss our exclusive shopping deals
      </p>

      <div className="offers-grid">
        {offers.map((offer) => (
          <div className="offer-card" key={offer.id}>
            <div className="offer-content">
              <span className="offer-emoji">{offer.emoji}</span>
              <h3>{offer.title}</h3>
              <h4>{offer.discount}</h4>
              <p>{offer.description}</p>
              <button>Explore Deals</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default OffersSection;
