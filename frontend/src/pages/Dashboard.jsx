import DashboardNavbar from "../components/DashboardNavbar";
import StatsCard from "../components/StatsCard";
import QuickActionCard from "../components/QuickActionCard";
import RecentActivity from "../components/RecentActivity";

import {
  Newspaper,
  GitCompare,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 shadow-xl border border-slate-800">

          <div className="flex justify-between items-center flex-wrap gap-6">

            <div>

              <h1 className="text-5xl font-bold">
                Welcome Back,
                <span className="text-cyan-400">
                  {" "} {user?.name}
                </span>{" "}
                👋
              </h1>

              <p className="text-gray-400 mt-5 text-lg leading-8">
                Analyze news articles using Artificial Intelligence,
                compare credibility, detect fake news,
                track your reports and make informed decisions.
              </p>

            </div>

            <div>

              <ShieldCheck
                size={110}
                className="text-cyan-400"
              />

            </div>

          </div>

        </div>

        {/* Statistics */}

        <div className="mt-12">

          <div className="flex items-center gap-3 mb-6">

            <BarChart3 className="text-cyan-400" />

            <h2 className="text-3xl font-bold">
              Dashboard Statistics
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatsCard
              title="Total Analyses"
              value="0"
              color="text-cyan-400"
            />

            <StatsCard
              title="Real News"
              value="0"
              color="text-green-400"
            />

            <StatsCard
              title="Fake News"
              value="0"
              color="text-red-400"
            />

            <StatsCard
              title="Average Score"
              value="--"
              color="text-purple-400"
            />

          </div>

        </div>

        {/* Quick Actions */}

        <div className="mt-14">

          <h2 className="text-3xl font-bold mb-6">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            <QuickActionCard
              icon={<Newspaper size={55} />}
              title="Analyze News"
              description="Paste article, upload PDF or enter a news URL to analyze credibility using AI."
              link="/analyze"
            />

            <QuickActionCard
              icon={<GitCompare size={55} />}
              title="Compare Articles"
              description="Compare two news articles and identify differences in credibility and bias."
              link="/compare"
            />

          </div>

        </div>

        {/* Recent Activity */}

        <div className="mt-14">

          <RecentActivity />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;