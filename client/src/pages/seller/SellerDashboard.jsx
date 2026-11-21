
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LogoutModal from "../../components/common/LogoutModal.jsx";
import {
  createSellerProduct,
  deleteSellerProduct,
  getMySellerProducts,
  getMySellerOrders,
  getProductCategories,
  updateSellerProduct,
} from "../../services/sellerService.js";

import {
  faGaugeHigh,
  faBox,
  faBoxesStacked,
  faCartShopping,
  faChartLine,
  faStar,
  faWallet,
  faStore,
  faGear,
  faArrowRightFromBracket,
  faArrowRight,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

import "./SellerDashboard.css";

function SellerDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [productError, setProductError] = useState("");
  const [productLoading, setProductLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Electronics",
    stock: "",
    images: [],
  });

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        const [productData, orderData, categoryData] = await Promise.all([
          getMySellerProducts(token),
          getMySellerOrders(token),
          getProductCategories(),
        ]);
        if (active) {
          setProducts(productData.products || []);
          setSellerOrders(orderData.orders || []);
          setCategories(categoryData);
        }
      } catch (error) {
        if (active) setProductError(error.message);
      } finally {
        if (active) setProductLoading(false);
      }
    };

    if (token) fetchProducts();

    return () => {
      active = false;
    };
  }, [token]);

  const handleProductFormChange = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setProductError("");

    try {
      const data = await createSellerProduct({
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      }, token);
      setProducts((current) => [data.product, ...current]);
      setShowProductForm(false);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "Electronics",
        stock: "",
        images: [],
      });
    } catch (error) {
      setProductError(error.message);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const data = await updateSellerProduct(
        product._id,
        { status: product.status === "inactive" ? "active" : "inactive" },
        token
      );
      setProducts((current) =>
        current.map((item) => item._id === product._id ? data.product : item)
      );
    } catch (error) {
      setProductError(error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteSellerProduct(productId, token);
      setProducts((current) =>
        current.filter((product) => product._id !== productId)
      );
    } catch (error) {
      setProductError(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { icon: faGaugeHigh, name: "Dashboard" },
    { icon: faBox, name: "My Products" },
    { icon: faBoxesStacked, name: "Inventory" },
    { icon: faCartShopping, name: "Orders" },
    { icon: faChartLine, name: "Sales Analytics" },
    { icon: faWallet, name: "Earnings" },
    { icon: faStar, name: "Reviews" },
    { icon: faStore, name: "Store Profile" },
    { icon: faGear, name: "Settings" },
  ];

  const sellerRevenue = sellerOrders.reduce(
    (total, order) =>
      total +
      order.items
        .filter((item) => item.seller?.toString() === user?.id)
        .reduce(
          (itemTotal, item) =>
            itemTotal + item.price * item.quantity,
          0
        ),
    0
  );

  const lowStockCount = products.filter(
    (product) => product.stock <= 5
  ).length;

  const reviewCount = products.reduce(
    (total, product) => total + (product.reviews?.length || 0),
    0
  );

  return (
    <>
      <div className="seller-dashboard-layout">

        {/* Seller Sidebar */}
        <aside className="seller-dashboard-sidebar">

          <div className="seller-dashboard-brand">
            <h2>ShopSphere</h2>
            <span>SELLER CENTRE</span>
          </div>

          <div className="seller-dashboard-store">
            <div className="seller-store-avatar">
              <FontAwesomeIcon icon={faStore} />
            </div>

            <div>
              <strong>My Store</strong>
              <span>Seller Account</span>
            </div>
          </div>

          <nav className="seller-dashboard-navigation">
            {menuItems.map((item, index) => (
              <button
                type="button"
                key={item.name}
                className={
                  index === 0
                    ? "seller-dashboard-nav-item active"
                    : "seller-dashboard-nav-item"
                }
              >
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="seller-dashboard-sidebar-footer">
            <button
              type="button"
              onClick={() => navigate("/")}
            >
              <FontAwesomeIcon icon={faHouse} />
              Switch to Shopping
            </button>
          </div>

        </aside>

        {/* Seller Main Content */}
        <main className="seller-dashboard-main">

          <header className="seller-dashboard-topbar">

            <div>
              <h2>Seller Dashboard</h2>
              <p>Manage your ShopSphere store</p>
            </div>

            <div className="seller-dashboard-user">

              <div className="seller-dashboard-avatar">
                {user?.name?.charAt(0).toUpperCase() || "S"}
              </div>

              <div>
                <strong>{user?.name || "Seller"}</strong>
                <span>Verified Seller</span>
              </div>

              <button
                type="button"
                className="seller-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                Logout
              </button>

            </div>

          </header>

          <section className="seller-dashboard-content">

            <div className="seller-dashboard-welcome">

              <div>
                <h1>Welcome back, {user?.name || "Seller"}!</h1>

                <p>
                  Here's your seller workspace. Manage your store
                  and grow your business with ShopSphere.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
              >
                Visit Shop
                <FontAwesomeIcon icon={faArrowRight} />
              </button>

            </div>

            <div className="seller-dashboard-stats">

              <div className="seller-dashboard-stat-card">
                <span>Total Products</span>
                <h2>{productLoading ? "--" : products.length}</h2>
                <small>Products in your store</small>
              </div>

              <div className="seller-dashboard-stat-card">
                <span>Total Orders</span>
                <h2>{sellerOrders.length}</h2>
                <small>Orders received</small>
              </div>

              <div className="seller-dashboard-stat-card">
                <span>Total Revenue</span>
                <h2>₹{sellerRevenue.toLocaleString("en-IN")}</h2>
                <small>Your store revenue</small>
              </div>

              <div className="seller-dashboard-stat-card">
                <span>Customer Reviews</span>
                <h2>{reviewCount}</h2>
                <small>Reviews on your products</small>
              </div>

            </div>

            <div className="seller-dashboard-overview">
              <div className="seller-products-heading">
                <div>
                  <h2>My Products</h2>
                  <p>
                    Manage the products in your store.
                    {lowStockCount > 0
                      ? ` ${lowStockCount} product(s) have 5 or fewer items in stock.`
                      : " Stock levels are healthy."}
                  </p>
                </div>
                <button type="button" onClick={() => setShowProductForm((shown) => !shown)}>
                  {showProductForm ? "Close" : "Add Product"}
                </button>
              </div>

              {productError && (
                <p className="seller-product-error">{productError}</p>
              )}

              {showProductForm && (
                <form className="seller-product-form" onSubmit={handleCreateProduct}>
                  <label>
                    Product Name
                    <input name="name" value={productForm.name} onChange={handleProductFormChange} required />
                  </label>
                  <label>
                    Description
                    <textarea name="description" value={productForm.description} onChange={handleProductFormChange} required />
                  </label>
                  <label>
                    Price
                    <input name="price" type="number" min="0" step="0.01" value={productForm.price} onChange={handleProductFormChange} required />
                  </label>
                  <label>
                    Stock
                    <input name="stock" type="number" min="0" step="1" value={productForm.stock} onChange={handleProductFormChange} required />
                  </label>
                  <label>
                    Category
                    <select name="category" value={productForm.category} onChange={handleProductFormChange}>
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit">Create Product</button>
                </form>
              )}

              {productLoading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p>You have not created any products yet.</p>
              ) : (
                <div className="seller-products-list">
                  {products.map((product) => (
                    <article className="seller-product-row" key={product._id}>
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.category} · Stock: {product.stock}</span>
                      </div>
                      <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                      <div className="seller-product-actions">
                        <button type="button" onClick={() => handleToggleStatus(product)}>
                          {product.status === "inactive" ? "Activate" : "Deactivate"}
                        </button>
                        <button type="button" onClick={() => handleDeleteProduct(product._id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

          </section>

        </main>

      </div>

      {/* Seller Logout Confirmation */}
      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default SellerDashboard;
