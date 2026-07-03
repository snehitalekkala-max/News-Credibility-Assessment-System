import { Newspaper } from "lucide-react";

function RecentActivity() {
  return (
    <div className="bg-slate-900 rounded-2xl p-8 shadow-lg">

      <h2 className="text-3xl font-bold text-cyan-400 mb-6">
        Recent Activity
      </h2>

      <div className="flex flex-col items-center justify-center py-10">

        <Newspaper
          size={60}
          className="text-cyan-400 mb-4"
        />

        <h3 className="text-2xl font-semibold">
          No analyses yet
        </h3>

        <p className="text-gray-400 mt-3 text-center">
          Start analyzing your first news article.
          <br />
          Your reports will appear here.
        </p>

      </div>

    </div>
  );
}

export default RecentActivity;