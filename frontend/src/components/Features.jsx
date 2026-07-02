import {
  Newspaper,
  Scale,
  Brain,
  FileText,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: <Newspaper size={40} />,
    title: "AI News Analysis",
    description:
      "Analyze news articles and determine their credibility using advanced AI models.",
  },
  {
    icon: <Scale size={40} />,
    title: "Compare Two Articles",
    description:
      "Compare two news articles side by side based on credibility, sentiment, bias, and similarity.",
  },
  {
    icon: <Brain size={40} />,
    title: "AI Explanation",
    description:
      "Understand why an article is considered reliable or suspicious with AI-generated explanations.",
  },
  {
    icon: <FileText size={40} />,
    title: "Multiple Input Options",
    description:
      "Analyze pasted text, URLs, PDFs, DOCX files, and images from a single platform.",
  },
  {
    icon: <BarChart3 size={40} />,
    title: "Analytics Dashboard",
    description:
      "Track previous analyses, credibility scores, reports, and statistics from your dashboard.",
  },
  {
    icon: <ShieldCheck size={40} />,
    title: "Secure User Accounts",
    description:
      "Protect user data with secure authentication, encrypted passwords, and JWT-based login.",
  },
];

function Features() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900">
            Powerful Features
          </h2>

          <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">
            NewsCredAI combines Artificial Intelligence, Machine Learning, and
            explainable insights to help users verify news credibility with
            confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-3 transition duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-7">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;