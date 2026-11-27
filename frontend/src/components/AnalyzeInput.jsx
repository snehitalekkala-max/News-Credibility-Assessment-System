import { useState } from "react";

import UploadBox from "./UploadBox";

import {
  analyzeNews,
  analyzeURL,
  analyzePDF,
} from "../api/api";

import {
  FileText,
  Globe,
  File,
} from "lucide-react";


function AnalyzeInput({
  article,
  setArticle,
  setResult,
  loading,
  setLoading,
}) {

  const [activeTab, setActiveTab] =
    useState("article");

  const [url, setUrl] =
    useState("");

  const [file, setFile] =
    useState(null);


  // =========================================================
  // ANALYZE
  // =========================================================

  const handleAnalyze = async () => {

    // Prevent multiple requests
    if (loading) {
      return;
    }


    try {

      setLoading(true);


      // =====================================================
      // ARTICLE
      // =====================================================

      if (activeTab === "article") {

        if (!article.trim()) {

          alert(
            "Please paste a news article."
          );

          setLoading(false);

          return;
        }


        console.log(
          "Sending article to backend..."
        );

        console.log(
          "Article:",
          article
        );


        const data =
          await analyzeNews(
            article
          );


        console.log(
          "ANALYSIS RESULT:",
          data
        );


        setResult(data);
      }


      // =====================================================
      // URL
      // =====================================================

      else if (
        activeTab === "url"
      ) {

        if (!url.trim()) {

          alert(
            "Please enter a news URL."
          );

          setLoading(false);

          return;
        }


        console.log(
          "Sending URL to backend..."
        );


        const data =
          await analyzeURL(
            url
          );


        console.log(
          "URL ANALYSIS RESULT:",
          data
        );


        setResult(data);
      }


      // =====================================================
      // PDF
      // =====================================================

      else if (
        activeTab === "pdf"
      ) {

        if (!file) {

          alert(
            "Please select a PDF."
          );

          setLoading(false);

          return;
        }


        console.log(
          "Sending PDF to backend..."
        );


        const data =
          await analyzePDF(
            file
          );


        console.log(
          "PDF ANALYSIS RESULT:",
          data
        );


        setResult(data);
      }

    }

    catch (error) {

      console.error(
        "================================"
      );

      console.error(
        "ANALYSIS ERROR:"
      );

      console.error(
        error
      );

      console.error(
        "================================"
      );


      // IMPORTANT:
      // Show actual backend error
      alert(
        error.message ||
        "Analysis failed."
      );

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl">

      {/* =====================================================
          TITLE
      ===================================================== */}

      <h1 className="text-3xl font-bold text-white mb-8">
        News Input
      </h1>


      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="grid grid-cols-3 bg-slate-800 rounded-xl overflow-hidden mb-8">


        {/* ARTICLE TAB */}

        <button
          type="button"
          onClick={() =>
            setActiveTab("article")
          }

          className={`py-4 flex items-center justify-center gap-2 transition ${
            activeTab === "article"
              ? "bg-cyan-500 text-white"
              : "text-gray-300 hover:bg-slate-700"
          }`}
        >

          <FileText size={18} />

          Article

        </button>


        {/* URL TAB */}

        <button
          type="button"
          onClick={() =>
            setActiveTab("url")
          }

          className={`py-4 flex items-center justify-center gap-2 transition ${
            activeTab === "url"
              ? "bg-cyan-500 text-white"
              : "text-gray-300 hover:bg-slate-700"
          }`}
        >

          <Globe size={18} />

          URL

        </button>


        {/* PDF TAB */}

        <button
          type="button"
          onClick={() =>
            setActiveTab("pdf")
          }

          className={`py-4 flex items-center justify-center gap-2 transition ${
            activeTab === "pdf"
              ? "bg-cyan-500 text-white"
              : "text-gray-300 hover:bg-slate-700"
          }`}
        >

          <File size={18} />

          PDF

        </button>

      </div>


      {/* =====================================================
          ARTICLE INPUT
      ===================================================== */}

      {activeTab === "article" && (

        <>

          <textarea
            rows="10"

            value={article}

            onChange={(e) =>
              setArticle(
                e.target.value
              )
            }

            placeholder="Paste your news article here..."

            className="w-full p-4 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400 resize-none"
          />


          <div className="flex justify-between mt-3 text-gray-400">

            <span>
              {article.length} characters
            </span>


            <button
              type="button"

              onClick={() =>
                setArticle("")
              }

              className="text-red-400 hover:text-red-300"
            >
              Clear
            </button>

          </div>

        </>

      )}


      {/* =====================================================
          URL INPUT
      ===================================================== */}

      {activeTab === "url" && (

        <input
          type="text"

          value={url}

          onChange={(e) =>
            setUrl(
              e.target.value
            )
          }

          placeholder="https://example.com/news"

          className="w-full p-4 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400"
        />

      )}


      {/* =====================================================
          PDF INPUT
      ===================================================== */}

      {activeTab === "pdf" && (

        <UploadBox
          file={file}
          setFile={setFile}
        />

      )}


      {/* =====================================================
          ANALYZE BUTTON
      ===================================================== */}

      <button
        type="button"

        onClick={handleAnalyze}

        disabled={loading}

        className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 py-4 rounded-xl text-lg font-semibold text-white disabled:bg-slate-700 disabled:cursor-not-allowed transition"
      >

        {loading
          ? "Analyzing..."
          : "✨ Analyze with AI"}

      </button>

    </div>

  );

}


export default AnalyzeInput;