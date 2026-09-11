import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useTheme } from "../store/ThemeContext";
import {
  Menu,
  X,
  Home,
  Package,
  ShieldCheck,
  LogOut,
  Wrench,
  Sun,
  Moon,
} from "lucide-react";
export default function Header() {
  const { isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
    }`;
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Shri Ram
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 leading-tight">
                Hardware & Electronics
              </p>
            </div>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass("/")}>
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link to="/products" className={linkClass("/products")}>
              <Package className="w-4 h-4" />
              Products
            </Link>
            {isAdmin ? (
              <>
                <Link
                  to="/admin/inventory"
                  className={linkClass("/admin/inventory")}
                >
                  <Package className="w-4 h-4" />
                  Inventory
                </Link>
                <Link to="/admin/sales" className={linkClass("/admin/sales")}>
                  <ShieldCheck className="w-4 h-4" />
                  Sales
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin/login" className={linkClass("/admin/login")}>
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
            {/* Dark Mode Toggle - Desktop */}
            <button
              onClick={toggleTheme}
              className="ml-2 p-2.5 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-800 transition-all duration-300"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </nav>
          {/* Mobile: Theme toggle + Menu toggle */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 pb-3 px-4 transition-colors">
          <nav className="flex flex-col gap-1 pt-2">
            <Link
              to="/"
              className={linkClass("/")}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/products"
              className={linkClass("/products")}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="w-4 h-4" />
              Products
            </Link>
            {isAdmin ? (
              <>
                <Link
                  to="/admin/inventory"
                  className={linkClass("/admin/inventory")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  Inventory
                </Link>
                <Link
                  to="/admin/sales"
                  className={linkClass("/admin/sales")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sales
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className={linkClass("/admin/login")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}