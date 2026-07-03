import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck size={32} className="text-cyan-400" />
          <h1 className="text-2xl font-bold text-cyan-400">
            NewsCredAI
          </h1>
        </Link>

        {/* Navigation */}
        <div className="flex gap-8 text-lg">
          <Link to="/" className="hover:text-cyan-400 transition">
            Home
          </Link>

          <a href="#features" className="hover:text-cyan-400 transition">
            Features
          </a>

          <a href="#about" className="hover:text-cyan-400 transition">
            About
          </a>
        </div>

        {/* Login Button */}
        <Link
          to="/login"
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-lg font-semibold"
        >
          Login
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;