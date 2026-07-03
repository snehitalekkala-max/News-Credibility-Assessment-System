function SummaryCard() {
  return (
    <div className="bg-slate-800 rounded-xl p-6">

      <h2 className="text-xl font-bold text-cyan-400">
        AI Summary
      </h2>

      <p className="text-gray-300 mt-4 leading-7">
        Waiting for analysis...

        <br /><br />

        Paste a news article, upload a PDF,
        or enter a news URL to begin.
      </p>

    </div>
  );
}

export default SummaryCard;