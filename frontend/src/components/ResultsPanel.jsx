import MetricCard from "./MetricCard";
import SummaryCard from "./SummaryCard";
import {
  Bot,
  ShieldCheck,
  SearchCheck,
  ExternalLink,
  Newspaper,
  FileDown,
} from "lucide-react";

import { downloadReport } from "../api/api";


function ResultsPanel({ result, loading }) {

  // -------------------------------------------------------
  // Credibility Status
  // -------------------------------------------------------

  const credibilityStatus = (score) => {

    if (score >= 75) return "🟢 High";

    if (score >= 50) return "🟡 Medium";

    return "🔴 Low";
  };


  // -------------------------------------------------------
  // Verdict Color
  // -------------------------------------------------------

  const getVerdictColor = (status) => {

    switch (status) {

      case "credible":
        return "text-green-400";

      case "supported":
        return "text-green-400";

      case "misleading":
        return "text-orange-400";

      case "false":
        return "text-red-400";

      case "unverified":
        return "text-yellow-400";

      default:
        return "text-gray-300";
    }
  };


  // -------------------------------------------------------
  // Download Report
  // -------------------------------------------------------

  const handleDownload = async () => {

    console.log("Result =", result);

    if (!result) {

      alert("Please analyze a news article first.");

      return;
    }

    try {

      await downloadReport(result);

    } catch (err) {

      console.error(err);

      alert("Unable to download report.");
    }
  };


  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------

  return (

    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">

        <Bot className="text-cyan-400" />

        <h1 className="text-3xl font-bold text-white">
          Analysis Results
        </h1>

      </div>


      {loading ? (

        /* Loading */

        <div className="py-10 text-center">

          <div
            className="
              w-12 h-12
              border-4
              border-cyan-400
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p className="text-cyan-400 text-lg animate-pulse mt-5">
            AI is analyzing and verifying the news...
          </p>

        </div>

      ) : result ? (

        <>

          {/* ================================================= */}
          {/* Main Metrics */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <MetricCard
              title="Final Verdict"
              value={result.verdict || "Needs Verification"}
              color={getVerdictColor(result.status)}
            />

            <MetricCard
              title="Credibility Score"
              value={`${result.credibility_score ?? 0}%`}
              color={
                result.credibility_score >= 75
                  ? "text-green-400"
                  : result.credibility_score >= 50
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            />

            <MetricCard
              title="Sentiment"
              value={result.sentiment?.label || "Unknown"}
              color="text-yellow-400"
            />

            <MetricCard
              title="Bias"
              value={`${result.bias?.score ?? 0}%`}
              color="text-red-400"
            />

            <MetricCard
              title="Clickbait"
              value={`${result.clickbait?.score ?? 0}%`}
              color="text-blue-400"
            />

            <MetricCard
              title="Fact Checks Found"
              value={result.fact_check?.claims_found ?? 0}
              color="text-purple-400"
            />

          </div>


          {/* ================================================= */}
          {/* Final Credibility Assessment */}
          {/* ================================================= */}

          <div className="mt-6 bg-slate-800 rounded-xl p-5 border border-slate-700">

            <div className="flex items-center gap-2">

              <ShieldCheck className="text-cyan-400" size={22} />

              <h2 className="text-cyan-400 font-semibold text-lg">
                Final Credibility Assessment
              </h2>

            </div>

            <p
              className={`
                text-2xl
                font-bold
                mt-3
                ${getVerdictColor(result.status)}
              `}
            >
              {result.verdict || "Needs Verification"}
            </p>

            <p className="text-gray-300 mt-3 leading-relaxed">

              {result.verdict_reason ||
                "No explanation is available for this verdict."}

            </p>

            <div className="mt-4 pt-4 border-t border-slate-700">

              <p className="text-gray-400 text-sm">
                Credibility Status
              </p>

              <p className="text-xl font-bold text-white mt-1">

                {credibilityStatus(
                  result.credibility_score ?? 0
                )}

              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* Google Fact Check */}
          {/* ================================================= */}

          <div className="mt-8">

            <div className="flex items-center gap-2 mb-4">

              <SearchCheck
                className="text-cyan-400"
                size={22}
              />

              <h2 className="text-xl font-semibold text-cyan-400">
                Google Fact Check
              </h2>

            </div>


            {result.fact_check?.claims?.length > 0 ? (

              <div className="space-y-4">

                {result.fact_check.claims.map(
                  (claim, index) => (

                    <div
                      key={index}
                      className="
                        bg-slate-800
                        p-5
                        rounded-xl
                        border
                        border-slate-700
                      "
                    >

                      {/* Claim */}

                      <p className="text-gray-400 text-sm">
                        Matched Claim
                      </p>

                      <h3 className="text-white font-semibold mt-1 leading-relaxed">

                        {claim.text ||
                          claim.claim ||
                          "Claim information unavailable"}

                      </h3>


                      {/* Direct-format rating */}

                      {claim.rating && (

                        <div className="mt-4">

                          <p className="text-gray-400 text-sm">
                            Rating
                          </p>

                          <p className="text-orange-400 font-bold text-lg mt-1">
                            {claim.rating}
                          </p>

                        </div>

                      )}


                      {/* Direct-format publisher */}

                      {claim.publisher && (

                        <div className="mt-3">

                          <p className="text-gray-400 text-sm">
                            Fact Checked By
                          </p>

                          <p className="text-gray-200 mt-1">
                            {claim.publisher}
                          </p>

                        </div>

                      )}


                      {/* Nested reviews format */}

                      {claim.reviews?.length > 0 && (

                        <div className="mt-4 space-y-3">

                          {claim.reviews.map(
                            (review, reviewIndex) => (

                              <div
                                key={reviewIndex}
                                className="
                                  bg-slate-900
                                  rounded-lg
                                  p-4
                                "
                              >

                                <p className="text-gray-400 text-sm">
                                  Rating
                                </p>

                                <p className="text-orange-400 font-bold text-lg mt-1">
                                  {review.rating || "Not available"}
                                </p>


                                {review.publisher && (

                                  <p className="text-gray-300 mt-2">

                                    <span className="text-gray-400">
                                      Publisher:{" "}
                                    </span>

                                    {review.publisher}

                                  </p>

                                )}


                                {review.url && (

                                  <a
                                    href={review.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                      inline-flex
                                      items-center
                                      gap-2
                                      text-cyan-400
                                      hover:underline
                                      mt-3
                                    "
                                  >

                                    View Fact Check

                                    <ExternalLink size={15} />

                                  </a>

                                )}

                              </div>

                            )
                          )}

                        </div>

                      )}


                      {/* Direct-format URL */}

                      {claim.url && (

                        <a
                          href={claim.url}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            inline-flex
                            items-center
                            gap-2
                            text-cyan-400
                            hover:underline
                            mt-4
                          "
                        >

                          View Fact Check

                          <ExternalLink size={15} />

                        </a>

                      )}

                    </div>

                  )
                )}

              </div>

            ) : (

              <div
                className="
                  bg-slate-800
                  p-5
                  rounded-xl
                  border
                  border-slate-700
                "
              >

                <p className="text-gray-300">
                  No matching fact-check claim was found for this news.
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  This does not mean the news is automatically true or false.
                  The claim may not have been previously reviewed by a
                  participating fact-checking publisher.
                </p>

              </div>

            )}

          </div>


          {/* ================================================= */}
          {/* AI Summary */}
          {/* ================================================= */}

          <div className="mt-8">

            <SummaryCard
              title="AI Summary"
              summary={
                result.summary?.text ||
                "No summary available."
              }
            />

          </div>


          {/* ================================================= */}
          {/* Keywords */}
          {/* ================================================= */}

          <div className="mt-8">

            <h2 className="text-xl font-semibold text-cyan-400 mb-4">
              Keywords
            </h2>


            {result.keywords?.top_keywords?.length > 0 ? (

              <div className="flex flex-wrap gap-3">

                {result.keywords.top_keywords.map(
                  (item, index) => (

                    <span
                      key={index}
                      className="
                        bg-cyan-500/20
                        text-cyan-300
                        px-3
                        py-2
                        rounded-full
                      "
                    >

                      {Array.isArray(item)
                        ? item[0]
                        : typeof item === "object"
                        ? item.word
                        : item}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="text-gray-400">
                No keywords extracted.
              </p>

            )}

          </div>


          {/* ================================================= */}
          {/* Named Entities */}
          {/* ================================================= */}

          <div className="mt-8">

            <h2 className="text-xl font-semibold text-cyan-400 mb-4">
              Named Entities
            </h2>

            <div className="space-y-3 text-gray-300">

              <p>

                <strong>👤 Persons:</strong>{" "}

                {result.entities?.persons?.length
                  ? result.entities.persons.join(", ")
                  : "None"}

              </p>

              <p>

                <strong>🏢 Organizations:</strong>{" "}

                {result.entities?.organizations?.length
                  ? result.entities.organizations.join(", ")
                  : "None"}

              </p>

              <p>

                <strong>🌍 Locations:</strong>{" "}

                {result.entities?.locations?.length
                  ? result.entities.locations.join(", ")
                  : "None"}

              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* Related News */}
          {/* ================================================= */}

          <div className="mt-8">

            <div className="flex items-center gap-2 mb-4">

              <Newspaper
                className="text-cyan-400"
                size={22}
              />

              <h2 className="text-xl font-semibold text-cyan-400">
                Related News
              </h2>

            </div>


            {result.related_news?.articles?.length > 0 ? (

              <div className="space-y-4">

                {result.related_news.articles.map(
                  (article, index) => (

                    <div
                      key={index}
                      className="
                        bg-slate-800
                        p-4
                        rounded-xl
                        border
                        border-slate-700
                      "
                    >

                      <h3 className="text-white font-semibold">
                        {article.title}
                      </h3>

                      {article.source && (

                        <p className="text-gray-400 text-sm mt-2">
                          {article.source}
                        </p>

                      )}

                      {article.description && (

                        <p className="text-gray-300 mt-2 leading-relaxed">
                          {article.description}
                        </p>

                      )}

                      {article.url && (

                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            inline-flex
                            items-center
                            gap-2
                            text-cyan-400
                            hover:underline
                            mt-3
                          "
                        >

                          Read Full Article

                          <ExternalLink size={15} />

                        </a>

                      )}

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="text-gray-400">
                No related news found.
              </p>

            )}

          </div>


          {/* ================================================= */}
          {/* Download Report */}
          {/* ================================================= */}

          <button
            onClick={handleDownload}
            className="
              mt-8
              w-full
              bg-cyan-500
              hover:bg-cyan-600
              py-4
              rounded-xl
              text-white
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition-colors
            "
          >

            <FileDown size={20} />

            Download Report

          </button>

        </>

      ) : (

        <p className="text-gray-400">
          Analyze an article, URL, or PDF to view results.
        </p>

      )}

    </div>
  );
}


export default ResultsPanel;