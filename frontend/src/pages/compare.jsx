import { useState } from "react";
import axios from "axios";
import {
  GitCompare,
  Newspaper,
  Search,
  Loader2,
} from "lucide-react";

export default function Compare() {
  const [article1, setArticle1] = useState("");
  const [article2, setArticle2] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const compareArticles = async () => {
    if (!article1.trim() || !article2.trim()) {
      alert("Please enter both articles.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8000/news/compare",
        {
          article1,
          article2,
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Comparison failed.");
    } finally {
      setLoading(false);
    }
  };

  const verdictColor = (verdict) => {
    if (!verdict) return "bg-gray-500";

    if (verdict.toLowerCase().includes("contradict"))
      return "bg-red-500";

    if (verdict.toLowerCase().includes("similar"))
      return "bg-green-500";

    return "bg-yellow-500";
  };

  return (
    <div className="min-h-screen bg-[#050B1E] text-white">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}

        <div className="text-center mb-12">

          <div className="flex justify-center mb-5">

            <div className="bg-cyan-500/20 p-5 rounded-full">

              <GitCompare
                size={60}
                className="text-cyan-400"
              />

            </div>

          </div>

          <h1 className="text-5xl font-bold">
            Compare News Articles
          </h1>

          <p className="text-slate-400 mt-4 text-lg max-w-3xl mx-auto">
            Compare two news articles using AI to detect
            similarities, contradictions, shared entities,
            sentiment and media bias.
          </p>

        </div>

        {/* Input Section */}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Article 1 */}

          <div className="bg-[#182235] border border-slate-700 rounded-3xl p-6">

            <div className="flex items-center gap-3 mb-5">

              <Newspaper className="text-cyan-400" />

              <h2 className="text-2xl font-semibold">
                Article 1
              </h2>

            </div>

            <textarea
              rows={14}
              placeholder="Paste the first news article..."
              value={article1}
              onChange={(e) => setArticle1(e.target.value)}
              className="
                w-full
                bg-[#253046]
                border
                border-slate-600
                rounded-xl
                p-5
                text-white
                placeholder:text-slate-400
                focus:ring-2
                focus:ring-cyan-400
                outline-none
                resize-none
              "
            />

          </div>

          {/* Article 2 */}

          <div className="bg-[#182235] border border-slate-700 rounded-3xl p-6">

            <div className="flex items-center gap-3 mb-5">

              <Newspaper className="text-cyan-400" />

              <h2 className="text-2xl font-semibold">
                Article 2
              </h2>

            </div>

            <textarea
              rows={14}
              placeholder="Paste the second news article..."
              value={article2}
              onChange={(e) => setArticle2(e.target.value)}
              className="
                w-full
                bg-[#253046]
                border
                border-slate-600
                rounded-xl
                p-5
                text-white
                placeholder:text-slate-400
                focus:ring-2
                focus:ring-cyan-400
                outline-none
                resize-none
              "
            />

          </div>

        </div>

        {/* Compare Button */}

        <div className="mt-10 text-center">

          <button
            onClick={compareArticles}
            disabled={loading}
            className="
              bg-cyan-500
              hover:bg-cyan-600
              transition
              px-10
              py-4
              rounded-xl
              font-semibold
              text-lg
              flex
              items-center
              gap-3
              mx-auto
              disabled:opacity-60
            "
          >

            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <Search />
                Compare Articles
              </>
            )}

          </button>

        </div>

        {/* Results Start */}

        {result && (
                    <div className="mt-14 space-y-8">

            {/* Top Cards */}

            <div className="grid lg:grid-cols-2 gap-8">

              {/* Similarity Card */}

              <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

                <div className="flex justify-between items-center">

                  <h2 className="text-2xl font-bold">
                    Similarity Score
                  </h2>

                  <GitCompare
                    size={42}
                    className="text-cyan-400"
                  />

                </div>

                <div className="mt-8">

                  <h1 className="text-6xl font-bold text-cyan-400">
                    {Number(result.similarity).toFixed(2)}%
                  </h1>

                </div>

                <div className="mt-8 h-4 bg-slate-700 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-cyan-400 transition-all duration-700"
                    style={{
                      width: `${result.similarity}%`,
                    }}
                  />

                </div>

                <p className="mt-5 text-slate-400">

                  AI semantic similarity between the two
                  articles.

                </p>

              </div>

              {/* Verdict Card */}

              <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

                <h2 className="text-2xl font-bold mb-8">

                  Overall Verdict

                </h2>

                <span
                  className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${verdictColor(
                    result.overall_verdict
                  )}`}
                >
                  {result.overall_verdict}
                </span>

                <div className="mt-8">

                  <p className="text-slate-300 leading-7">

                    This verdict is generated by combining
                    semantic similarity,
                    contradiction detection,
                    entity matching,
                    sentiment analysis,
                    and media bias detection.

                  </p>

                </div>

              </div>

            </div>

            {/* Summary */}

            <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

              <h2 className="text-2xl font-bold mb-6">

                AI Summary

              </h2>

              <p className="text-slate-300 leading-8">

                {result.summary}

              </p>

            </div>

            {/* Common Keywords */}

            <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

              <h2 className="text-2xl font-bold mb-6">

                Common Keywords

              </h2>

              <div className="flex flex-wrap gap-3">

                {result.common_keywords &&
                result.common_keywords.length > 0 ? (

                  result.common_keywords.map((keyword, index) => (

                    <span
                      key={index}
                      className="
                      px-4
                      py-2
                      rounded-full
                      bg-cyan-500/20
                      text-cyan-300
                      border
                      border-cyan-500/30
                      "
                    >
                      #{keyword}
                    </span>

                  ))

                ) : (

                  <span className="text-slate-400">

                    No common keywords found.

                  </span>

                )}

              </div>

            </div>
                        {/* Shared Entities */}

            <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

              <h2 className="text-2xl font-bold mb-8">
                Shared Entities
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">

                {/* Locations */}

                <div>

                  <h3 className="text-cyan-400 text-xl font-semibold mb-4">
                    📍 Locations
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {result.shared_entities?.locations?.length > 0 ? (

                      result.shared_entities.locations.map((location, index) => (

                        <span
                          key={index}
                          className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 border border-green-500/30"
                        >
                          {location}
                        </span>

                      ))

                    ) : (

                      <span className="text-slate-400">
                        No shared locations
                      </span>

                    )}

                  </div>

                </div>

                {/* Persons */}

                <div>

                  <h3 className="text-cyan-400 text-xl font-semibold mb-4">
                    👤 Persons
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {result.shared_entities?.persons?.length > 0 ? (

                      result.shared_entities.persons.map((person, index) => (

                        <span
                          key={index}
                          className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        >
                          {person}
                        </span>

                      ))

                    ) : (

                      <span className="text-slate-400">
                        No shared persons
                      </span>

                    )}

                  </div>

                </div>

                {/* Organizations */}

                <div>

                  <h3 className="text-cyan-400 text-xl font-semibold mb-4">
                    🏢 Organizations
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {result.shared_entities?.organizations?.length > 0 ? (

                      result.shared_entities.organizations.map((org, index) => (

                        <span
                          key={index}
                          className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        >
                          {org}
                        </span>

                      ))

                    ) : (

                      <span className="text-slate-400">
                        No shared organizations
                      </span>

                    )}

                  </div>

                </div>

                {/* Other Entities */}

                <div>

                  <h3 className="text-cyan-400 text-xl font-semibold mb-4">
                    🌍 Other Entities
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {result.shared_entities?.other?.length > 0 ? (

                      result.shared_entities.other.map((item, index) => (

                        <span
                          key={index}
                          className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        >
                          {item}
                        </span>

                      ))

                    ) : (

                      <span className="text-slate-400">
                        No other shared entities
                      </span>

                    )}

                  </div>

                </div>

              </div>

            </div>
                        {/* Sentiment & Bias */}

            <div className="grid lg:grid-cols-2 gap-8">

              {/* Sentiment Analysis */}

              <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

                <h2 className="text-2xl font-bold mb-6">
                  😊 Sentiment Analysis
                </h2>

                <div className="space-y-5">

                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">

                    <span className="text-lg font-medium">
                      Article 1
                    </span>

                    <span className="px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                      {result.sentiment?.article1 || "Unknown"}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-lg font-medium">
                      Article 2
                    </span>

                    <span className="px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                      {result.sentiment?.article2 || "Unknown"}
                    </span>

                  </div>

                </div>

              </div>

              {/* Bias Detection */}

              <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

                <h2 className="text-2xl font-bold mb-6">
                  🛡 Bias Detection
                </h2>

                <div className="space-y-5">

                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">

                    <span className="text-lg font-medium">
                      Article 1
                    </span>

                    <span
                      className={`px-4 py-2 rounded-full font-semibold ${
                        result.bias?.article1?.detected
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30"
                      }`}
                    >
                      {result.bias?.article1?.detected
                        ? "Bias Detected"
                        : "No Bias"}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-lg font-medium">
                      Article 2
                    </span>

                    <span
                      className={`px-4 py-2 rounded-full font-semibold ${
                        result.bias?.article2?.detected
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30"
                      }`}
                    >
                      {result.bias?.article2?.detected
                        ? "Bias Detected"
                        : "No Bias"}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* Contradiction Detection */}

            <div className="bg-[#182235] border border-slate-700 rounded-3xl p-8 shadow-lg">

              <h2 className="text-2xl font-bold mb-6">
                ⚖ Contradiction Detection
              </h2>

              <div className="flex items-center justify-between">

                <p className="text-slate-300 text-lg">

                  AI checked whether both articles report conflicting information.

                </p>

                <span
                  className={`px-5 py-3 rounded-full font-bold ${
                    result.contradiction
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                  }`}
                >
                  {result.contradiction
                    ? "Contradiction Found"
                    : "No Contradiction"}
                </span>

              </div>

            </div>
                      </div>
        )}

        {/* Footer */}

        <div className="mt-16 border-t border-slate-800 pt-8 text-center">

          <p className="text-slate-500 text-sm">
            Powered by <span className="text-cyan-400 font-semibold">NewsCredAI</span>
          </p>

          <p className="text-slate-600 text-xs mt-2">
            AI-Powered News Comparison & Credibility Analysis
          </p>

        </div>

      </div>

    </div>
  );
}