
import "./AdminDashboard.css";

function AdminDashboard() {
  const menuItems = [
    { icon: "▦", name: "Dashboard" },
    { icon: "□", name: "Products" },
    { icon: "▤", name: "Categories" },
    { icon: "▥", name: "Inventory" },
    { icon: "🛍", name: "Orders" },
    { icon: "♙", name: "Customers" },
    { icon: "％", name: "Marketing" },
    { icon: "☆", name: "Reviews" },
    { icon: "▣", name: "Payments" },
    { icon: "▥", name: "Analytics" },
    { icon: "✧", name: "AI Assistant" },
    { icon: "⚙", name: "Admin Settings" },
  ];

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <h2>ShopSphere</h2>
          <span>ADMIN PANEL</span>
        </div>

        <nav className="admin-navigation">
          {menuItems.map((item, index) => (
            <div
              key={item.name}
              className={`admin-nav-item ${
                index === 0 ? "active" : ""
              }`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button">
            ← Back to Shop
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <h3>ShopSphere Admin</h3>
            <p>Store Management</p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <span>Administrator</span>
          </div>
        </header>

        <section className="admin-content">

          <div className="admin-welcome">
            <h1>Welcome to ShopSphere Admin!</h1>
            <p>
              Manage your store, products, customers and orders
              from one place.
            </p>
          </div>

          <div className="admin-placeholder">
            <h2>Dashboard Overview</h2>
            <p>
              Your store statistics and analytics will appear here.
            </p>
          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;
