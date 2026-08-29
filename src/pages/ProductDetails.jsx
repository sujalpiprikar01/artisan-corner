import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, Star, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { addToCart } from "../utils/cart";
import { API_BASE_URL } from "../utils/api";
import { formatPrice } from "../utils/format";

function StarRow({ rating = 0, size = 15 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/product/${id}`
      );

      const data = await response.json();

      if (response.ok) {
        setReviews(data);
      }
    } catch (err) {
      // Silently ignore — reviews are non-critical to page load
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/product/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setReviewComment("");
      setReviewRating(5);
      await fetchReviews();

      // Refresh product to pick up the new average rating
      const productResponse = await fetch(
        `${API_BASE_URL}/api/products/${id}`
      );
      const productData = await productResponse.json();
      if (productResponse.ok) setProduct(productData);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load product");
        }

        setProduct(data);
        setQuantity(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setMessage("Added to cart!");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-500 text-xl">
            {error || "Product not found"}
          </p>

          <Link
            to="/products"
            className="inline-block mt-6 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-12">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6 items-start">
          {/* Image */}
          <div className="md:sticky md:top-24">
            <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[450px] object-cover"
              />

              {outOfStock && (
                <span className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              {product.category}
            </p>

            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mt-3">
              <StarRow rating={product.rating || 0} />
              <span className="text-sm text-gray-500">
                {product.rating ? product.rating.toFixed(1) : "No ratings yet"}
                {product.numReviews > 0 &&
                  ` (${product.numReviews} review${
                    product.numReviews === 1 ? "" : "s"
                  })`}
              </span>
            </div>

            {/* Vendor / Store Info */}
            <div className="flex items-center gap-3 mt-4">
              {product.vendor?.store?.logo && (
                <img
                  src={product.vendor.store.logo}
                  alt={product.vendor.store.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
              )}

              <p className="text-sm text-gray-600">
                Sold by{" "}
                <span className="font-medium text-gray-900">
                  {product.vendor?.store?.name || product.vendor?.name}
                </span>
              </p>
            </div>

            <p className="text-3xl font-bold text-gray-900 mt-6">
              {formatPrice(product.price)}
            </p>

            <p className="text-gray-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            <div
              className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${
                outOfStock
                  ? "text-red-600"
                  : lowStock
                  ? "text-amber-600"
                  : "text-green-600"
              }`}
            >
              {outOfStock ? (
                <XCircle size={16} strokeWidth={2} />
              ) : (
                <CheckCircle2 size={16} strokeWidth={2} />
              )}
              {outOfStock
                ? "Out of stock"
                : lowStock
                ? `Only ${product.stock} left in stock`
                : `In Stock — ${product.stock} available`}
            </div>

            {message && (
              <div className="mt-4 p-3 rounded-lg bg-green-100 text-green-800 text-center">
                {message}
              </div>
            )}

            {/* Quantity Selector */}
            {!outOfStock && (
              <div className="flex items-center gap-4 mt-6">
                <span className="text-sm font-medium text-gray-700">Qty</span>

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} strokeWidth={2} />
                  </button>

                  <span className="w-10 text-center border-x border-gray-300 font-medium">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition text-gray-600"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="flex-1 border border-gray-900 text-gray-900 py-3 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Customer Reviews
          </h2>

          {/* Rating summary strip */}
          <div className="flex items-center gap-3 mb-8">
            <StarRow rating={product.rating || 0} size={20} />
            <span className="text-lg font-semibold text-gray-900">
              {product.rating ? product.rating.toFixed(1) : "0.0"} / 5
            </span>
            {product.numReviews > 0 && (
              <span className="text-sm text-gray-500">
                based on {product.numReviews} review
                {product.numReviews === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {/* Leave a Review */}
          {token ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Write a Review</h3>

              {reviewError && (
                <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rating
                  </label>

                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-gray-900"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Star{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Comment (optional)
                  </label>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product"
                    className="w-full min-h-24 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>

                <p className="text-xs text-gray-400">
                  Only buyers who have purchased and paid for this product
                  can leave a review.
                </p>
              </form>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-8">
              <Link to="/login" className="underline">
                Log in
              </Link>{" "}
              to write a review.
            </p>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {review.buyer?.name || "Anonymous"}
                    </p>

                    <StarRow rating={review.rating} size={14} />
                  </div>

                  {review.comment && (
                    <p className="text-gray-600 mt-2">{review.comment}</p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
