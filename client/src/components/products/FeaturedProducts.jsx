
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import "./FeaturedProducts.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((items) =>
        setProducts(
          items.filter((item) => item.isFeatured).slice(0, 4)
        )
      )
      .catch(() => setProducts([]));
  }, []);

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
          <div className="product-card" key={product._id}>
            <div className="product-image">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.name} />
              ) : (
                <span>{product.name}</span>
              )}
            </div>

            <div className="product-info">
              <p className="product-category">{product.category}</p>
              <h3>{product.name}</h3>
              <p className="product-price">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <button
                type="button"
                className="product-button"
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

export default FeaturedProducts;
