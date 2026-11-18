import HeroBanner from "../../components/common/HeroBanner";
import CategorySection from "../../components/common/CategorySection";
import FeaturedProducts from "../../components/products/FeaturedProducts";
import TrendingProducts from "../../components/products/TrendingProducts";
import NewArrivals from "../../components/products/NewArrivals";
import OffersSection from "../../components/common/OffersSection";
import TrustSection from "../../components/common/TrustSection";
import Newsletter from "../../components/common/Newsletter";


function Home() {
  return (
    <main>
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts />
       <TrendingProducts />
       <NewArrivals />
       <OffersSection />
       <TrustSection />
       <Newsletter />
    </main>
  );
}

export default Home;