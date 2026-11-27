import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { loginUser } from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await loginUser(formData);

      // Save JWT Token
      localStorage.setItem("token", response.access_token);

      // Save User Details
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      setMessage("Login Successful!");

      // Redirect after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}
      <header className="w-full border-b border-cyan-900/40 bg-slate-950">
        <div className="px-8 py-4">

          <Link
            to="/"
            className="flex items-center gap-3 w-fit"
          >
            {/* Shield Logo */}
            <ShieldCheck
              size={44}
              strokeWidth={2}
              className="text-cyan-400"
            />

            {/* Brand Name */}
            <span className="text-3xl font-bold tracking-tight">
              <span className="text-white">NewsCred</span>
              <span className="text-cyan-400">AI</span>
            </span>

          </Link>

        </div>
      </header>


      {/* ================= LOGIN AREA ================= */}
      <main className="min-h-[calc(100vh-81px)] flex items-center justify-center px-4">

        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md">

          {/* Login Heading */}
          <h1 className="text-3xl font-bold text-cyan-400 text-center mb-2">
            Welcome Back
          </h1>

          <p className="text-gray-400 text-center mb-8">
            Login to NewsCredAI
          </p>


          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-white block mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>


            {/* Password */}
            <div>
              <label className="text-white block mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>


            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg text-white font-semibold transition duration-200 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>


            {/* Message */}
            {message && (
              <p
                className={`text-center ${
                  message === "Login Successful!"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}

          </form>


          {/* Signup */}
          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{" "}

            <Link
              to="/signup"
              className="text-cyan-400 hover:underline"
            >
              Sign Up
            </Link>
          </p>

        </div>

      </main>

    </div>
  );
}

export default Login;