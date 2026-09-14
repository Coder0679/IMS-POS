import { Link } from "react-router-dom";
import {
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  PipetteIcon,
  Package,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

const categories = [
  { name: "Hardware", icon: Wrench, color: "from-blue-500 to-blue-600", desc: "Locks, Bolts, Nails & more" },
  { name: "Electrical", icon: Zap, color: "from-yellow-500 to-orange-500", desc: "Wires, Switches, Fans & more" },
  { name: "Tools", icon: Hammer, color: "from-gray-600 to-gray-700", desc: "Drills, Hammers, Sets & more" },
  { name: "Paint", icon: Paintbrush, color: "from-green-500 to-emerald-600", desc: "Asian Paints, Dulux & more" },
  { name: "Plumbing", icon: PipetteIcon, color: "from-cyan-500 to-blue-500", desc: "Pipes, Fittings, Taps & more" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 dark:from-orange-800 dark:via-red-900 dark:to-orange-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Open Now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Shri Shyam
              <br />
              <span className="text-orange-200 dark:text-orange-300">Hardware & Electronics</span>
            </h1>
            <p className="text-lg sm:text-xl text-orange-100 dark:text-orange-200 max-w-2xl mx-auto mb-8">
              Your one-stop shop for quality hardware, electrical supplies, tools,
              paints, and plumbing materials at best prices.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/products"
                className="bg-white text-orange-700 dark:bg-gray-900 dark:text-orange-400 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  View Products
                </span>
              </Link>
              <Link
                to="/admin/login"
                className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Our Product Categories
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Browse through our wide range of products
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-800 group"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
              >
                <cat.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop Info */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Visit Our Shop
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Main Market Road, Near Bus Stand
                  <br />
                  Your City, State - 000000
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Shop Timing
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monday - Saturday: 8:00 AM - 8:00 PM
                  <br />
                  Sunday: 9:00 AM - 2:00 PM
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Contact Us
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Phone: +91 98XXX XXXXX
                  <br />
                  WhatsApp Available
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 text-center py-6 text-sm border-t border-gray-800">
        <p>
          © {new Date().getFullYear()} Shri Shyam Hardware & Electronics. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
