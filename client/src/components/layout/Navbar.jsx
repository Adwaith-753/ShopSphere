import { useEffect, useState } from "react";
import { Heart, ShoppingCart, UserRound } from "lucide-react";
import { getProducts } from "../../services/productService";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";

    setSearchTerm(query);
    setShowSuggestions(false);
  }, [location.search]);

  const handleSearch = () => {
    const query = searchTerm.trim();

    if (!query) {
      return;
    }

    setShowSuggestions(false);

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Unable to load search products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Find matching products
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    );
  });

  // Get unique categories
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  // Find matching categories
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  // Select a product suggestion
  const handleProductSelect = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);

    navigate(`/products?search=${encodeURIComponent(product.name)}`);
  };

  // Select a category suggestion
  const handleCategorySelect = (category) => {
    setSearchTerm(category);
    setShowSuggestions(false);

    navigate(`/products?search=${encodeURIComponent(category)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>ShopSphere</h2>
      </div>

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/categories">Categories</a>
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button onClick={handleSearch}>Search</button>

        {showSuggestions && searchTerm.trim() !== "" && (
          <div className="search-suggestions">
            {/* Category suggestions */}
            {filteredCategories.map((category) => (
              <div
                className="search-suggestion"
                key={`category-${category}`}
                onClick={() => handleCategorySelect(category)}
              >
                <strong>{category}</strong>
                <span>Category · Show matching products</span>
              </div>
            ))}

            {/* Product suggestions */}
            {filteredProducts.map((product) => (
              <div
                className="search-suggestion"
                key={product._id}
                onClick={() => handleProductSelect(product)}
              >
                <strong>{product.name}</strong>
                <span>{product.category}</span>
              </div>
            ))}

            {/* No results message */}
            {filteredCategories.length === 0 &&
              filteredProducts.length === 0 && (
                <p>No matching products or categories found.</p>
              )}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <a href="/wishlist">
          <Heart size={19} />
          <span>Wishlist</span>
        </a>

        <a href="/cart">
          <ShoppingCart size={19} />
          <span>Cart</span>
        </a>

        <a href="/login">
          <UserRound size={19} />
          <span>Login</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
