import { useState, useRef, useEffect } from "react";
import Quagga from "quagga";
import { markEntry } from "../../services/watchmanService.jsx";

const EntryScan = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastScannedCodeRef = useRef(null);

  /* =====================================================
     HANDLE SCAN
  ===================================================== */
  const handleScan = async (code) => {
    if (processing) return;
    if (!/^\d{12}$/.test(code)) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await markEntry(code);
      setResult(response);
    } catch (err) {
      setError("Server error. Please try again." + err.message);
    }

    setTimeout(() => {
      setProcessing(false);
      lastScannedCodeRef.current = null;
    }, 2000);
  };
const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
  /* =====================================================
     DRAW DETECTION BOX
  ===================================================== */
  const drawPath = (ctx, path, color) => {
    if (!ctx || !path) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    path.slice(1).forEach((point) => ctx.lineTo(point[0], point[1]));
    ctx.closePath();
    ctx.stroke();
  };

  /* =====================================================
     QUAGGA INIT
  ===================================================== */
  useEffect(() => {
    if (!videoRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment",
          },
        },
        locator: { patchSize: "medium", halfSample: true },
        decoder: { readers: ["code_128_reader"] },
        locate: true,
      },
      (err) => {
        if (err) {
          setError("Camera initialization failed");
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onProcessed((res) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });


      if (!ctx || !res) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (res.box) drawPath(ctx, res.box, "rgba(0,255,0,0.8)");
    });

    Quagga.onDetected((data) => {
      const code = data?.codeResult?.code;
      const confidence = data?.codeResult?.confidence;

      if (!code || confidence < 0.6) return;
      if (code === lastScannedCodeRef.current) return;

      lastScannedCodeRef.current = code;
      handleScan(code);
    });

    return () => {
      Quagga.stop();
      Quagga.offDetected();
      Quagga.offProcessed();
    };
  }, []);

  /* =====================================================
     MESSAGE COLOR
  ===================================================== */
  const getMessageColor = (message) => {
    if (!message) return "text-white";
    if (message.includes("Successfully")) return "text-green-400";
    if (message.includes("Already")) return "text-yellow-400";
    if (message.includes("Not") || message.includes("No"))
      return "text-red-400";
    return "text-white";
  };

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">

      <h1 className="text-4xl font-bold text-center text-[#52dbff] mb-8">
        Entry Scanner
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Scanner */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">
            Entry Scanner
          </h2>

          <div className="relative w-full h-[350px] bg-black rounded-2xl overflow-hidden">

            {processing && (
              <div className="absolute w-full h-[2px] bg-yellow-400 animate-scan top-0"></div>
            )}

            {error && (
              <p className="text-red-400 absolute top-2 left-2">
                {error}
              </p>
            )}

            <div ref={videoRef} className="w-full h-full" />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center justify-center">
          {!result ? (
            <p className="text-white/40 text-lg">
              Scan a student barcode
            </p>
          ) : (
            <div className="text-center animate-fadeIn space-y-3">

              {result.student && (
                <>
                  <h2 className="text-2xl font-bold text-[#52dbff]">
                    {result.student.name}
                  </h2>
                  <p>Register No: {result.student.register_number}</p>
                  <p>Department: {result.student.department}</p>
                  <p>Year: {result.student.year_of_study}</p>
                </>
              )}

             {result.gatePass && (
  <div className="mt-4 text-sm text-white/70 space-y-1">
    <p>Reason: {result.gatePass.reason}</p>

    <p>From: {formatDateTime(result.gatePass.from_date)}</p>
    <p>To: {formatDateTime(result.gatePass.to_date)}</p>

    {result.gatePass.exit_datetime && (
      <p className="text-yellow-400 font-medium">
        Exit Time: {formatDateTime(result.gatePass.exit_datetime)}
      </p>
    )}

    {result.gatePass.entry_datetime && (
      <p className="text-green-400 font-semibold">
        Entry Time: {formatDateTime(result.gatePass.entry_datetime)}
      </p>
    )}
  </div>
)}

              <div
                className={`mt-4 text-xl font-bold ${getMessageColor(
                  result.message
                )}`}
              >
                {result.message}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes scan {
            0% { top: 0; }
            50% { top: calc(100% - 2px); }
            100% { top: 0; }
          }
          .animate-scan { animation: scan 2s infinite linear; }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        `}
      </style>
    </div>
  );
};

export default EntryScan;