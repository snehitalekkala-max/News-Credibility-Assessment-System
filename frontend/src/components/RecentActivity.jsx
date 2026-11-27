import {
  FileText,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react";

function RecentActivity({ history = [] }) {

  // -----------------------------------
  // Verdict Style
  // -----------------------------------

  const getVerdictStyle = (verdict) => {

    switch (verdict) {

      case "True News":
      case "Real News":
        return {
          text: "text-green-400",
          bg: "bg-green-400/10",
          border: "border-green-400/20",
          icon: <ShieldCheck size={17} />,
        };

      case "Fake News":
        return {
          text: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/20",
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
          text: "text-gray-400",
          bg: "bg-gray-400/10",
          border: "border-gray-400/20",
          icon: <AlertTriangle size={17} />,
        };
    }
  };

  return (
    <div>

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-3xl font-bold text-cyan-400">
          Recent Activity
        </h2>

        {history.length > 0 && (
          <span className="text-sm text-gray-400">
            Latest {Math.min(history.length, 5)} analyses
          </span>
        )}

      </div>


      {/* =========================================
          EMPTY STATE
      ========================================= */}

      {history.length === 0 ? (

        <div className="
          bg-slate-900
          rounded-2xl
          border
          border-slate-800
          p-12
          text-center
        ">

          <FileText
            size={55}
            className="mx-auto text-cyan-400 mb-5"
          />

          <h3 className="text-xl font-semibold">
            No analyses yet
          </h3>

          <p className="text-gray-400 mt-2">
            Analyze your first news article to see
            your recent activity here.
          </p>

        </div>

      ) : (

        /* =========================================
           HISTORY LIST
        ========================================= */

        <div className="space-y-4">

          {history.slice(0, 5).map((item, index) => {

            const verdict =
              item.verdict ||
              item.prediction ||
              "Unknown";

            const style =
              getVerdictStyle(verdict);

            const title =
              item.article_title ||
              item.article ||
              item.title ||
              item.text ||
              "News Article";

            const score =
              item.credibility_score ??
              item.score ??
              item.credibilityScore;

            return (

              <div
                key={item.id || index}
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-5
                  hover:border-cyan-400/40
                  transition
                "
              >

                <div className="
                  flex
                  flex-col
                  md:flex-row
                  md:items-center
                  gap-5
                ">

                  {/* =================================
                      ARTICLE ICON
                  ================================= */}

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
                      size={24}
                      className="text-cyan-400"
                    />

                  </div>


                  {/* =================================
                      ARTICLE DETAILS
                  ================================= */}

                  <div className="flex-1 min-w-0">

                    <h3 className="
                      font-semibold
                      text-white
                      break-words
                    ">

                      {title.length > 100
                        ? `${title.substring(0, 100)}...`
                        : title}

                    </h3>


                    {/* =================================
                        VERDICT
                        DATE/TIME REMOVED
                    ================================= */}

                    <div className="flex flex-wrap items-center gap-4 mt-3">

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


                  {/* =================================
                      CREDIBILITY SCORE
                  ================================= */}

                  <div className="
                    text-center
                    md:text-right
                    flex-shrink-0
                  ">

                    <p className="text-xs text-gray-400">
                      Credibility
                    </p>

                    <p className="
                      text-xl
                      font-bold
                      text-cyan-400
                    ">

                      {score !== undefined &&
                      score !== null
                        ? `${score}%`
                        : "--"}

                    </p>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}

export default RecentActivity;