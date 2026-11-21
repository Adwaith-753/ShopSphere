
import { useEffect, useState, useContext } from "react";

import {
  Heart,
  ShoppingCart,
  UserRound,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  Grid2X2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { getProducts } from "../../services/productService";
import { Link, useNavigate } from "react-router-dom";

import { CartContext } from "../../context/CartContext.jsx";
import { WishlistContext } from "../../context/WishlistContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import LogoutModal from "../common/LogoutModal.jsx";

import "./Navbar.css";

function Navbar() {
  // Navigation states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Logout popup state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Search states
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  // Cart
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.length;

  // Wishlist
  const { wishlistItems } = useContext(WishlistContext);
  const wishlistCount = wishlistItems.length;

  // Authentication
  const { user, logout, loading } = useContext(AuthContext);

  // Toggle hamburger menu
  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous);
    setIsProfileOpen(false);
  };

  // Close hamburger menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen((previous) => !previous);
  };

  // Open logout confirmation popup
  const handleLogout = () => {
    setIsProfileOpen(false);
    closeMenu();
    setShowLogoutModal(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  // Search products
  const handleSearch = () => {
    const query = searchTerm.trim();

    if (!query) return;

    setShowSuggestions(false);
    closeMenu();

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  // Fetch products
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

  // Filter products
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    );
  });

  // Get categories
  const categories = [
    ...new Set(
      products.map((product) => product.category).filter(Boolean)
    ),
  ];

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Select product suggestion
  const handleProductSelect = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);

    navigate(`/products?search=${encodeURIComponent(product.name)}`);
  };

  // Select category suggestion
  const handleCategorySelect = (category) => {
    setSearchTerm(category);
    setShowSuggestions(false);

    navigate(`/products?search=${encodeURIComponent(category)}`);
  };

  return (
    <>
      <nav className="navbar">

        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>
            <h2>ShopSphere</h2>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/products">Categories</Link>
        </div>

        {/* Search Bar */}
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

          <button type="button" onClick={handleSearch}>
            Search
          </button>

          {/* Search Suggestions */}
          {showSuggestions && searchTerm.trim() !== "" && (
            <div className="search-suggestions">

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

              {filteredCategories.length === 0 &&
                filteredProducts.length === 0 && (
                  <p>No matching products or categories found.</p>
                )}

            </div>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">

          <Link to="/wishlist">
            <Heart size={19} />
            <span>
              Wishlist {!loading && user ? `(${wishlistCount})` : ""}
            </span>
          </Link>

          <Link to="/cart">
            <ShoppingCart size={19} />
            <span>
              Cart {!loading && user ? `(${cartCount})` : ""}
            </span>
          </Link>

          {!loading &&
            (user ? (
              <div className="profile-dropdown-container">

                {/* Desktop Profile Button */}
                <button
                  type="button"
                  className="profile-toggle-btn"
                  onClick={toggleProfile}
                  aria-expanded={isProfileOpen}
                >
                  <UserRound size={20} />

                  <span>{user.name}</span>

                  <ChevronDown
                    size={16}
                    className={
                      isProfileOpen
                        ? "profile-chevron active"
                        : "profile-chevron"
                    }
                  />
                </button>

                {/* Desktop Profile Dropdown */}
                {isProfileOpen && (
                  <div className="profile-dropdown">

                    <div className="profile-dropdown-header">
                      <div className="profile-avatar">
                        <UserRound size={28} />
                      </div>

                      <div className="profile-user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    {/* View Profile */}
                    <button
                      type="button"
                      className="profile-dropdown-item"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <UserRound size={19} />
                      <span>View Profile</span>
                      <ChevronRight size={17} />
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      className="profile-dropdown-item profile-logout-item"
                      onClick={handleLogout}
                    >
                      <LogOut size={19} />
                      <span>Logout</span>
                      <ChevronRight size={17} />
                    </button>

                  </div>
                )}

              </div>
            ) : (
              <Link to="/login">
                <UserRound size={19} />
                <span>Login</span>
              </Link>
            ))}

        </div>

        {/* Mobile Actions */}
        <div className="mobile-navbar-actions">

          {/* Mobile Cart */}
          <Link
            to="/cart"
            className="mobile-icon-link"
            aria-label="Cart"
            onClick={closeMenu}
          >
            <ShoppingCart size={22} />

            {!loading && user && cartCount > 0 && (
              <span className="mobile-count">{cartCount}</span>
            )}
          </Link>

          {/* Mobile Profile */}
          {!loading &&
            (user ? (
              <div className="mobile-profile-container">

                <button
                  type="button"
                  className="mobile-profile-toggle"
                  onClick={toggleProfile}
                  aria-label="Open profile"
                  aria-expanded={isProfileOpen}
                >
                  <UserRound size={23} />
                </button>

                {/* Mobile Profile Dropdown */}
                {isProfileOpen && (
                  <div className="profile-dropdown mobile-profile-dropdown">

                    <div className="profile-dropdown-header">
                      <div className="profile-avatar">
                        <UserRound size={28} />
                      </div>

                      <div className="profile-user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    {/* View Profile */}
                    <button
                      type="button"
                      className="profile-dropdown-item"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <UserRound size={19} />
                      <span>View Profile</span>
                      <ChevronRight size={17} />
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      className="profile-dropdown-item profile-logout-item"
                      onClick={handleLogout}
                    >
                      <LogOut size={19} />
                      <span>Logout</span>
                      <ChevronRight size={17} />
                    </button>

                  </div>
                )}

              </div>
            ) : (
              <Link
                to="/login"
                className="mobile-icon-link"
                aria-label="Login"
              >
                <UserRound size={23} />
              </Link>
            ))}

        </div>

        {/* Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Hamburger Menu */}
        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>

          <div className="mobile-menu-links">

            <Link to="/" onClick={closeMenu}>
              <Home size={19} />
              Home
            </Link>

            <Link to="/products" onClick={closeMenu}>
              <Package size={19} />
              Products
            </Link>

            <Link to="/products" onClick={closeMenu}>
              <Grid2X2 size={19} />
              Categories
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" onClick={closeMenu}>
              <Heart size={19} />
              Wishlist
              {!loading && user && ` (${wishlistCount})`}
            </Link>

          </div>
        </div>

      </nav>

      {/* Shared Logout Confirmation Popup */}
      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

export default Navbar;
