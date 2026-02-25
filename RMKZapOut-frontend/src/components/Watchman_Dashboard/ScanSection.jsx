import { useState } from "react";

export default function ScanSection() {
  const [barcode, setBarcode] = useState("");

  const handleScan = (e) => {
    if (e.key === "Enter") {
      console.log("Scanned:", barcode);
      setBarcode("");
    }
  };

  return (
    <div className="flex gap-4 items-center mb-6">

      <button className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold shadow-lg shadow-green-500/40 transition">
        Start Webcam Scan
      </button>

      <input
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleScan}
        placeholder="Scan ID using barcode scanner"
        className="bg-black/40 border border-white/20 text-white px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#53cf57]"
      />
    </div>
  );
}