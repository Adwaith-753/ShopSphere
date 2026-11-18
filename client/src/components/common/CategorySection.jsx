
import "./CategorySection.css";

const categories = [
  { id: 1, name: "Electronics", icon: "💻" },
  { id: 2, name: "Fashion", icon: "👕" },
  { id: 3, name: "Home & Kitchen", icon: "🏠" },
  { id: 4, name: "Beauty", icon: "💄" },
  { id: 5, name: "Sports", icon: "⚽" },
  { id: 6, name: "Books", icon: "📚" },
];

function CategorySection() {
  return (
    <section className="category-section">
      <h2>Shop By Category</h2>
      <p className="category-subtitle">
        Explore our popular shopping categories
      </p>

      <div className="category-grid">
        {categories.map((category) => (
          <div className="category-card" key={category.id}>
            <span className="category-icon">{category.icon}</span>
            <h3>{category.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
