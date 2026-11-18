import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <div className="product-card">
      <div className="product-card-info">
        <p>{product.category}</p>

        <h3>{product.name}</h3>

        <p>{product.description}</p>

        <h4>₹{product.price.toLocaleString("en-IN")}</h4>

        <button onClick={() => navigate(`/products/${product._id}`)}>
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
