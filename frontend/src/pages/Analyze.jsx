import { useState } from "react";
import {
  ShieldCheck,
  Newspaper,
  Link2,
  Upload,
  Sparkles,
  BrainCircuit,
} from "lucide-react";

function Analyze() {
  const [article, setArticle] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 text-white py-12 shadow-lg">

        <div className="max-w-7xl mx-auto px-6">

          <div className="flex items-center gap-4">

            <div className="bg-cyan-500 p-4 rounded-2xl">
              <ShieldCheck size={40} />
            </div>

            <div>
              <h1 className="text-5xl font-bold">
                AI News Analyzer
              </h1>

              <p className="text-cyan-200 mt-2 text-lg">
                Detect fake news using Artificial Intelligence,
                Machine Learning and Bias Detection.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-2 gap-10">

          {/* LEFT PANEL */}

          <div className="bg-white rounded-3xl shadow-xl p-8">

            <div className="flex items-center gap-3 mb-8">

              <Newspaper
                className="text-cyan-600"
                size={32}
              />

              <h2 className="text-3xl font-bold">
                News Input
              </h2>

            </div>

            {/* Article */}

            <label className="font-semibold text-gray-700 text-lg">
              Paste News Article
            </label>

            <textarea
              rows={12}
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              placeholder="Paste your complete news article here..."
              className="mt-3 w-full rounded-2xl border border-gray-300 p-5 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
            />

            {/* Divider */}

            <div className="flex items-center my-8">

              <hr className="flex-grow" />

              <span className="mx-4 text-gray-500 font-semibold">
                OR
              </span>

              <hr className="flex-grow" />

            </div>

            {/* URL */}

            <label className="font-semibold text-gray-700 text-lg">
              News URL
            </label>

            <div className="relative mt-3">

              <Link2
                size={20}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news"
                className="w-full rounded-2xl border border-gray-300 pl-12 pr-4 py-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />

            </div>

            {/* Upload */}

            <button className="mt-6 w-full border-2 border-dashed border-cyan-400 rounded-2xl py-6 hover:bg-cyan-50 transition">

              <Upload
                className="mx-auto text-cyan-600"
                size={35}
              />

              <p className="mt-2 font-semibold">
                Upload TXT / PDF
              </p>

              <p className="text-sm text-gray-500">
                Drag & Drop or Click to Upload
              </p>

            </button>

            {/* Analyze Button */}

            <button
              className="mt-8 w-full bg-cyan-600 hover:bg-cyan-700 transition text-white py-4 rounded-2xl font-bold text-lg flex justify-center items-center gap-3"
            >

              <Sparkles size={22} />

              Analyze Article

            </button>

          </div>

          {/* RIGHT PANEL */}

          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-center">

            <div className="text-center">

              <BrainCircuit
                size={90}
                className="mx-auto text-cyan-500"
              />

              <h2 className="text-4xl font-bold mt-6">
                AI Analysis
              </h2>

              <p className="text-gray-500 mt-4 leading-7">

                Your analysis results will appear here.

                <br />

                Click <strong>Analyze Article</strong> to generate:

              </p>

            </div>

            <div className="grid grid-cols-2 gap-5 mt-10">

              <div className="bg-slate-100 rounded-2xl p-5">

                <h3 className="font-semibold text-gray-700">
                  Credibility
                </h3>

                <p className="text-3xl font-bold text-cyan-600 mt-3">
                  --
                </p>

              </div>

              <div className="bg-slate-100 rounded-2xl p-5">

                <h3 className="font-semibold text-gray-700">
                  Sentiment
                </h3>

                <p className="text-3xl font-bold text-green-600 mt-3">
                  --
                </p>

              </div>

              <div className="bg-slate-100 rounded-2xl p-5">

                <h3 className="font-semibold text-gray-700">
                  Bias
                </h3>

                <p className="text-3xl font-bold text-orange-500 mt-3">
                  --
                </p>

              </div>

              <div className="bg-slate-100 rounded-2xl p-5">

                <h3 className="font-semibold text-gray-700">
                  Reliability
                </h3>

                <p className="text-3xl font-bold text-blue-600 mt-3">
                  --
                </p>

              </div>

            </div>

            <div className="mt-8 bg-slate-100 rounded-2xl p-6">

              <h3 className="text-xl font-bold mb-3">
                AI Summary
              </h3>

              <p className="text-gray-500">
                Waiting for analysis...
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analyze;