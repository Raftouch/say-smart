import { useState } from "react";
import api from "../api";

export default function MainPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWavDownload = async () => {
    if (!text) return;

    setLoading(true);

    try {
      const res = await api.get(`/saysmart?text=${encodeURIComponent(text)}`, {
        responseType: "blob",
      });
      // if (!res.ok) throw new Error("Failed to fetch");
      // const blob = await res.blob();
      // const url = window.URL.createObjectURL(blob);
      const url = window.URL.createObjectURL(res.data);

      const a = document.createElement("a");
      a.href = url;
      a.download = "speech.wav";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error : ", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center gap-8 px-6 py-10 text-slate-700 font-sans">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">
          Say Smart
        </h1>
        <p className="text-lg font-medium text-slate-600 mt-1">
          Text to Speech
        </p>
      </div>

      <textarea
        rows={5}
        className="w-full max-w-xl resize-none rounded-lg border border-slate-300 p-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200"
        value={text}
        placeholder="Type something amazing to hear it out loud... (200 characters max)"
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className={`w-full max-w-xl rounded-lg bg-blue-500 text-white py-3 font-semibold shadow-md transition-all duration-300 hover:bg-blue-600 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          loading ? "animate-pulse" : ""
        }`}
        onClick={handleWavDownload}
        disabled={loading}
      >
        {loading ? "Generating..." : "🎙️ Generate Speech"}
      </button>
    </div>
  );
}
