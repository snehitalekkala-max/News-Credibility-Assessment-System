import { ShieldCheck, SearchCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-slate-950 text-white min-h-[85vh] flex items-center">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* Left Side */}
        <div>

          <p className="text-cyan-400 font-semibold text-lg mb-4">
            AI Powered Fake News Detection
          </p>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            News Credibility
            <br />
            Assessment
            <span className="text-cyan-400"> System</span>
          </h1>

          <p className="text-gray-300 mt-6 text-lg leading-8 max-w-xl">
            Analyze news articles using Artificial Intelligence,
            Machine Learning, Sentiment Analysis, and Bias Detection
            to determine whether information is credible or fake.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-5">

            <Link to="/analyze">
              <button className="bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-xl font-semibold shadow-lg">
                Analyze News
              </button>
            </Link>

            <Link to="/compare">
              <button className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-500 hover:text-white transition px-8 py-4 rounded-xl font-semibold">
                Compare Articles
              </button>
            </Link>

          </div>

        </div>

        {/* Right Side */}
        <div className="flex justify-center">

          <div className="bg-slate-900 rounded-3xl p-12 shadow-2xl w-[380px]">

            <ShieldCheck
              size={120}
              className="text-cyan-400 mx-auto"
            />

            <div className="mt-8 flex justify-center">
              <SearchCheck
                size={60}
                className="text-green-400"
              />
            </div>

            <h2 className="text-center mt-6 text-3xl font-bold">
              AI Verification
            </h2>

            <p className="text-center text-gray-400 mt-4 text-lg">
              Trusted Machine Learning Prediction
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;