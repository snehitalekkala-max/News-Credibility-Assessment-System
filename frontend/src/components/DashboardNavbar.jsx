import { ShieldCheck, LogOut, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function DashboardNavbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2"
        >
          <ShieldCheck size={32} className="text-cyan-400" />
          <h1 className="text-2xl font-bold text-cyan-400">
            NewsCredAI
          </h1>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-10 text-lg">

          <Link
            to="/dashboard"
            className="hover:text-cyan-400 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/history"
            className="hover:text-cyan-400 transition"
          >
            History
          </Link>

          <Link
            to="/profile"
            className="hover:text-cyan-400 transition"
          >
            Profile
          </Link>

        </div>

        {/* User */}
        <div className="flex items-center gap-5">

          <div className="flex items-center gap-2">
            <UserCircle
              size={28}
              className="text-cyan-400"
            />

            <span className="font-semibold">
              {user?.name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}

export default DashboardNavbar;