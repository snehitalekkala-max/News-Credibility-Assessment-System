import { useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import AnalyzeInput from "../components/AnalyzeInput";
import ResultsPanel from "../components/ResultsPanel";
import { Sparkles } from "lucide-react";

function Analyze() {
  const [article, setArticle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 shadow-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <Sparkles
              size={45}
              className="text-cyan-400"
            />

            <div>
              <h1 className="text-5xl font-bold">
                Analyze News
              </h1>

              <p className="text-gray-400 mt-4 text-lg leading-8">
                Verify the credibility of news articles using Artificial Intelligence.
                Paste article text, provide a news URL, or upload a PDF/TXT file
                to receive a detailed credibility analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-10 items-start">

          <AnalyzeInput
            article={article}
            setArticle={setArticle}
            result={result}
            setResult={setResult}
            loading={loading}
            setLoading={setLoading}
          />

          <ResultsPanel
            result={result}
            loading={loading}
            article={article}
          />

        </div>
      </div>
    </div>
  );
}

export default Analyze;