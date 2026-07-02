import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Login to NewsCredAI
        </p>

        <form className="space-y-5">

          <div>
            <label className="text-white block mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-white block mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg text-white font-semibold"
          >
            Login
          </button>

        </form>

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
    </div>
  );
}

export default Login;