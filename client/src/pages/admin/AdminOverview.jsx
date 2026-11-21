import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faChartLine,
  faClock,
  faCoins,
  faLayerGroup,
  faRotate,
  faShoppingCart,
  faStore,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { getAdminDashboardStats } from "../../services/adminService.js";

const numberFormatter = new Intl.NumberFormat("en-IN");
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

function RevenueChart({ days }) {
  const width = 640;
  const height = 220;
  const inset = 24;
  const values = days.map((day) => Number(day.revenue) || 0);
  const maximum = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x =
      inset + (index * (width - inset * 2)) / Math.max(values.length - 1, 1);
    const y = height - inset - (value / maximum) * (height - inset * 2);
    return { x, y };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${height - inset} L ${points[0].x} ${height - inset} Z`
    : "";

  return (
    <div className="admin-chart">
      {days.length ? (
        <>
          <div className="admin-chart-total">
            <strong>
              {formatCurrency(values.reduce((total, value) => total + value, 0))}
            </strong>
            <span>Gross sales - last 7 days</span>
          </div>
          <svg
            className="admin-chart-svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Gross sales during the last seven days"
          >
            {[0, 1, 2, 3].map((line) => {
              const y = inset + (line * (height - inset * 2)) / 3;
              return (
                <line
                  key={line}
                  x1={inset}
                  x2={width - inset}
                  y1={y}
                  y2={y}
                  className="admin-chart-gridline"
                />
              );
            })}
            <path d={areaPath} className="admin-chart-area" />
            <path d={linePath} className="admin-chart-line" />
            {points.map((point, index) => (
              <circle
                key={days[index].date}
                cx={point.x}
                cy={point.y}
                r="4"
                className="admin-chart-point"
              />
            ))}
          </svg>
          <div className="admin-chart-labels">
            {days.map((day) => (
              <span key={day.date}>{day.label}</span>
            ))}
          </div>
        </>
      ) : (
        <p className="admin-empty-state">No sales data is available yet.</p>
      )}
    </div>
  );
}

function AdminOverview({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = useCallback(
    () => getAdminDashboardStats(token),
    [token]
  );

  const loadDashboard = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchDashboardStats();
      setStats(data.stats);
    } catch (requestError) {
      setError(requestError.message || "Unable to load dashboard overview.");
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats, token]);

  useEffect(() => {
    let active = true;

    fetchDashboardStats()
      .then((data) => {
        if (active) {
          setStats(data.stats);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.message || "Unable to load dashboard overview."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchDashboardStats]);

  const cards = [
    { label: "Total users", value: stats?.totalUsers, icon: faUsers },
    { label: "Customers", value: stats?.users, icon: faUsers },
    { label: "Sellers", value: stats?.sellers, icon: faStore },
    { label: "Products", value: stats?.products, icon: faBox },
    { label: "Categories", value: stats?.categories, icon: faLayerGroup },
    { label: "Orders", value: stats?.orders, icon: faShoppingCart },
    {
      label: "Gross sales",
      value: stats ? formatCurrency(stats.revenue) : null,
      icon: faCoins,
    },
    {
      label: "Pending applications",
      value: stats?.pendingApplications,
      icon: faClock,
    },
  ];

  return (
    <>
      <div className="admin-overview-heading">
        <div>
          <p className="admin-eyebrow">MARKETPLACE SUMMARY</p>
          <h1>Dashboard overview</h1>
          <p>Monitor marketplace growth, orders, and seller activity.</p>
        </div>
        <button
          type="button"
          className="admin-refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRotate} spin={loading} />
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="admin-error-message" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadDashboard} disabled={loading}>
            Try again
          </button>
        </div>
      )}

      <div className="admin-stats-grid">
        {cards.map((card) => (
          <article className="admin-stat-card" key={card.label}>
            <div className="admin-stat-icon">
              <FontAwesomeIcon icon={card.icon} />
            </div>
            <div>
              <span>{card.label}</span>
              <strong>
                {loading && !stats
                  ? "--"
                  : typeof card.value === "number"
                    ? numberFormatter.format(card.value)
                    : card.value ?? "—"}
              </strong>
            </div>
          </article>
        ))}
      </div>

      {loading && !stats ? (
        <div className="admin-panel admin-loading-state">
          Loading marketplace activity...
        </div>
      ) : stats ? (
        <div className="admin-overview-columns">
          <section className="admin-panel admin-sales-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Sales performance</h2>
                <p>Daily gross sales from non-cancelled orders</p>
              </div>
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <RevenueChart days={stats.salesTrend || []} />
          </section>

          <section className="admin-panel admin-activity-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Recent activity</h2>
                <p>Latest orders and seller applications</p>
              </div>
            </div>
            {stats.recentActivity?.length ? (
              <ul className="admin-activity-list">
                {stats.recentActivity.map((activity) => (
                  <li key={activity.id}>
                    <span
                      className={`admin-activity-icon ${activity.type}`}
                      aria-hidden="true"
                    >
                      <FontAwesomeIcon
                        icon={activity.type === "order" ? faShoppingCart : faStore}
                      />
                    </span>
                    <div className="admin-activity-copy">
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                      <time dateTime={activity.createdAt}>
                        {new Date(activity.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-empty-state">No recent activity yet.</p>
            )}
          </section>

          <section className="admin-panel admin-recent-orders">
            <div className="admin-panel-heading">
              <div>
                <h2>Recent orders</h2>
                <p>The latest orders placed across the marketplace</p>
              </div>
            </div>
            {stats.recentOrders?.length ? (
              <div className="admin-orders-table-wrap">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="admin-amount-cell">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="admin-order-id">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td>{order.user?.name || "Customer"}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className={`admin-order-status ${order.status}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="admin-amount-cell">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-empty-state">No orders have been placed yet.</p>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

export default AdminOverview;
