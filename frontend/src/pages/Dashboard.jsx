import { useEffect, useState } from "react";
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

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------------
  // Load logged-in user
  // -----------------------------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading user:", error);
    }
  }, []);

  // -----------------------------------
  // Fetch Analysis History
  // -----------------------------------
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No authentication token found.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/history`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to fetch history"
          );
        }

        console.log("HISTORY DATA =", data);

        // Backend may return either:
        // [ ... ]
        // or
        // { history: [ ... ] }

        if (Array.isArray(data)) {
          setHistory(data);
        } else if (Array.isArray(data.history)) {
          setHistory(data.history);
        } else if (Array.isArray(data.data)) {
          setHistory(data.data);
        } else {
          setHistory([]);
        }

      } catch (error) {
        console.error("History Error:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // -----------------------------------
  // Statistics
  // -----------------------------------

  const totalAnalyses = history.length;

  const realNews = history.filter(
    (item) =>
      item.verdict === "True News" ||
      item.verdict === "Real News"
  ).length;

  const fakeNews = history.filter(
    (item) =>
      item.verdict === "Fake News"
  ).length;

  const scores = history
    .map((item) => {
      const score =
        item.credibility_score ??
        item.score ??
        item.credibilityScore;

      return Number(score);
    })
    .filter((score) => !isNaN(score));

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce(
            (total, score) => total + score,
            0
          ) / scores.length
        )
      : null;

  // -----------------------------------
  // Recent analyses
  // -----------------------------------

  const recentHistory = [...history]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at ||
        a.createdAt ||
        a.date ||
        0
      );

      const dateB = new Date(
        b.created_at ||
        b.createdAt ||
        b.date ||
        0
      );

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* ========================================= */}
        {/* WELCOME SECTION */}
        {/* ========================================= */}

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 shadow-xl border border-slate-800">

          <div className="flex justify-between items-center flex-wrap gap-6">

            <div>

              <h1 className="text-5xl font-bold">

                Welcome Back,

                <span className="text-cyan-400">
                  {" "}
                  {user?.name || "User"}
                </span>

                {" "}👋

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


        {/* ========================================= */}
        {/* STATISTICS */}
        {/* ========================================= */}

        <div className="mt-12">

          <div className="flex items-center gap-3 mb-6">

            <BarChart3
              className="text-cyan-400"
              size={28}
            />

            <h2 className="text-3xl font-bold">
              Dashboard Statistics
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Total Analyses */}

            <StatsCard
              title="Total Analyses"
              value={
                loading
                  ? "..."
                  : totalAnalyses
              }
              color="text-cyan-400"
            />


            {/* Real News */}

            <StatsCard
              title="Real News"
              value={
                loading
                  ? "..."
                  : realNews
              }
              color="text-green-400"
            />


            {/* Fake News */}

            <StatsCard
              title="Fake News"
              value={
                loading
                  ? "..."
                  : fakeNews
              }
              color="text-red-400"
            />


            {/* Average Score */}

            <StatsCard
              title="Average Score"
              value={
                loading
                  ? "..."
                  : averageScore !== null
                  ? `${averageScore}%`
                  : "--"
              }
              color="text-purple-400"
            />

          </div>

        </div>


        {/* ========================================= */}
        {/* QUICK ACTIONS */}
        {/* ========================================= */}

        <div className="mt-14">

          <h2 className="text-3xl font-bold mb-6">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">

            <QuickActionCard
              icon={
                <Newspaper size={55} />
              }
              title="Analyze News"
              description="Paste article, upload PDF or enter a news URL to analyze credibility using AI."
              link="/analyze"
            />


            <QuickActionCard
              icon={
                <GitCompare size={55} />
              }
              title="Compare Articles"
              description="Compare two news articles and identify differences in credibility and bias."
              link="/compare"
            />

          </div>

        </div>


        {/* ========================================= */}
        {/* RECENT ACTIVITY */}
        {/* ========================================= */}

        <div className="mt-14">

          <RecentActivity
            history={recentHistory}
          />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;