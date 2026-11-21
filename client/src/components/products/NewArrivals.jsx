
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import "./NewArrivals.css";

function NewArrivals() {
  const [newProducts, setNewProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((items) => setNewProducts(items.slice(0, 4)))
      .catch(() => setNewProducts([]));
  }, []);

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
          <div className="new-arrival-card" key={product._id}>
            <span className="new-arrival-badge">NEW</span>

            <div className="new-arrival-image">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.name} />
              ) : (
                <span>{product.name}</span>
              )}
            </div>

            <div className="new-arrival-info">
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

export default NewArrivals;
