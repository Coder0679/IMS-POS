import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, type Product } from "../store/database";
import { Search, Package, Filter, X, IndianRupee, Eye } from "lucide-react";

const CATEGORIES = ["All", "Hardware", "Electrical", "Tools", "Paint", "Plumbing"];

const categoryColors: Record<string, string> = {
  Hardware: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Electrical: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Tools: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  Paint: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Plumbing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};

const placeholderImages: Record<string, string> = {
  Hardware: "🔩",
  Electrical: "⚡",
  Tools: "🔨",
  Paint: "🎨",
  Plumbing: "🔧",
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Close modal on ESC key
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelectedProduct(null);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [selectedProduct, handleEsc]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
    setLoading(false);
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Our Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Browse our complete product catalog
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            Filter
            {selectedCategory !== "All" && (
              <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs">
                {selectedCategory}
              </span>
            )}
          </button>
        </div>

        {/* Category Filters - Desktop */}
        <div className="hidden sm:flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Category Filters - Mobile */}
        {showFilters && (
          <div className="sm:hidden flex flex-wrap gap-2 mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  handleCategoryChange(cat);
                  setShowFilters(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
              No products found
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all hover:-translate-y-0.5 group cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-5xl sm:text-6xl opacity-60">
                      {placeholderImages[product.category] || "📦"}
                    </span>
                  )}
                  {/* Quick View overlay hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-3.5 h-3.5" />
                      Quick View
                    </span>
                  </div>
                  <span
                    className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      categoryColors[product.category] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {product.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base leading-tight mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold text-lg">
                    <IndianRupee className="w-4 h-4" />
                    {product.sellingPrice.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-2">
                    {product.stockQuantity > 0 ? (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        In Stock ({product.stockQuantity})
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Product Quick View Modal ===== */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          {/* Dark semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

          {/* Modal content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-black/50 max-w-lg w-full max-h-[90vh] overflow-hidden animate-modal-in border border-gray-200 dark:border-gray-700"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product Image */}
            <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-7xl sm:text-8xl opacity-50">
                  {placeholderImages[selectedProduct.category] || "📦"}
                </span>
              )}
              {/* Category badge on image */}
              <span
                className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                  categoryColors[selectedProduct.category] ||
                  "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {selectedProduct.category}
              </span>
            </div>

            {/* Product Details */}
            <div className="p-5 sm:p-6">
              {/* Product Name */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                {selectedProduct.name}
              </h2>

              {/* Price */}
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-extrabold text-2xl sm:text-3xl mb-4">
                <IndianRupee className="w-6 h-6 sm:w-7 sm:h-7" />
                {selectedProduct.sellingPrice.toLocaleString("en-IN")}
              </div>

              {/* Divider */}
              <hr className="border-gray-100 dark:border-gray-800 mb-4" />

              {/* Extra info row */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Package className="w-4 h-4" />
                <span>
                  Category: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedProduct.category}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
