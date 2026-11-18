
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import ProductCard from "../../components/products/ProductCard";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read search query from URL
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    const search = searchQuery.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    );
  });

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch{
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <main className="products-page">Loading products...</main>;
  }

  if (error) {
    return <main className="products-page">{error}</main>;
  }

  return (
    <main className="products-page">
      <h1>
        {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
      </h1>

      <p>Explore our collection of amazing products.</p>

      <p>Total Products: {filteredProducts.length}</p>

      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="no-products">
          No products found. Try another search.
        </p>
      )}
    </main>
  );
}

export default Products;
