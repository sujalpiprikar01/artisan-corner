import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

function CategoryCard({ name, Icon, count, tint }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(name)}`}
      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all block"
    >
      <div
        className="h-32 flex items-center justify-center"
        style={{ backgroundColor: tint }}
      >
        <Icon size={40} strokeWidth={1.5} className="text-gray-700" />
      </div>

      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">{name}</h3>
          {count !== undefined && (
            <p className="text-xs text-gray-500 mt-0.5">{count} items</p>
          )}
        </div>

        <ArrowUpRight
          size={18}
          strokeWidth={1.75}
          className="text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
        />
      </div>
    </Link>
  );
}

export default CategoryCard;