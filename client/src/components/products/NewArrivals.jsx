
import "./NewArrivals.css";

const newProducts = [
  { id: 1, name: "Wireless Earbuds", price: 1299, emoji: "🎧" },
  { id: 2, name: "Travel Backpack", price: 1799, emoji: "🎒" },
  { id: 3, name: "Smart LED Lamp", price: 899, emoji: "💡" },
  { id: 4, name: "Fitness Band", price: 1999, emoji: "⌚" },
];

function NewArrivals() {
  return (
    <section className="new-arrivals-section">
      <div className="new-arrivals-heading">
        <div>
          <h2>New Arrivals</h2>
          <p>Check out our latest products</p>
        </div>
      </div>

      <div className="new-arrivals-grid">
        {newProducts.map((product) => (
          <div className="new-arrival-card" key={product.id}>
            <span className="new-arrival-badge">NEW</span>

            <div className="new-arrival-image">
              <span>{product.emoji}</span>
            </div>

            <div className="new-arrival-info">
              <h3>{product.name}</h3>
              <p>₹{product.price.toLocaleString("en-IN")}</p>
              <button>View Product</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NewArrivals;
