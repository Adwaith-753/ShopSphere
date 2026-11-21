
import "./ProductDetailsSkeleton.css";

function ProductDetailsSkeleton() {
  return (
    <main className="product-details-page">
      <div
        className="product-details-container"
        role="status"
        aria-busy="true"
        aria-label="Loading product details"
      >
        <span className="sr-only">
          Loading product details. Please wait.
        </span>

        {/* Image Skeleton */}
        <div className="details-skeleton-image skeleton-shimmer"></div>

        {/* Information Skeleton */}
        <div className="details-skeleton-info">
          <div className="skeleton-shimmer details-skeleton-category"></div>
          <div className="skeleton-shimmer details-skeleton-title"></div>
          <div className="skeleton-shimmer details-skeleton-description"></div>
          <div className="skeleton-shimmer details-skeleton-description short"></div>
          <div className="skeleton-shimmer details-skeleton-price"></div>

          <div className="details-skeleton-quantity">
            <div className="skeleton-shimmer details-skeleton-label"></div>
            <div className="skeleton-shimmer details-skeleton-control"></div>
          </div>

          <div className="skeleton-shimmer details-skeleton-total"></div>

          <div className="details-skeleton-buttons">
            <div className="skeleton-shimmer details-skeleton-button"></div>
            <div className="skeleton-shimmer details-skeleton-button"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetailsSkeleton;
