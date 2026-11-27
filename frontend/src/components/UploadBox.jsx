import { UploadCloud } from "lucide-react";

function UploadBox({ file, setFile }) {
  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="border-2 border-dashed border-cyan-500 rounded-2xl p-8 text-center hover:bg-slate-800 transition">

      <UploadCloud
        size={55}
        className="mx-auto text-cyan-400"
      />

      <h3 className="text-xl font-semibold text-white mt-4">
        Upload News PDF
      </h3>

      <p className="text-gray-400 mt-2">
        Supports PDF files
      </p>

      <input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
        id="pdf-upload"
      />

      <label
        htmlFor="pdf-upload"
        className="mt-6 inline-block bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-semibold text-white cursor-pointer"
      >
        Browse Files
      </label>

      {file && (
        <p className="text-green-400 mt-4">
          {file.name}
        </p>
      )}

    </div>
  );
}

export default UploadBox;