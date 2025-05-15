import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWavDownload = async () => {
    if (!text) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:1252/saysmart?text=${encodeURIComponent(text)}`
      );
      if (!res.ok) throw new Error("Failed to fetch");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

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
    <div className="bg-blue-100 h-screen flex flex-col items-center gap-10 p-10 text-slate-600">
      <h1 className="font-bold">Say Smart - Text to Speech</h1>
      <textarea
        rows={4}
        className="w-full border border-slate-600"
        value={text}
        placeholder="Enter text to convert to speech"
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="w-full border border-slate-600 py-2"
        onClick={handleWavDownload}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Speech"}
      </button>
    </div>
  );
}

export default App;
