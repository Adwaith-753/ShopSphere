/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faDownload,
  faRotate,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  archiveAdminProduct,
  askAdminAssistant,
  createAdminCategory,
  createAdminProduct,
  deactivateAdminCoupon,
  deleteAdminCategory,
  deleteAdminReview,
  getAdminActivity,
  getAdminAnalytics,
  getAdminCategories,
  getAdminCoupons,
  getAdminInventory,
  getAdminOrders,
  getAdminPayments,
  getAdminProducts,
  getAdminReviews,
  getAdminSettings,
  getAdminUserDetails,
  getAdminUsers,
  restoreAdminProduct,
  saveAdminCoupon,
  setAdminUserActive,
  updateAdminCategory,
  updateAdminInventory,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  updateAdminProduct,
  updateAdminSettings,
  uploadAdminImage,
} from "../../services/adminService.js";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const formatMoney = (value) => currency.format(Number(value) || 0);
const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "Not available";

const loadModule = async (tab, token) => {
  switch (tab) {
    case "Products": {
      const [products, archived, categories] = await Promise.all([
        getAdminProducts(token),
        getAdminProducts(token, { status: "deleted" }),
        getAdminCategories(token),
      ]);
      return {
        products: [...products.products, ...archived.products],
        categories: categories.categories,
      };
    }
    case "Categories":
      return getAdminCategories(token);
    case "Inventory":
      return getAdminInventory(token);
    case "Orders":
      return getAdminOrders(token);
    case "Customers":
      return getAdminUsers(token);
    case "Marketing": {
      const [coupons, products] = await Promise.all([
        getAdminCoupons(token),
        getAdminProducts(token),
      ]);
      return { coupons: coupons.coupons, products: products.products };
    }
    case "Reviews":
      return getAdminReviews(token);
    case "Payments":
      return getAdminPayments(token);
    case "Analytics":
      return getAdminAnalytics(token);
    case "Admin Settings":
      return getAdminSettings(token);
    case "Activity Logs":
      return getAdminActivity(token);
    default:
      return {};
  }
};

function PageHeading({ title, description, onRefresh, loading }) {
  return (
    <div className="admin-module-heading">
      <div>
        <p className="admin-eyebrow">MARKETPLACE MANAGEMENT</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {onRefresh && (
        <button
          type="button"
          className="admin-refresh-btn"
          onClick={onRefresh}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRotate} spin={loading} />
          Refresh
        </button>
      )}
    </div>
  );
}

function DataTable({ children, className = "" }) {
  return (
    <div className={`admin-module-table-wrap ${className}`}>
      <table className="admin-module-table">{children}</table>
    </div>
  );
}

function CloudinaryImageField({ token, value, onChange, label = "Image URL" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const uploaded = await uploadAdminImage(file, token);
      onChange(uploaded.url);
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="admin-module-field">
      {label}
      <div className="admin-image-field">
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
        />
        <label className="admin-upload-button">
          <FontAwesomeIcon icon={faCloudArrowUp} />
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            hidden
          />
        </label>
      </div>
      {error && <span className="admin-inline-error">{error}</span>}
    </label>
  );
}

function ProductEditor({ initial, categories, token, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price ?? "",
    category: initial?.category || categories[0]?.name || "",
    stock: initial?.stock ?? 0,
    status: initial?.status || "active",
    images: initial?.images || [],
  }));
  const [imageUrls, setImageUrls] = useState(
    (initial?.images || []).map((image) => image.url).join("\n")
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const setField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setError("Choose image files only.");
      return;
    }
    if (files.length + imageUrls.split(/\r?\n/).filter(Boolean).length > 10) {
      setError("A product can have up to 10 images.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const uploadedImages = await Promise.all(
        files.map((file) => uploadAdminImage(file, token))
      );
      setImageUrls((current) =>
        [...current.split(/\r?\n/).filter(Boolean), ...uploadedImages.map((item) => item.url)].join("\n")
      );
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const images = imageUrls
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url }));
    const saved = await onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images,
    });
    if (saved) onCancel();
  };

  return (
    <form className="admin-module-form admin-product-editor" onSubmit={submit}>
      <div className="admin-form-title">
        <h2>{initial ? "Edit product" : "Add product"}</h2>
        <button type="button" className="admin-link-button" onClick={onCancel}>
          Close
        </button>
      </div>
      <div className="admin-form-grid">
        <label className="admin-module-field">
          Product name
          <input name="name" value={form.name} onChange={setField} required maxLength={150} />
        </label>
        <label className="admin-module-field">
          Category
          <select name="category" value={form.category} onChange={setField} required>
            {categories.filter((category) =>
              (category.isActive && !category.isDeleted) || category.name === form.category
            ).map((category) => (
              <option key={category._id || category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-module-field">
          Price
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={setField} required />
        </label>
        <label className="admin-module-field">
          Stock
          <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={setField} required />
        </label>
        <label className="admin-module-field">
          Status
          <select name="status" value={form.status} onChange={setField}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      <label className="admin-module-field">
        Description
        <textarea name="description" value={form.description} onChange={setField} required rows="3" />
      </label>
      <label className="admin-module-field">
        Product image URLs (one URL per line)
        <textarea value={imageUrls} onChange={(event) => setImageUrls(event.target.value)} rows="3" />
      </label>
      <label className="admin-upload-button admin-product-upload">
        <FontAwesomeIcon icon={faCloudArrowUp} />
        {uploading ? "Uploading..." : "Upload product image"}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          hidden
        />
      </label>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      <div className="admin-form-actions">
        <button type="submit" className="admin-primary-button" disabled={uploading}>
          {initial ? "Save changes" : "Create product"}
        </button>
        <button type="button" className="admin-secondary-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProductsTab({ data, token, performAction }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState(undefined);
  const products = (data.products || []).filter((product) => {
    const matchesText =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      status === "all" ||
      (status === "deleted" ? product.isDeleted : product.status === status && !product.isDeleted);
    return matchesText && matchesStatus &&
      (category === "all" || product.category === category);
  });

  const save = (product) =>
    performAction(() =>
      editing?._id
        ? updateAdminProduct(editing._id, product, token)
        : createAdminProduct(product, token)
    );

  return (
    <>
      {editing !== undefined && (
        <ProductEditor
          key={editing?._id || "new"}
          initial={editing}
          categories={data.categories || []}
          token={token}
          onCancel={() => setEditing(undefined)}
          onSave={save}
        />
      )}
      <div className="admin-module-toolbar">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {(data.categories || []).map((item) => (
            <option key={item._id || item.name} value={item.name}>{item.name}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All products</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Recycle bin</option>
        </select>
        <button className="admin-primary-button" type="button" onClick={() => setEditing(null)}>
          Add product
        </button>
      </div>
      {products.length ? (
        <DataTable>
          <thead>
            <tr><th>Product</th><th>Seller</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td><strong>{product.name}</strong></td>
                <td>{product.seller?.name || "ShopSphere"}</td>
                <td>{product.category}</td>
                <td>{formatMoney(product.price)}</td>
                <td>{product.stock}</td>
                <td>{product.isDeleted ? "Archived" : product.status}</td>
                <td className="admin-row-actions">
                  {!product.isDeleted && (
                    <button type="button" onClick={() => setEditing(product)}>Edit</button>
                  )}
                  {product.isDeleted ? (
                    <button
                      type="button"
                      onClick={() => performAction(() => restoreAdminProduct(product._id, token))}
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (window.confirm(`Archive "${product.name}"?`)) {
                          performAction(() => archiveAdminProduct(product._id, token));
                        }
                      }}
                    >
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : <p className="admin-module-empty">No products match these filters.</p>}
    </>
  );
}

function CategoriesTab({ data, token, performAction }) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const reset = () => {
    setEditing(null);
    setName("");
    setImageUrl("");
  };
  const submit = async (event) => {
    event.preventDefault();
    const success = await performAction(() =>
      editing
        ? updateAdminCategory(editing._id, { name, imageUrl }, token)
        : createAdminCategory({ name, imageUrl }, token)
    );
    if (success) reset();
  };

  return (
    <>
      <form className="admin-module-form admin-compact-form" onSubmit={submit}>
        <h2>{editing ? "Edit category" : "Add category"}</h2>
        <div className="admin-form-grid">
          <label className="admin-module-field">
            Category name
            <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={60} />
          </label>
          <CloudinaryImageField token={token} value={imageUrl} onChange={setImageUrl} />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button">{editing ? "Save category" : "Add category"}</button>
          {editing && <button type="button" className="admin-secondary-button" onClick={reset}>Cancel</button>}
        </div>
      </form>
      <DataTable>
        <thead><tr><th>Category</th><th>Image</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {(data.categories || []).map((item) => (
            <tr key={item._id}>
              <td><strong>{item.name}</strong></td>
              <td>{item.imageUrl ? <a href={item.imageUrl} target="_blank" rel="noreferrer">View image</a> : "No image"}</td>
              <td>{item.productCount}</td>
              <td>{item.isDeleted ? "Deleted" : item.isActive ? "Active" : "Inactive"}</td>
              <td className="admin-row-actions">
                {!item.isDeleted && <button type="button" onClick={() => {
                  setEditing(item);
                  setName(item.name);
                  setImageUrl(item.imageUrl || "");
                }}>Edit</button>}
                {!item.isDeleted && <button
                  type="button"
                  onClick={() => performAction(() =>
                    updateAdminCategory(item._id, { isActive: !item.isActive }, token)
                  )}
                >
                  {item.isActive ? "Deactivate" : "Activate"}
                </button>}
                {item.isDeleted ? (
                  <button
                    type="button"
                    onClick={() => performAction(() =>
                      updateAdminCategory(item._id, { isDeleted: false, isActive: true }, token)
                    )}
                  >
                    Restore
                  </button>
                ) : <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    if (window.confirm(`Delete category "${item.name}"?`)) {
                      performAction(() => deleteAdminCategory(item._id, token));
                    }
                  }}
                >
                  Delete
                </button>}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}

function InventoryRow({ product, threshold, token, performAction }) {
  const [stock, setStock] = useState(product.stock);
  const isLow = product.stock <= threshold;
  return (
    <tr>
      <td><strong>{product.name}</strong></td>
      <td>{product.seller?.name || "ShopSphere"}</td>
      <td>{product.category}</td>
      <td>{product.stock} {isLow && <span className="admin-low-stock">Low stock</span>}</td>
      <td>
        <div className="admin-inline-edit">
          <input type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} />
          <button
            type="button"
            onClick={() => performAction(() => updateAdminInventory(product._id, Number(stock), token))}
          >
            Save
          </button>
        </div>
      </td>
    </tr>
  );
}

function InventoryTab({ data, token, performAction }) {
  const [lowOnly, setLowOnly] = useState(false);
  const products = (data.products || []).filter(
    (product) => !lowOnly || product.stock <= data.lowStockThreshold
  );
  return (
    <>
      <div className="admin-module-toolbar">
        <label className="admin-check-filter">
          <input type="checkbox" checked={lowOnly} onChange={(event) => setLowOnly(event.target.checked)} />
          Show only low and out-of-stock products
        </label>
        <span>Low-stock alert threshold: {data.lowStockThreshold ?? 5}</span>
      </div>
      <DataTable>
        <thead><tr><th>Product</th><th>Seller</th><th>Category</th><th>Current stock</th><th>Adjust stock</th></tr></thead>
        <tbody>
          {products.map((product) => (
            <InventoryRow
              key={product._id}
              product={product}
              threshold={data.lowStockThreshold ?? 5}
              token={token}
              performAction={performAction}
            />
          ))}
        </tbody>
      </DataTable>
      {!products.length && <p className="admin-module-empty">No products match this inventory filter.</p>}
    </>
  );
}

function OrdersTab({ data, token, performAction }) {
  const [status, setStatus] = useState("all");
  const orders = (data.orders || []).filter((order) => status === "all" || order.status === status);
  const statuses = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
  return (
    <>
      <div className="admin-module-toolbar">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All order statuses</option>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <DataTable>
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td><strong>#{order._id.slice(-6).toUpperCase()}</strong></td>
              <td>{order.user?.name || "Customer"}<small>{order.user?.email}</small></td>
              <td>{order.items?.length || 0}</td>
              <td>{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod}</td>
              <td>{formatMoney(order.total)}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(event) => performAction(() =>
                    updateAdminOrderStatus(order._id, event.target.value, token)
                  )}
                >
                  {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      {!orders.length && <p className="admin-module-empty">No orders found.</p>}
    </>
  );
}

function UserDetailsDialog({ details, onClose }) {
  if (!details) return null;
  return (
    <div className="admin-module-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="admin-module-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-user-detail-title">
        <div className="admin-form-title">
          <div>
            <h2 id="admin-user-detail-title">{details.user.name}</h2>
            <p>{details.user.email} - {details.user.role}</p>
          </div>
          <button type="button" className="admin-link-button" onClick={onClose}>Close</button>
        </div>
        {details.application && (
          <div className="admin-detail-block">
            <strong>{details.application.storeName}</strong>
            <p>{details.application.storeDescription}</p>
            <span>Seller application: {details.application.status}</span>
          </div>
        )}
        {details.products?.length > 0 && (
          <div className="admin-detail-block">
            <strong>Store inventory</strong>
            {details.products.map((product) => (
              <p key={product._id}>{product.name} - {product.stock} in stock - {formatMoney(product.price)}</p>
            ))}
          </div>
        )}
        <div className="admin-detail-block">
          <strong>Recent order history</strong>
          {details.orders?.length ? details.orders.map((order) => (
            <p key={order._id}>
              #{order._id.slice(-6).toUpperCase()} - {order.status} - {formatMoney(order.total)} - {new Date(order.createdAt).toLocaleDateString()}
            </p>
          )) : <p>No orders found.</p>}
        </div>
      </section>
    </div>
  );
}

function CustomersTab({ data, token, performAction }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [details, setDetails] = useState(null);
  const [detailsError, setDetailsError] = useState("");
  const users = (data.users || []).filter((user) =>
    (role === "all" || user.role === role) &&
    `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const viewDetails = async (id) => {
    setDetailsError("");
    try {
      const result = await getAdminUserDetails(id, token);
      setDetails(result);
    } catch (error) {
      setDetailsError(error.message || "Unable to load account details.");
    }
  };

  return (
    <>
      <div className="admin-module-toolbar">
        <input type="search" placeholder="Search names or emails..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="all">Customers and sellers</option>
          <option value="customer">Customers</option>
          <option value="seller">Sellers</option>
        </select>
        <button className="admin-secondary-button" type="button" onClick={() => navigate("/admin/seller-applications")}>
          Review seller applications
        </button>
      </div>
      {detailsError && <p className="admin-inline-error" role="alert">{detailsError}</p>}
      <DataTable>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Seller status</th><th>Account</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td><strong>{user.name}</strong></td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.sellerApplicationStatus || "-"}</td>
              <td>{user.isActive === false ? "Suspended" : "Active"}</td>
              <td className="admin-row-actions">
                <button type="button" onClick={() => viewDetails(user._id)}>View</button>
                <button
                  type="button"
                  className={user.isActive === false ? "" : "danger"}
                  onClick={() => performAction(() => setAdminUserActive(user._id, user.isActive === false, token))}
                >
                  {user.isActive === false ? "Reactivate" : "Suspend"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      {!users.length && <p className="admin-module-empty">No accounts match your search.</p>}
      <UserDetailsDialog details={details} onClose={() => setDetails(null)} />
    </>
  );
}

function MarketingTab({ data, token, performAction }) {
  const [coupon, setCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrder: 0,
    expiresAt: "",
    maxUses: "",
  });
  const submitCoupon = async (event) => {
    event.preventDefault();
    const success = await performAction(() =>
      saveAdminCoupon(coupon, token)
    );
    if (success) {
      setCoupon({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minimumOrder: 0,
        expiresAt: "",
        maxUses: "",
      });
    }
  };

  return (
    <>
      <div className="admin-marketing-grid">
        <form className="admin-module-form" onSubmit={submitCoupon}>
          <h2>Create a coupon</h2>
          <div className="admin-form-grid">
            <label className="admin-module-field">Code<input value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value.toUpperCase() })} required minLength={3} maxLength={30} /></label>
            <label className="admin-module-field">Discount type<select value={coupon.discountType} onChange={(event) => setCoupon({ ...coupon, discountType: event.target.value })}><option value="percentage">Percent</option><option value="fixed">Fixed INR</option></select></label>
            <label className="admin-module-field">Discount value<input type="number" min="0.01" max={coupon.discountType === "percentage" ? "100" : undefined} step="0.01" value={coupon.discountValue} onChange={(event) => setCoupon({ ...coupon, discountValue: event.target.value })} required /></label>
            <label className="admin-module-field">Minimum order (INR)<input type="number" min="0" value={coupon.minimumOrder} onChange={(event) => setCoupon({ ...coupon, minimumOrder: event.target.value })} /></label>
            <label className="admin-module-field">Expiry (optional)<input type="datetime-local" value={coupon.expiresAt} onChange={(event) => setCoupon({ ...coupon, expiresAt: event.target.value })} /></label>
            <label className="admin-module-field">Max uses (optional)<input type="number" min="1" value={coupon.maxUses} onChange={(event) => setCoupon({ ...coupon, maxUses: event.target.value })} /></label>
          </div>
          <button type="submit" className="admin-primary-button">Create coupon</button>
        </form>
        <section className="admin-module-form">
          <h2>Featured and trending products</h2>
          <p className="admin-muted-copy">These flags control the product sections shown in the storefront.</p>
          <div className="admin-feature-product-list">
            {(data.products || []).slice(0, 12).map((product) => (
              <div key={product._id}>
                <strong>{product.name}</strong>
                <label><input type="checkbox" checked={Boolean(product.isFeatured)} onChange={(event) => performAction(() => updateAdminProduct(product._id, { isFeatured: event.target.checked }, token))} /> Featured</label>
                <label><input type="checkbox" checked={Boolean(product.isTrending)} onChange={(event) => performAction(() => updateAdminProduct(product._id, { isTrending: event.target.checked }, token))} /> Trending</label>
              </div>
            ))}
          </div>
        </section>
      </div>
      <h2 className="admin-section-subtitle">Coupons</h2>
      <DataTable>
        <thead><tr><th>Code</th><th>Discount</th><th>Minimum</th><th>Uses</th><th>Expires</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {(data.coupons || []).map((item) => (
            <tr key={item._id}>
              <td><strong>{item.code}</strong></td>
              <td>{item.discountType === "percentage" ? `${item.discountValue}%` : formatMoney(item.discountValue)}</td>
              <td>{formatMoney(item.minimumOrder)}</td>
              <td>{item.usedCount}{item.maxUses ? ` / ${item.maxUses}` : ""}</td>
              <td>{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : "No expiry"}</td>
              <td>{item.isActive ? "Active" : "Inactive"}</td>
              <td>
                {item.isActive && <button type="button" className="admin-row-action danger" onClick={() => performAction(() => deactivateAdminCoupon(item._id, token))}>Deactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}

function ReviewsTab({ data, token, performAction }) {
  const [reportedOnly, setReportedOnly] = useState(false);
  const reviews = (data.reviews || []).filter(
    (review) => !reportedOnly || review.isReported
  );
  return (
    <>
      <label className="admin-filter-toggle">
        <input
          type="checkbox"
          checked={reportedOnly}
          onChange={(event) => setReportedOnly(event.target.checked)}
        />
        Show reported reviews only
      </label>
      <DataTable>
        <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Report</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id}>
              <td><strong>{review.productName}</strong></td>
              <td>{review.user?.name || "Customer"}</td>
              <td>{review.rating}/5</td>
              <td className="admin-review-comment">{review.comment || "No comment"}</td>
              <td>{review.isReported ? review.reportReason || "Reported" : "—"}</td>
              <td>{new Date(review.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  type="button"
                  className="admin-row-action danger"
                  onClick={() => {
                    if (window.confirm("Remove this review?")) {
                      performAction(() => deleteAdminReview(review.productId, review._id, token));
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}

function PaymentsTab({ data, token, performAction }) {
  return (
    <>
      <div className="admin-notice">
        COD tracking only. Updating a status records a manual collection or refund; it does not move money.
      </div>
      <DataTable>
        <thead><tr><th>Order</th><th>Customer</th><th>Order status</th><th>Payment status</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>
          {(data.orders || []).map((order) => (
            <tr key={order._id}>
              <td><strong>#{order._id.slice(-6).toUpperCase()}</strong></td>
              <td>{order.user?.name || "Customer"}<small>{order.user?.email}</small></td>
              <td>{order.status}</td>
              <td>
                <select
                  value={order.paymentStatus}
                  onChange={(event) => performAction(() =>
                    updateAdminPaymentStatus(order._id, event.target.value, token)
                  )}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </td>
              <td>{formatMoney(order.total)}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\r\n");
  const objectUrl = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

function AnalyticsTab({ data }) {
  const analytics = data.analytics || {};
  const exportReport = () => {
    downloadCsv("shopsphere-sales-report.csv", [
      ["Date", "Orders", "Gross sales"],
      ...(analytics.sales || []).map((item) => [
        item._id,
        item.orders,
        item.revenue,
      ]),
    ]);
  };
  return (
    <>
      <div className="admin-module-toolbar">
        <span>Last 30 days. Cancelled orders are excluded from sales.</span>
        <button type="button" className="admin-secondary-button" onClick={exportReport}>
          <FontAwesomeIcon icon={faDownload} /> Export sales CSV
        </button>
      </div>
      <div className="admin-analytics-grid">
        <section className="admin-module-form">
          <h2>Daily sales</h2>
          <DataTable>
            <thead><tr><th>Date</th><th>Orders</th><th>Gross sales</th></tr></thead>
            <tbody>{(analytics.sales || []).map((item) => <tr key={item._id}><td>{item._id}</td><td>{item.orders}</td><td>{formatMoney(item.revenue)}</td></tr>)}</tbody>
          </DataTable>
        </section>
        <section className="admin-module-form">
          <h2>Best-selling products</h2>
          <DataTable>
            <thead><tr><th>Product</th><th>Units</th><th>Sales</th></tr></thead>
            <tbody>{(analytics.topProducts || []).map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.quantity}</td><td>{formatMoney(item.revenue)}</td></tr>)}</tbody>
          </DataTable>
        </section>
        <section className="admin-module-form">
          <h2>Top sellers</h2>
          <DataTable>
            <thead><tr><th>Seller</th><th>Rating</th><th>Orders</th><th>Sales</th></tr></thead>
            <tbody>{(analytics.topSellers || []).map((item) => <tr key={item._id}><td>{item.name || "Seller"}</td><td>{item.rating === null ? "No ratings" : `${item.rating.toFixed(1)} / 5 (${item.reviewCount})`}</td><td>{item.orders}</td><td>{formatMoney(item.revenue)}</td></tr>)}</tbody>
          </DataTable>
        </section>
        <section className="admin-module-form">
          <h2>Low-stock products</h2>
          <DataTable>
            <thead><tr><th>Product</th><th>Category</th><th>Stock</th></tr></thead>
            <tbody>{(analytics.lowStockProducts || []).map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.category}</td><td>{item.stock}</td></tr>)}</tbody>
          </DataTable>
        </section>
      </div>
    </>
  );
}

function AssistantTab({ token }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setAnswer("");
    setLoading(true);
    try {
      const result = await askAdminAssistant(question, token);
      setAnswer(result.answer);
    } catch (requestError) {
      setError(requestError.message || "Unable to contact the AI assistant.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="admin-module-form admin-ai-panel">
      <h2>ShopSphere AI Assistant</h2>
      <p>Ask about marketplace performance, sales trends, or inventory. Answers use current marketplace metrics.</p>
      <form onSubmit={submit}>
        <label className="admin-module-field" htmlFor="admin-ai-question">Your question</label>
        <textarea id="admin-ai-question" value={question} onChange={(event) => setQuestion(event.target.value)} rows="4" maxLength={2000} required placeholder="Example: Which business areas should I review this week?" />
        <button type="submit" className="admin-primary-button" disabled={loading}>{loading ? "Analyzing..." : "Ask assistant"}</button>
      </form>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      {answer && <div className="admin-ai-answer"><h3>Assistant response</h3><p>{answer}</p></div>}
    </div>
  );
}

function SettingsTab({ data, token, performAction, onAdminProfileUpdated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    commissionRate: 10,
    lowStockThreshold: 5,
  });
  useEffect(() => {
    if (!data.admin || !data.settings) return;
    setForm({
      name: data.admin.name || "",
      email: data.admin.email || "",
      commissionRate: data.settings.commissionRate,
      lowStockThreshold: data.settings.lowStockThreshold,
    });
  }, [data.admin, data.settings]);

  const submit = async (event) => {
    event.preventDefault();
    const result = await performAction(() => updateAdminSettings(form, token));
    if (result?.admin) onAdminProfileUpdated?.(result.admin);
  };
  const integrationStatus = data.integrations || {};
  return (
    <div className="admin-settings-grid">
      <form className="admin-module-form" onSubmit={submit}>
        <h2>Admin and platform settings</h2>
        <label className="admin-module-field">Admin name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
        <label className="admin-module-field">Admin email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label className="admin-module-field">Seller commission (%)<input type="number" min="0" max="100" step="0.1" value={form.commissionRate} onChange={(event) => setForm({ ...form, commissionRate: event.target.value })} required /></label>
        <label className="admin-module-field">Low-stock alert threshold<input type="number" min="0" max="10000" step="1" value={form.lowStockThreshold} onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })} required /></label>
        <button type="submit" className="admin-primary-button">Save settings</button>
        <p className="admin-muted-copy">Commission is saved as a platform setting; it is not deducted from COD orders or seller payouts yet.</p>
      </form>
      <section className="admin-module-form">
        <h2>Integration readiness</h2>
        <IntegrationStatus name="Cloudinary image uploads" active={integrationStatus.cloudinary} variables="CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET" />
        <IntegrationStatus name="OpenAI assistant" active={integrationStatus.openai} variables="OPENAI_API_KEY" />
        <p className="admin-muted-copy">Add provider credentials to server/.env and restart the API. Never put secret keys in client files.</p>
      </section>
    </div>
  );
}

function IntegrationStatus({ name, active, variables }) {
  return (
    <div className="admin-integration-status">
      <strong>{name}</strong>
      <span className={active ? "ready" : "not-ready"}>{active ? "Configured" : "Needs setup"}</span>
      {!active && <small>{variables}</small>}
    </div>
  );
}

function ActivityTab({ data }) {
  return (
    <>
      <section className="admin-module-form">
        <h2>Notifications</h2>
        {data.notifications?.length ? (
          <ul className="admin-notification-list">
            {data.notifications.map((item) => <li key={item.id}>{item.message}</li>)}
          </ul>
        ) : <p className="admin-muted-copy">No current alerts.</p>}
      </section>
      <section className="admin-module-form">
        <h2>Admin activity history</h2>
        {(data.activity || []).length ? (
          <DataTable>
            <thead><tr><th>Activity</th><th>Admin</th><th>Target</th><th>Time</th></tr></thead>
            <tbody>
              {data.activity.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.action}</strong><small>{item.details}</small></td>
                  <td>{item.actor?.name || "Admin"}</td>
                  <td>{item.targetType}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        ) : <p className="admin-module-empty">No admin actions recorded yet.</p>}
      </section>
    </>
  );
}

const tabContent = {
  Products: "Manage marketplace listings, product status, and archived products.",
  Categories: "Create and organize the categories used by marketplace products.",
  Inventory: "Monitor stock levels and correct inventory across all sellers.",
  Orders: "Review customer orders and update their fulfilment status.",
  Customers: "Search customer and seller accounts, view order history, and manage access.",
  Marketing: "Create checkout coupons and control featured or trending products.",
  Reviews: "Review customer ratings and remove inappropriate product reviews.",
  Payments: "Track cash-on-delivery payment collection and recorded refunds.",
  Analytics: "Review sales, best-selling products, sellers, and low-stock inventory.",
  "AI Assistant": "Ask OpenAI for insights grounded in current marketplace metrics.",
  "Admin Settings": "Update your admin profile, marketplace commission, and alert threshold.",
  "Activity Logs": "Review marketplace alerts and recorded administrative actions.",
};

function AdminWorkspace({ tab, token, onAdminProfileUpdated }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(tab !== "AI Assistant");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (tab === "AI Assistant") return undefined;
    let active = true;
    loadModule(tab, token)
      .then((result) => {
        if (active) {
          setData(result);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || `Unable to load ${tab.toLowerCase()}.`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab, token, refreshKey]);

  const refresh = () => {
    setError("");
    setLoading(true);
    setRefreshKey((current) => current + 1);
  };

  const performAction = async (action) => {
    setError("");
    setNotice("");
    setActionLoading(true);
    try {
      const result = await action();
      setNotice(result?.message || "Changes saved.");
      setLoading(true);
      setRefreshKey((current) => current + 1);
      return result || true;
    } catch (actionError) {
      setError(actionError.message || "Unable to save changes.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  if (tab === "AI Assistant") {
    return (
      <section className="admin-module">
        <PageHeading title={tab} description={tabContent[tab]} onRefresh={null} loading={false} />
        <AssistantTab token={token} />
      </section>
    );
  }

  return (
    <section className="admin-module">
      <PageHeading title={tab} description={tabContent[tab]} onRefresh={refresh} loading={loading || actionLoading} />
      {error && <div className="admin-error-message" role="alert"><span>{error}</span><button type="button" onClick={refresh}>Try again</button></div>}
      {notice && <div className="admin-success-message" role="status">{notice}</div>}
      {loading ? (
        <div className="admin-panel admin-loading-state">Loading {tab.toLowerCase()}...</div>
      ) : (
        <>
          {tab === "Products" && <ProductsTab data={data} token={token} performAction={performAction} />}
          {tab === "Categories" && <CategoriesTab data={data} token={token} performAction={performAction} />}
          {tab === "Inventory" && <InventoryTab data={data} token={token} performAction={performAction} />}
          {tab === "Orders" && <OrdersTab data={data} token={token} performAction={performAction} />}
          {tab === "Customers" && <CustomersTab data={data} token={token} performAction={performAction} />}
          {tab === "Marketing" && <MarketingTab data={data} token={token} performAction={performAction} />}
          {tab === "Reviews" && <ReviewsTab data={data} token={token} performAction={performAction} />}
          {tab === "Payments" && <PaymentsTab data={data} token={token} performAction={performAction} />}
          {tab === "Analytics" && <AnalyticsTab data={data} />}
          {tab === "Admin Settings" && <SettingsTab data={data} token={token} performAction={performAction} onAdminProfileUpdated={onAdminProfileUpdated} />}
          {tab === "Activity Logs" && <ActivityTab data={data} />}
        </>
      )}
    </section>
  );
}

export default AdminWorkspace;
