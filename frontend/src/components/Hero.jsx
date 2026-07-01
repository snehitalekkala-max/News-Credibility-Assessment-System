import { ShieldCheck, SearchCheck } from "lucide-react";

function Hero() {
  return (
    <section className="bg-slate-950 text-white min-h-[85vh] flex items-center">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side */}
        <div>

          <p className="text-cyan-400 font-semibold mb-4">
            AI Powered Fake News Detection
          </p>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            News Credibility
            <br />
            Assessment
            <span className="text-cyan-400"> System</span>
          </h1>

          <p className="text-gray-300 mt-6 text-lg leading-8">
            Analyze news articles using Artificial Intelligence,
            Machine Learning, Sentiment Analysis and Bias Detection
            to identify whether information is credible or fake.
          </p>

          <div className="mt-10 flex gap-5">

            <button className="bg-cyan-500 hover:bg-cyan-600 px-8 py-4 rounded-xl font-semibold">
              Analyze News
            </button>

            <button className="border border-cyan-400 text-cyan-400 hover:bg-cyan-500 hover:text-white px-8 py-4 rounded-xl font-semibold">
              Learn More
            </button>

          </div>

        </div>

        {/* Right Side */}

        <div className="flex justify-center">

          <div className="bg-slate-900 rounded-3xl p-12 shadow-2xl">

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

            <h2 className="text-center mt-6 text-2xl font-bold">
              AI Verification
            </h2>

            <p className="text-center text-gray-400 mt-3">
              Trusted Machine Learning Prediction
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;