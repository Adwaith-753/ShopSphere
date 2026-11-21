
import { useNavigate } from "react-router-dom";
import "./CategorySection.css";

const categories = [
  { id: 1, name: "Electronics", icon: "💻" },
  { id: 2, name: "Fashion", icon: "👕" },
  { id: 3, name: "Home & Living", icon: "🏠" },
  { id: 4, name: "Beauty & Personal Care", icon: "💄" },
  { id: 5, name: "Sports & Fitness", icon: "⚽" },
  { id: 6, name: "Books", icon: "📚" },
];

function CategorySection() {
  const navigate = useNavigate();

  return (
    <section className="category-section">
      <h2>Shop By Category</h2>
      <p className="category-subtitle">
        Explore our popular shopping categories
      </p>

      <div className="category-grid">
        {categories.map((category) => (
          <button
            type="button"
            className="category-card"
            key={category.id}
            onClick={() =>
              navigate(`/products?search=${encodeURIComponent(category.name)}`)
            }
          >
            <span className="category-icon">{category.icon}</span>
            <h3>{category.name}</h3>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
