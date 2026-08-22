import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import { API_BASE_URL } from "../utils/api";

const categories = [
  { name: "Pottery", icon: "🏺" },
  { name: "Jewelry", icon: "💍" },
  { name: "Woodwork", icon: "🪵" },
  { name: "Home Decor", icon: "🏠" },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();

        if (response.ok) {
          // Show only the first 4 as "featured"
          setProducts(data.slice(0, 4));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Handmade • Unique • Authentic
          </p>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mt-4 leading-tight">
            Discover Handmade Treasures
          </h1>

          <p className="text-lg text-gray-600 mt-6 leading-relaxed">
            Explore unique handmade products crafted by talented artisans
            and discover something truly special for your home and lifestyle.
          </p>

          <Link
            to="/products"
            className="inline-block mt-8 bg-black text-white px-7 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Explore Products
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Shop by category
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              Explore Categories
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              icon={category.icon}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            Featured collection
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            Popular Handmade Products
          </h2>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No products yet.</p>
        )}
      </section>
    </main>
  );
}

export default Home;
