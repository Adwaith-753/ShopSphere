
import "./FeaturedProducts.css";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1999,
    category: "Electronics",
    emoji: "🎧",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 2499,
    category: "Electronics",
    emoji: "⌚",
  },
  {
    id: 3,
    name: "Wireless Mouse",
    price: 599,
    category: "Accessories",
    emoji: "🖱️",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: 1499,
    category: "Electronics",
    emoji: "🔊",
  },
];

function FeaturedProducts() {
  return (
    <section className="featured-section">
      <div className="featured-heading">
        <div>
          <h2>Featured Products</h2>
          <p>Discover our handpicked products</p>
        </div>
      </div>

      <div className="featured-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              <span>{product.emoji}</span>
            </div>

            <div className="product-info">
              <p className="product-category">{product.category}</p>
              <h3>{product.name}</h3>
              <p className="product-price">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <button className="product-button">
                View Product
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
