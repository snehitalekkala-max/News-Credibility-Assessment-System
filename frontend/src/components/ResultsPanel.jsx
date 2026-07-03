import MetricCard from "./MetricCard";
import SummaryCard from "./SummaryCard";
import { Bot } from "lucide-react";

function ResultsPanel() {
  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <Bot className="text-cyan-400" />

        <h1 className="text-3xl font-bold text-white">
          Analysis Results
        </h1>

      </div>

      <p className="text-gray-400 mb-8">
        Waiting for analysis...
      </p>

      <div className="grid grid-cols-2 gap-5">

        <MetricCard
          title="Prediction"
          value="--"
          color="text-cyan-400"
        />

        <MetricCard
          title="Credibility"
          value="--"
          color="text-green-400"
        />

        <MetricCard
          title="Confidence"
          value="--"
          color="text-purple-400"
        />

        <MetricCard
          title="Sentiment"
          value="--"
          color="text-yellow-400"
        />

        <MetricCard
          title="Bias"
          value="--"
          color="text-red-400"
        />

        <MetricCard
          title="Source"
          value="--"
          color="text-blue-400"
        />

      </div>

      <div className="mt-8">
        <SummaryCard />
      </div>

      <button
        disabled
        className="mt-8 w-full bg-slate-700 text-gray-400 py-4 rounded-xl cursor-not-allowed"
      >
        Download Report
      </button>

    </div>
  );
}

export default ResultsPanel;