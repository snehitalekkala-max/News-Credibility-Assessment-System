import { useState } from "react";
import UploadBox from "./UploadBox";

function AnalyzeInput() {
  const [article, setArticle] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl">

      <h1 className="text-3xl font-bold text-white mb-8">
        News Input
      </h1>

      <label className="text-gray-300">
        Paste News Article
      </label>

      <textarea
        rows="10"
        value={article}
        onChange={(e) => setArticle(e.target.value)}
        placeholder="Paste your news article here..."
        className="w-full mt-3 p-4 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400"
      />

      <div className="flex justify-between mt-2 text-gray-400 text-sm">

        <span>{article.length} characters</span>

        <button
          onClick={() => setArticle("")}
          className="text-red-400 hover:text-red-300"
        >
          Clear
        </button>

      </div>

      <div className="mt-8">

        <label className="text-gray-300">
          News URL
        </label>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full mt-3 p-4 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-cyan-400"
        />

      </div>

      <div className="my-8 text-center text-gray-400">
        OR
      </div>

      <UploadBox />

      <button
        className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 py-4 rounded-xl text-lg font-semibold text-white"
      >
        ✨ Analyze with AI
      </button>

    </div>
  );
}

export default AnalyzeInput;