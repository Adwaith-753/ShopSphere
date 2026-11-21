import "./ProductSkeleton.css";

function ProductSkeleton({ count = 8 }) {
  return (
    <div
      className="products-grid"
      aria-label="Loading products"
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">Loading products. Please wait.</span>

      {Array.from({ length: count }).map((_, index) => (
        <div className="product-skeleton-card" key={index}>
          <div className="skeleton-shimmer skeleton-image"></div>

          <div className="product-skeleton-info">
            <div className="skeleton-shimmer skeleton-title"></div>
            <div className="skeleton-shimmer skeleton-description"></div>
            <div className="skeleton-shimmer skeleton-price"></div>
            <div className="skeleton-shimmer skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductSkeleton;