import { Link } from "react-router-dom";

function QuickActionCard({
  icon,
  title,
  description,
  link,
}) {
  return (
    <Link to={link}>
      <div className="bg-slate-900 rounded-2xl p-8 shadow-lg hover:bg-slate-800 hover:scale-105 transition-all duration-300 cursor-pointer">

        <div className="text-cyan-400 mb-5">
          {icon}
        </div>

        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>

        <p className="text-gray-400 mt-3">
          {description}
        </p>

      </div>
    </Link>
  );
}

export default QuickActionCard;