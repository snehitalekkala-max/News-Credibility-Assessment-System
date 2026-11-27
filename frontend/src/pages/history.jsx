import { useEffect, useState } from "react";

import {
  Search,
  FileText,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  X,
} from "lucide-react";

import { deleteHistory } from "../api/api";

function History() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHistory, setSelectedHistory] = useState(null);

  // =====================================================
  // GET HISTORY
  // =====================================================

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch history"
        );
      }

      console.log("HISTORY DATA =", data);

      const records = Array.isArray(data)
        ? data
        : data.history || [];

      setHistoryData(records);

    } catch (error) {
      console.error("History error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE HISTORY
  // =====================================================

  const handleDelete = async (historyId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteHistory(historyId);

      setHistoryData((previousHistory) =>
        previousHistory.filter(
          (item) => item.id !== historyId
        )
      );

      // Close modal if deleted item was open
      if (selectedHistory?.id === historyId) {
        setSelectedHistory(null);
      }

      alert("Analysis deleted successfully.");

    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error.message || "Failed to delete analysis."
      );
    }
  };

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredHistory = historyData.filter((item) => {

    const title =
      item.article_title ||
      item.title ||
      item.article ||
      item.text ||
      "News Article";

    const verdict =
      item.verdict ||
      item.prediction ||
      "";

    const matchesSearch = title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      verdict === filter;

    return matchesSearch && matchesFilter;
  });

  // =====================================================
  // VERDICT STYLE
  // =====================================================

  const getVerdictStyle = (verdict) => {

    switch (verdict) {

      case "True News":
        return {
          text: "text-[#00e676]",
          bg: "bg-[#00e676]/10",
          border: "border-[#00e676]/20",
          icon: <ShieldCheck size={17} />,
        };

      case "Fake News":
        return {
          text: "text-[#ff4d5a]",
          bg: "bg-[#ff4d5a]/10",
          border: "border-[#ff4d5a]/20",
          icon: <XCircle size={17} />,
        };

      case "Needs Verification":
        return {
          text: "text-yellow-400",
          bg: "bg-yellow-400/10",
          border: "border-yellow-400/20",
          icon: <AlertTriangle size={17} />,
        };

      default:
        return {
          text: "text-[#9fb3d1]",
          bg: "bg-[#9fb3d1]/10",
          border: "border-[#9fb3d1]/20",
          icon: <AlertTriangle size={17} />,
        };
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white px-6 py-10">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-3xl font-bold">
            Analysis History
          </h1>

          <p className="mt-4 text-[#8fa7c5]">
            Loading your analysis history...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="max-w-6xl mx-auto mb-8">

        <h1 className="text-3xl font-bold text-white">
          Analysis History
        </h1>

        <p className="mt-2 text-[#9fb3d1]">
          View and manage your previously analyzed news articles.
        </p>

      </div>

      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="max-w-6xl mx-auto">

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div
          className="
            bg-[#0f172a]
            border border-[#1e293b]
            rounded-2xl
            p-5
            mb-6
          "
        >

          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}

            <div className="relative flex-1">

              <Search
                size={19}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[#00d9ff]
                "
              />

              <input
                type="text"
                placeholder="Search analyzed articles..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  w-full
                  bg-[#111c32]
                  border border-[#1e293b]
                  rounded-xl
                  py-3
                  pl-11
                  pr-4
                  text-white
                  placeholder-[#7186a3]
                  outline-none
                  focus:border-[#00d9ff]
                  transition
                "
              />

            </div>

            {/* Filter */}

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="
                md:w-52
                bg-[#111c32]
                border border-[#1e293b]
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-[#00d9ff]
                cursor-pointer
              "
            >

              <option value="All">
                All Results
              </option>

              <option value="True News">
                True News
              </option>

              <option value="Fake News">
                Fake News
              </option>

              <option value="Needs Verification">
                Needs Verification
              </option>

            </select>

          </div>

        </div>

        {/* =================================================
            HISTORY COUNT
        ================================================= */}

        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">

            <FileText
              size={22}
              className="text-[#00d9ff]"
            />

            <h2 className="text-xl font-semibold">
              Your Analyses
            </h2>

          </div>

          <span className="text-sm text-[#8fa7c5]">

            {filteredHistory.length}

            {" "}

            {filteredHistory.length === 1
              ? "analysis"
              : "analyses"}

          </span>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredHistory.length === 0 ? (

          <div
            className="
              bg-[#0f172a]
              border border-[#1e293b]
              rounded-2xl
              p-12
              text-center
            "
          >

            <div
              className="
                w-20
                h-20
                mx-auto
                rounded-full
                bg-[#00d9ff]/10
                flex
                items-center
                justify-center
                mb-5
              "
            >

              <FileText
                size={38}
                className="text-[#00d9ff]"
              />

            </div>

            <h3 className="text-xl font-semibold text-white">
              No Analysis History
            </h3>

            <p className="text-[#8fa7c5] mt-2 max-w-md mx-auto">
              You haven't analyzed any news articles yet.
              Start analyzing news to see your results here.
            </p>

            <button
              onClick={() =>
                window.location.href = "/analyze"
              }
              className="
                mt-6
                px-6
                py-3
                rounded-xl
                bg-[#00d9ff]
                text-[#020617]
                font-semibold
                hover:bg-[#19e0ff]
                transition
              "
            >
              Analyze News
            </button>

          </div>

        ) : (

          /* =================================================
             HISTORY CARDS
          ================================================= */

          <div className="space-y-4">

            {filteredHistory.map((item) => {

              // IMPORTANT:
              // These match your FastAPI backend fields.

              const title =
                item.article_title ||
                item.title ||
                item.article ||
                item.text ||
                "News Article";

              const articleText =
                item.article_text ||
                item.article ||
                item.text ||
                item.content ||
                "Article content is not available.";

              const verdict =
                item.verdict ||
                item.prediction ||
                "Needs Verification";

              const score =
                item.credibility_score ??
                item.score ??
                0;

              const id = item.id;

              const style =
                getVerdictStyle(verdict);

              return (

                <div
                  key={id}
                  className="
                    bg-[#0f172a]
                    border border-[#1e293b]
                    rounded-2xl
                    p-6
                    hover:border-[#00d9ff]/40
                    transition
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      gap-5
                    "
                  >

                    {/* =================================================
                        ARTICLE ICON
                    ================================================= */}

                    <div
                      className="
                        w-12
                        h-12
                        rounded-xl
                        bg-[#00d9ff]/10
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      "
                    >

                      <FileText
                        size={25}
                        className="text-[#00d9ff]"
                      />

                    </div>

                    {/* =================================================
                        ARTICLE DETAILS
                    ================================================= */}

                    <div className="flex-1 min-w-0">

                      <h3
                        className="
                          text-lg
                          font-semibold
                          text-white
                          break-words
                        "
                      >
                        {title}
                      </h3>

                      {/* NO DATE / TIME HERE */}

                      <div className="flex flex-wrap items-center gap-4 mt-3">

                        {/* Verdict */}

                        <div
                          className={`
                            flex
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

                          {verdict}

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        SCORE
                    ================================================= */}

                    <div
                      className="
                        text-center
                        lg:text-right
                      "
                    >

                      <p className="text-xs text-[#8fa7c5]">
                        Credibility Score
                      </p>

                      <p
                        className="
                          text-2xl
                          font-bold
                          text-[#00d9ff]
                          mt-1
                        "
                      >
                        {score}%
                      </p>

                    </div>

                    {/* =================================================
                        BUTTONS
                    ================================================= */}

                    <div
                      className="
                        flex
                        gap-3
                        flex-shrink-0
                      "
                    >

                      {/* VIEW */}

                      <button
                        onClick={() =>
                          setSelectedHistory({
                            ...item,
                            article_text: articleText,
                          })
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-lg
                          bg-[#111c32]
                          border border-[#1e293b]
                          text-[#00d9ff]
                          hover:border-[#00d9ff]
                          transition
                        "
                      >

                        <Eye size={17} />

                        View

                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          handleDelete(id)
                        }
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-lg
                          bg-red-500/10
                          border border-red-500/20
                          text-red-400
                          hover:bg-red-500
                          hover:text-white
                          hover:border-red-500
                          transition
                        "
                      >

                        <Trash2 size={17} />

                        Delete

                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

      {/* =====================================================
          VIEW ARTICLE MODAL

          IMPORTANT:
          This is OUTSIDE the map().
      ===================================================== */}

      {selectedHistory && (

        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-6
          "
          onClick={() =>
            setSelectedHistory(null)
          }
        >

          <div
            className="
              bg-[#0f172a]
              border border-[#1e293b]
              rounded-2xl
              w-full
              max-w-3xl
              max-h-[85vh]
              overflow-y-auto
              p-8
              shadow-2xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex justify-between items-start gap-4">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  {selectedHistory.article_title ||
                    selectedHistory.title ||
                    "News Article"}
                </h2>

                <p className="text-[#8fa7c5] mt-1">
                  Analysis Details
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedHistory(null)
                }
                className="
                  text-gray-400
                  hover:text-white
                  transition
                "
              >

                <X size={25} />

              </button>

            </div>

            {/* =================================================
                ARTICLE CONTENT
            ================================================= */}

            <div className="mt-6">

              <h3 className="text-sm text-[#8fa7c5] mb-2">
                Article
              </h3>

              <div
                className="
                  bg-[#111c32]
                  border border-[#1e293b]
                  rounded-xl
                  p-5
                  text-gray-200
                  leading-7
                  whitespace-pre-wrap
                  max-h-80
                  overflow-y-auto
                "
              >

                {selectedHistory.article_text ||
                  selectedHistory.article ||
                  selectedHistory.text ||
                  selectedHistory.content ||
                  "Article content is not available."}

              </div>

            </div>

            {/* =================================================
                ANALYSIS DETAILS
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

              {/* VERDICT */}

              <div className="bg-[#111c32] rounded-xl p-4">

                <p className="text-sm text-[#8fa7c5]">
                  Verdict
                </p>

                <p
                  className={`
                    text-lg
                    font-bold
                    mt-1
                    ${
                      selectedHistory.verdict ===
                      "True News"
                        ? "text-green-400"
                        : selectedHistory.verdict ===
                          "Fake News"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }
                  `}
                >
                  {selectedHistory.verdict ||
                    selectedHistory.prediction ||
                    "N/A"}
                </p>

              </div>

              {/* CREDIBILITY */}

              <div className="bg-[#111c32] rounded-xl p-4">

                <p className="text-sm text-[#8fa7c5]">
                  Credibility Score
                </p>

                <p className="text-2xl font-bold text-cyan-400 mt-1">

                  {selectedHistory.credibility_score ??
                    selectedHistory.score ??
                    0}%

                </p>

              </div>

              {/* CONFIDENCE */}

              <div className="bg-[#111c32] rounded-xl p-4">

                <p className="text-sm text-[#8fa7c5]">
                  Confidence
                </p>

                <p className="text-2xl font-bold text-purple-400 mt-1">

                  {selectedHistory.ml_confidence ??
                    selectedHistory.confidence ??
                    0}%

                </p>

              </div>

            </div>

            {/* =================================================
                CLOSE BUTTON
            ================================================= */}

            <button
              onClick={() =>
                setSelectedHistory(null)
              }
              className="
                mt-6
                w-full
                py-3
                rounded-xl
                bg-cyan-500
                hover:bg-cyan-600
                text-slate-950
                font-semibold
                transition
              "
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default History;