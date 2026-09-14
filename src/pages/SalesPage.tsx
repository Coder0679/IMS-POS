import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  getProducts,
  getSales,
  addSale,
  deleteSale,
  type Product,
  type Sale,
} from "../store/database";
import {
  Plus,
  X,
  Trash2,
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Calendar,
  BarChart3,
  Package,
} from "lucide-react";

type ViewMode = "daily" | "monthly" | "itemwise";

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formProductId, setFormProductId] = useState("");
  const [formProductSearch, setFormProductSearch] = useState("");
  const [formSellingPrice, setFormSellingPrice] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [prods, sls] = await Promise.all([getProducts(), getSales()]);
    setProducts(prods);
    setSales(sls);
    setLoading(false);
  }

  const selectedProduct = products.find((p) => p.id === formProductId);
  const matchingProducts = products.filter((product) =>
    product.name.toLowerCase().includes(formProductSearch.toLowerCase())
  );

  async function handleAddSale(e: FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    const sellingPrice = Number(formSellingPrice);
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) return;

    setSaving(true);

    const qty = parseInt(formQuantity) || 0;
    const totalAmount = qty * sellingPrice;
    const profit = qty * (sellingPrice - selectedProduct.costPrice);

    await addSale({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: qty,
      costPrice: selectedProduct.costPrice,
      sellingPrice,
      totalAmount,
      profit,
      saleDate: formDate,
    });

    await loadData();
    setShowAddModal(false);
    setFormProductId("");
    setFormProductSearch("");
    setFormSellingPrice("");
    setFormQuantity("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setSaving(false);
  }

  async function handleDeleteSale(id: string) {
    await deleteSale(id);
    await loadData();
    setDeleteConfirm(null);
  }

  // Filtered sales
  const filteredSales = useMemo(() => {
    if (viewMode === "daily") {
      return sales.filter((s) => s.saleDate === selectedDate);
    } else if (viewMode === "monthly") {
      return sales.filter((s) => s.saleDate.startsWith(selectedMonth));
    }
    return sales;
  }, [sales, viewMode, selectedDate, selectedMonth]);

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((s, x) => s + x.totalAmount, 0);
    const totalProfit = filteredSales.reduce((s, x) => s + x.profit, 0);
    const totalItems = filteredSales.reduce((s, x) => s + x.quantity, 0);
    return { totalRevenue, totalProfit, totalItems, count: filteredSales.length };
  }, [filteredSales]);

  // Item-wise summary
  const itemWiseSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        productName: string;
        category: string;
        totalQty: number;
        totalRevenue: number;
        totalProfit: number;
      }
    >();
    const salesToUse =
      viewMode === "itemwise"
        ? sales
        : filteredSales;

    for (const s of salesToUse) {
      const existing = map.get(s.productName);
      if (existing) {
        existing.totalQty += s.quantity;
        existing.totalRevenue += s.totalAmount;
        existing.totalProfit += s.profit;
      } else {
        map.set(s.productName, {
          productName: s.productName,
          category: s.category,
          totalQty: s.quantity,
          totalRevenue: s.totalAmount,
          totalProfit: s.profit,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );
  }, [sales, filteredSales, viewMode]);

  // Overall stats for all time
  const overallStats = useMemo(() => {
    const totalRevenue = sales.reduce((s, x) => s + x.totalAmount, 0);
    const totalProfit = sales.reduce((s, x) => s + x.profit, 0);
    return { totalRevenue, totalProfit };
  }, [sales]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Sales Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Track and manage your daily sales
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-md flex items-center gap-2 justify-center"
          >
            <Plus className="w-5 h-5" />
            Record Sale
          </button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Sales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sales.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupee className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">All-Time Revenue</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{overallStats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">All-Time Profit</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{overallStats.totalProfit.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Filtered Entries</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-1 gap-1 transition-colors">
            {(["daily", "monthly", "itemwise"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none ${
                  viewMode === mode
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {mode === "daily"
                  ? "Daily"
                  : mode === "monthly"
                  ? "Monthly"
                  : "Item-wise"}
              </button>
            ))}
          </div>

          {viewMode === "daily" && (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
              />
            </div>
          )}

          {viewMode === "monthly" && (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
              />
            </div>
          )}
        </div>

        {/* Filtered Stats Bar */}
        {(viewMode === "daily" || viewMode === "monthly") && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 rounded-xl p-4 mb-6 border border-orange-100 dark:border-orange-900/40 transition-colors">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mb-0.5">Revenue</p>
                <p className="text-lg font-bold text-orange-800 dark:text-orange-300">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600/70 dark:text-green-400/70 mb-0.5">Profit</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  ₹{stats.totalProfit.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mb-0.5">Items Sold</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {stats.totalItems}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : viewMode === "itemwise" ? (
          /* Item-wise View */
          itemWiseSummary.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                No sales recorded yet
              </h3>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
              <div className="overflow-x-auto">
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
                        Qty Sold
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-4 py-3">
                        Revenue
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-6 py-3">
                        Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {itemWiseSummary.map((item) => (
                      <tr
                        key={item.productName}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                          {item.totalQty}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                          ₹{item.totalRevenue.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">
                          ₹{item.totalProfit.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                      <td
                        colSpan={2}
                        className="px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-300"
                      >
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        {itemWiseSummary.reduce(
                          (s, x) => s + x.totalQty,
                          0
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                        ₹
                        {itemWiseSummary
                          .reduce((s, x) => s + x.totalRevenue, 0)
                          .toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                        ₹
                        {itemWiseSummary
                          .reduce((s, x) => s + x.totalProfit, 0)
                          .toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">
              No sales for this {viewMode === "daily" ? "date" : "month"}
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Record a sale to see it here
            </p>
          </div>
        ) : (
          /* Sales List */
          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-sm dark:hover:shadow-gray-900/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {sale.productName}
                      </h3>
                      <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {sale.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: <span className="font-medium text-gray-700 dark:text-gray-300">{sale.quantity}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        @ ₹{sale.sellingPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(sale.saleDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      ₹{sale.totalAmount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      +₹{sale.profit.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(sale.id)}
                    className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Sale Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Record New Sale
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSale} className="p-6 space-y-4">
                {/* Sale Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sale Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Product *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formProductSearch}
                      onChange={(e) => {
                        setFormProductSearch(e.target.value);
                        setFormProductId("");
                        setFormSellingPrice("");
                      }}
                      required
                      placeholder="Search products..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                    />
                    {formProductSearch && !formProductId && (
                      <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                        {matchingProducts.length > 0 ? (
                          matchingProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setFormProductId(product.id);
                                setFormProductSearch(product.name);
                                setFormSellingPrice(product.sellingPrice.toString());
                              }}
                              className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {product.name} (Stock: {product.stockQuantity}) - ₹
                              {product.sellingPrice}
                            </button>
                          ))
                        ) : (
                          <p className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                            No matching products
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter selling price"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    required
                    min="1"
                    max={selectedProduct?.stockQuantity || 9999}
                    placeholder="Enter quantity"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-colors"
                  />
                  {selectedProduct && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Available stock: {selectedProduct.stockQuantity}
                    </p>
                  )}
                </div>

                {/* Sale Preview */}
                {selectedProduct && formQuantity && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 transition-colors">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Selling Price:</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        ₹{formSellingPrice} × {formQuantity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹
                        {(
                          (parseFloat(formSellingPrice) || 0) *
                          (parseInt(formQuantity) || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span className="text-gray-500 dark:text-gray-400">Profit:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ₹
                        {(
                          ((parseFloat(formSellingPrice) || 0) -
                            selectedProduct.costPrice) *
                          (parseInt(formQuantity) || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formProductId || !formQuantity}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    Record Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Delete Sale Entry?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This will remove the sale record. Stock will not be restored.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSale(deleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
