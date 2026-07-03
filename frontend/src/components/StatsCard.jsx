function StatsCard({ title, value, color }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition-all duration-300">

      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2 className={`text-4xl font-bold mt-3 ${color}`}>
        {value}
      </h2>

    </div>
  );
}

export default StatsCard;