
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import LogoutModal from "../../components/common/LogoutModal.jsx";
import AdminOverview from "./AdminOverview.jsx";
import AdminWorkspace from "./AdminWorkspace.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faArrowLeft,
  faGaugeHigh,
  faBox,
  faLayerGroup,
  faBoxesStacked,
  faCartShopping,
  faUsers,
  faBullhorn,
  faStar,
  faCreditCard,
  faChartLine,
  faWandMagicSparkles,
  faGear,
  faClock,
  faStore,
  faUserShield,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, token, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Confirmed logout
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { icon: faGaugeHigh, name: "Dashboard" },
    { icon: faBox, name: "Products" },
    { icon: faLayerGroup, name: "Categories" },
    { icon: faBoxesStacked, name: "Inventory" },
    { icon: faCartShopping, name: "Orders" },
    { icon: faUsers, name: "Customers" },
    {
      icon: faStore,
      name: "Seller Applications",
      path: "/admin/seller-applications",
    },
    { icon: faBullhorn, name: "Marketing" },
    { icon: faStar, name: "Reviews" },
    { icon: faCreditCard, name: "Payments" },
    { icon: faChartLine, name: "Analytics" },
    { icon: faWandMagicSparkles, name: "AI Assistant" },
    { icon: faGear, name: "Admin Settings" },
    { icon: faClock, name: "Activity Logs" },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>ShopSphere</h2>
          <span>ADMIN PANEL</span>
        </div>

        <nav className="admin-navigation">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`admin-nav-item ${item.name === activeTab ? "active" : ""}`}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  setActiveTab(item.name);
                }
              }}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="admin-nav-icon"
              />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            onClick={() => navigate("/")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Shop</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h3>ShopSphere Admin</h3>
            <p>Store Management</p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              <FontAwesomeIcon icon={faUserShield} />
            </div>

            <span>{user?.name || "Administrator"}</span>

            <button
              type="button"
              className="admin-logout-btn"
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <section className="admin-content">
          {activeTab === "Dashboard" ? (
            <AdminOverview token={token} />
          ) : activeTab === "Seller Applications" ? null : (
            <AdminWorkspace
              key={activeTab}
              tab={activeTab}
              token={token}
              onAdminProfileUpdated={(updatedAdmin) =>
                setUser((currentUser) => ({
                  ...currentUser,
                  name: updatedAdmin.name,
                  email: updatedAdmin.email,
                }))
              }
            />
          )}
        </section>
      </main>

      {/* Reusable Logout Confirmation Popup */}
      <LogoutModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

export default AdminDashboard;
