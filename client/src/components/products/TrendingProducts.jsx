
import "./TrendingProducts.css";

const trendingProducts = [
  { id: 1, name: "Gaming Laptop", price: 59999, emoji: "💻" },
  { id: 2, name: "Running Shoes", price: 2999, emoji: "👟" },
  { id: 3, name: "Smart Phone", price: 18999, emoji: "📱" },
  { id: 4, name: "Digital Camera", price: 25999, emoji: "📷" },
];

function TrendingProducts() {
  return (
    <section className="trending-section">
      <div className="trending-heading">
        <div>
          <h2>Trending Products</h2>
          <p>Popular products customers love</p>
        </div>
      </div>

      <div className="trending-grid">
        {trendingProducts.map((product) => (
          <div className="trending-card" key={product.id}>
            <span className="trending-badge">TRENDING</span>

            <div className="trending-image">
              <span>{product.emoji}</span>
            </div>

            <div className="trending-info">
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

export default TrendingProducts;
