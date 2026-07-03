import { UploadCloud } from "lucide-react";

function UploadBox() {
  return (
    <div className="border-2 border-dashed border-cyan-500 rounded-2xl p-8 text-center hover:bg-slate-800 transition">

      <UploadCloud
        size={55}
        className="mx-auto text-cyan-400"
      />

      <h3 className="text-xl font-semibold text-white mt-4">
        Drag & Drop your file
      </h3>

      <p className="text-gray-400 mt-2">
        Upload PDF or TXT files
      </p>

      <button
        className="mt-6 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-semibold text-white"
      >
        Browse Files
      </button>

    </div>
  );
}

export default UploadBox;