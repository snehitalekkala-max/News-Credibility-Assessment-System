import { useEffect, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";

import {
  User,
  Mail,
  FileText,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  BarChart3,
  Loader2,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Profile() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET USER + HISTORY
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data:", error);
      }
    }

    fetchHistory();
  }, []);

  // =====================================================
  // FETCH HISTORY
  // =====================================================

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/history`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load profile activity"
        );
      }

      console.log("PROFILE HISTORY =", data);

      setHistory(data.history || []);
    } catch (error) {
      console.error("Profile history error:", error);

      setError(
        error.message || "Failed to load activity."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalAnalyses = history.length;

  const trueNews = history.filter(
    (item) =>
      item.verdict === "True News" ||
      item.status === "credible"
  ).length;

  const fakeNews = history.filter(
    (item) =>
      item.verdict === "Fake News" ||
      item.status === "fake"
  ).length;

  const needsVerification = history.filter(
    (item) =>
      item.verdict === "Needs Verification" ||
      item.status === "needs_verification" ||
      item.status === "unverified"
  ).length;

  const totalScore = history.reduce(
    (sum, item) =>
      sum + Number(item.credibility_score || 0),
    0
  );

  const averageScore =
    totalAnalyses > 0
      ? Math.round(totalScore / totalAnalyses)
      : 0;

  // =====================================================
  // VERDICT STYLE
  // =====================================================

  const getVerdictStyle = (verdict) => {
    if (verdict === "True News") {
      return {
        text: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
        icon: <ShieldCheck size={17} />,
      };
    }

    if (verdict === "Fake News") {
      return {
        text: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/20",
        icon: <XCircle size={17} />,
      };
    }

    return {
      text: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
      icon: <AlertTriangle size={17} />,
    };
  };

  // =====================================================
  // PROFILE UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* ================================================= */}
        {/* PROFILE HEADER */}
        {/* ================================================= */}

        <div
          className="
            bg-gradient-to-r
            from-slate-900
            to-slate-800
            rounded-3xl
            p-10
            border
            border-slate-800
            shadow-xl
          "
        >

          <div className="flex items-center gap-6">

            {/* Profile Icon */}

            <div
              className="
                w-24
                h-24
                rounded-full
                bg-cyan-400/10
                border
                border-cyan-400/20
                flex
                items-center
                justify-center
              "
            >
              <User
                size={48}
                className="text-cyan-400"
              />
            </div>

            {/* User Information */}

            <div>

              <p className="text-gray-400 text-sm">
                Welcome back
              </p>

              <h1 className="text-4xl font-bold mt-1">
                {user?.name || "User"}
              </h1>

              <p className="text-gray-400 mt-2">
                {user?.email || "No email available"}
              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* ACCOUNT INFORMATION */}
        {/* ================================================= */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Account Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Full Name */}

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
              "
            >

              <div className="flex items-center gap-3">

                <User
                  size={24}
                  className="text-cyan-400"
                />

                <span className="text-gray-400">
                  Full Name
                </span>

              </div>

              <p className="text-xl font-semibold mt-5">
                {user?.name || "Not available"}
              </p>

            </div>

            {/* Email */}

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
              "
            >

              <div className="flex items-center gap-3">

                <Mail
                  size={24}
                  className="text-cyan-400"
                />

                <span className="text-gray-400">
                  Email Address
                </span>

              </div>

              <p className="text-xl font-semibold mt-5 break-all">
                {user?.email || "Not available"}
              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* YOUR ACTIVITY */}
        {/* ================================================= */}

        <div className="mt-12">

          <div className="flex items-center gap-3 mb-6">

            <BarChart3
              size={26}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-bold">
              Your Activity
            </h2>

          </div>

          {/* LOADING */}

          {loading ? (

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-10
                flex
                justify-center
                items-center
              "
            >

              <Loader2
                size={35}
                className="
                  text-cyan-400
                  animate-spin
                "
              />

              <span className="ml-3 text-gray-400">
                Loading activity...
              </span>

            </div>

          ) : error ? (

            /* ERROR */

            <div
              className="
                bg-red-400/10
                border
                border-red-400/20
                rounded-2xl
                p-6
                text-red-400
              "
            >
              {error}
            </div>

          ) : (

            /* STATISTICS */

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-5
                gap-5
              "
            >

              {/* TOTAL */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                "
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-gray-400">
                      Articles Analyzed
                    </p>

                    <p
                      className="
                        text-4xl
                        font-bold
                        text-cyan-400
                        mt-4
                      "
                    >
                      {totalAnalyses}
                    </p>

                  </div>

                  <FileText
                    size={30}
                    className="text-cyan-400"
                  />

                </div>

              </div>

              {/* TRUE NEWS */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                "
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-gray-400">
                      Credible News
                    </p>

                    <p
                      className="
                        text-4xl
                        font-bold
                        text-green-400
                        mt-4
                      "
                    >
                      {trueNews}
                    </p>

                  </div>

                  <ShieldCheck
                    size={30}
                    className="text-green-400"
                  />

                </div>

              </div>

              {/* FAKE NEWS */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                "
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-gray-400">
                      Fake News
                    </p>

                    <p
                      className="
                        text-4xl
                        font-bold
                        text-red-400
                        mt-4
                      "
                    >
                      {fakeNews}
                    </p>

                  </div>

                  <XCircle
                    size={30}
                    className="text-red-400"
                  />

                </div>

              </div>

              {/* NEEDS VERIFICATION */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                "
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-gray-400">
                      Needs Verification
                    </p>

                    <p
                      className="
                        text-4xl
                        font-bold
                        text-yellow-400
                        mt-4
                      "
                    >
                      {needsVerification}
                    </p>

                  </div>

                  <AlertTriangle
                    size={30}
                    className="text-yellow-400"
                  />

                </div>

              </div>

              {/* AVERAGE SCORE */}

              <div
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-6
                "
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-gray-400">
                      Average Score
                    </p>

                    <p
                      className="
                        text-4xl
                        font-bold
                        text-purple-400
                        mt-4
                      "
                    >
                      {totalAnalyses > 0
                        ? `${averageScore}%`
                        : "--"}
                    </p>

                  </div>

                  <BarChart3
                    size={30}
                    className="text-purple-400"
                  />

                </div>

              </div>

            </div>

          )}

        </div>

        {/* ================================================= */}
        {/* RECENT ANALYSES */}
        {/* ================================================= */}

        <div className="mt-12">

          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

              <FileText
                size={26}
                className="text-cyan-400"
              />

              <h2 className="text-2xl font-bold">
                Recent Analyses
              </h2>

            </div>

            <span className="text-gray-400 text-sm">
              Latest {Math.min(history.length, 5)} analyses
            </span>

          </div>

          {/* NO HISTORY */}

          {history.length === 0 ? (

            <div
              className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-12
                text-center
              "
            >

              <FileText
                size={45}
                className="
                  mx-auto
                  text-cyan-400
                "
              />

              <h3 className="text-xl font-semibold mt-5">
                No analyses yet
              </h3>

              <p className="text-gray-400 mt-2">
                Analyze some news articles to see your
                activity here.
              </p>

            </div>

          ) : (

            /* RECENT HISTORY */

            <div className="space-y-4">

              {history.slice(0, 5).map((item) => {

                const style = getVerdictStyle(
                  item.verdict
                );

                return (

                  <div
                    key={item.id}
                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-2xl
                      p-6
                      hover:border-cyan-400/30
                      transition
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        gap-5
                      "
                    >

                      {/* ICON */}

                      <div
                        className="
                          w-12
                          h-12
                          rounded-xl
                          bg-cyan-400/10
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                        "
                      >

                        <FileText
                          size={25}
                          className="text-cyan-400"
                        />

                      </div>

                      {/* ARTICLE */}

                      <div className="flex-1 min-w-0">

                        <h3
                          className="
                            text-lg
                            font-semibold
                            break-words
                          "
                        >
                          {item.article_title ||
                            "News Article"}
                        </h3>

                        {/* VERDICT ONLY */}
                        {/* DATE AND TIME REMOVED */}

                        <div className="mt-3">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-2
                              px-3
                              py-1.5
                              rounded-lg
                              border
                              text-sm
                              font-medium
                              ${style.text}
                              ${style.bg}
                              ${style.border}
                            `}
                          >

                            {style.icon}

                            {item.verdict ||
                              "Needs Verification"}

                          </span>

                        </div>

                      </div>

                      {/* SCORE */}

                      <div
                        className="
                          text-center
                          md:text-right
                        "
                      >

                        <p className="
                          text-xs
                          text-gray-400
                        ">
                          Credibility
                        </p>

                        <p
                          className="
                            text-2xl
                            font-bold
                            text-cyan-400
                            mt-1
                          "
                        >
                          {item.credibility_score ?? 0}%
                        </p>

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Profile;