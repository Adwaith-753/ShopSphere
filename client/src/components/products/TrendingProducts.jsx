
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import "./TrendingProducts.css";

function TrendingProducts() {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((items) =>
        setTrendingProducts(
          items.filter((item) => item.isTrending).slice(0, 4)
        )
      )
      .catch(() => setTrendingProducts([]));
  }, []);

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
          <div className="trending-card" key={product._id}>
            <span className="trending-badge">TRENDING</span>

            <div className="trending-image">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.name} />
              ) : (
                <span>{product.name}</span>
              )}
            </div>

            <div className="trending-info">
              <h3>{product.name}</h3>
              <p>₹{product.price.toLocaleString("en-IN")}</p>
              <button
                type="button"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                View Product
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrendingProducts;
