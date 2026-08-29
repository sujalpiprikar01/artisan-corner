import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Amphora, Gem, TreePine, Home as HomeIcon, ArrowRight } from "lucide-react";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/hero.png";

const CATEGORIES = [
  { name: "Pottery", Icon: Amphora, tint: "#F3E8DC" },
  { name: "Jewelry", Icon: Gem, tint: "#F3E4EE" },
  { name: "Woodwork", Icon: TreePine, tint: "#E6EDE3" },
  { name: "Home Decor", Icon: HomeIcon, tint: "#E4EBF2" },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();

        if (response.ok) {
          setAllProducts(data);
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

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.name] = allProducts.filter((p) => p.category === cat.name).length;
    return acc;
  }, {});

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Handcrafted for you
            </p>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mt-4 leading-[1.1]">
              Discover products made by independent artisans
            </h1>

            <p className="text-lg text-gray-600 mt-6 leading-relaxed max-w-lg">
              Every piece tells a story. Explore handmade pottery, jewelry,
              woodwork, and decor crafted with care by makers around India.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Explore Collection
                <ArrowRight size={18} strokeWidth={2} />
              </Link>

              <Link
                to="/become-seller"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-900 px-7 py-3.5 rounded-lg hover:bg-white transition font-medium"
              >
                Start Selling
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-200">
              <img
                src={heroImage}
                alt="Handcrafted artisan products"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
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
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              Icon={category.Icon}
              tint={category.tint}
              count={categoryCounts[category.name]}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-widest">
                Featured collection
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                Popular Handmade Products
              </h2>
            </div>

            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              View all
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
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
        </div>
      </section>
    </main>
  );
}

export default Home;