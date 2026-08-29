import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Star } from "lucide-react";
import { addToCart } from "../utils/cart";

function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((v) => !v);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all block"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition"
        >
          <Heart
            size={17}
            strokeWidth={1.75}
            className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}
          />
        </button>

        {outOfStock && (
          <span className="absolute top-3 left-3 bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Out of stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {product.category}
        </p>

        <h3 className="text-[15px] font-semibold text-gray-900 mt-1 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-1.5">
          <Star size={13} className="fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500">
            {product.rating ? product.rating.toFixed(1) : "New"}
            {product.numReviews > 0 && ` (${product.numReviews})`}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label="Add to cart"
            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;