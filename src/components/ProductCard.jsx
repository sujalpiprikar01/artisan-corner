import { Link } from "react-router-dom";
import { addToCart } from "../utils/cart";

function ProductCard({ product }) {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition block"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-64 object-cover"
      />

      <div className="p-5">
        <p className="text-sm text-gray-500">{product.category}</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-gray-900">
            ${product.price}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
