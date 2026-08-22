import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { API_BASE_URL } from "../utils/api";

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/products`
        )

        setProducts(response.data)
      } catch (err) {
        setError('Failed to load products')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading products...</p>
      </main>
    )
  }

  // Error
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </main>
    )
  }

  // Search + category filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || product.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            Our Marketplace
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            All Handmade Products
          </h1>

          <p className="text-gray-600 mt-3">
            Discover unique products from independent artisans.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Pottery">Pottery</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Woodwork">Woodwork</option>
            <option value="Home Decor">Home Decor</option>
          </select>

        </div>

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-900">
              No products found
            </h2>

            <p className="text-gray-500 mt-2">
              Try another search or category.
            </p>
          </div>
        )}

      </section>
    </main>
  )
}

export default Products