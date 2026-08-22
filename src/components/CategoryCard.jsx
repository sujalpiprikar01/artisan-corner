function CategoryCard({ name, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition cursor-pointer">
      <div className="text-4xl mb-3">{icon}</div>

      <h3 className="text-lg font-semibold text-gray-900">
        {name}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        Explore collection
      </p>
    </div>
  )
}

export default CategoryCard