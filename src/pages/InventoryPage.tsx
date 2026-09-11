import { useState, useEffect, type FormEvent } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "../store/database";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Package,
  AlertTriangle,
  ImageIcon,
  IndianRupee,
  Save,
  ChevronDown,
} from "lucide-react";

const CATEGORIES = ["Hardware", "Electrical", "Tools", "Paint", "Plumbing"];

interface ProductForm {
  name: string;
  category: string;
  stockQuantity: string;
  costPrice: string;
  sellingPrice: string;
  imageUrl: string;
}

const emptyForm: ProductForm = {
  name: "",
  category: "Hardware",
  stockQuantity: "",
  costPrice: "",
  sellingPrice: "",
  imageUrl: "",
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  }

  function openAddModal() {
    setForm(emptyForm);
    setEditingId(null);
    setImagePreview("");
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    setForm({
      name: product.name,
      category: product.category,
      stockQuantity: product.stockQuantity.toString(),
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      imageUrl: product.imageUrl,
    });
    setEditingId(product.id);
    setImagePreview(product.imageUrl);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const productData = {
      name: form.name.trim(),
      category: form.category,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      imageUrl: form.imageUrl.trim(),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await addProduct(productData);
      }
      await loadProducts();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving product:", err);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
    setDeleteConfirm(null);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setForm({ ...form, imageUrl: result });
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalStock = products.reduce((s, p) => s + p.stockQuantity, 0);
  const totalValue = products.reduce(
    (s, p) => s + p.sellingPrice * p.stockQuantity,
    0
  );
  const lowStockCount = products.filter((p) => p.stockQuantity <= 5 && p.stockQuantity > 0).length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Inventory Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Manage your product stock
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-md flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalStock.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock Value</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Low / Out of Stock</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {lowStockCount + outOfStock}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none w-full sm:w-44 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm pr-10 transition-colors"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Product Table / Cards */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
              No products found
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
              {products.length === 0
                ? "Start by adding your first product"
                : "Try adjusting your search"}
            </p>
            {products.length === 0 && (
              <button
                onClick={openAddModal}
                className="bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700"
              >
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-6 py-3">
                      Product
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">
                      Category
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">
                      Stock
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">
                      Cost Price
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">
                      Selling Price
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">
                      Margin
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map((product) => {
                    const margin = product.sellingPrice - product.costPrice;
                    const marginPercent =
                      product.costPrice > 0
                        ? ((margin / product.costPrice) * 100).toFixed(1)
                        : "0";
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {product.stockQuantity === 0 ? (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                              Out of Stock
                            </span>
                          ) : product.stockQuantity <= 5 ? (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full flex items-center gap-1 justify-end w-fit ml-auto">
                              <AlertTriangle className="w-3 h-3" />
                              {product.stockQuantity}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              {product.stockQuantity}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                          ₹{product.costPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                          ₹{product.sellingPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            +{marginPercent}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((product) => {
                const margin = product.sellingPrice - product.costPrice;
                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                          {product.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            ₹{product.sellingPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Cost: ₹{product.costPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            +₹{margin}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                      <div>
                        {product.stockQuantity === 0 ? (
                          <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                            Out of Stock
                          </span>
                        ) : product.stockQuantity <= 5 ? (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                            Low Stock: {product.stockQuantity}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            Stock: {product.stockQuantity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                    placeholder="e.g., Havells 1.5mm Wire"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="appearance-none w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm pr-10 transition-colors"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) =>
                      setForm({ ...form, stockQuantity: e.target.value })
                    }
                    required
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                  />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cost Price (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={form.costPrice}
                        onChange={(e) =>
                          setForm({ ...form, costPrice: e.target.value })
                        }
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Selling Price (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={form.sellingPrice}
                        onChange={(e) =>
                          setForm({ ...form, sellingPrice: e.target.value })
                        }
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Profit Preview */}
                {form.costPrice && form.sellingPrice && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm transition-colors">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Profit per unit:</span>
                      <span
                        className={`font-semibold ${
                          parseFloat(form.sellingPrice) -
                            parseFloat(form.costPrice) >=
                          0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        ₹
                        {(
                          parseFloat(form.sellingPrice) -
                          parseFloat(form.costPrice)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Margin:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {parseFloat(form.costPrice) > 0
                          ? (
                              ((parseFloat(form.sellingPrice) -
                                parseFloat(form.costPrice)) /
                                parseFloat(form.costPrice)) *
                              100
                            ).toFixed(1)
                          : "0"}
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Image
                  </label>
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block cursor-pointer">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 inline-block transition-colors">
                          Upload Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        Max 2MB. JPG, PNG supported.
                      </p>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                          onChange={(e) => {
                            setForm({ ...form, imageUrl: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                          placeholder="Or paste image URL"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {editingId ? "Update" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Delete Product?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  This action cannot be undone. The product will be permanently
                  removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
