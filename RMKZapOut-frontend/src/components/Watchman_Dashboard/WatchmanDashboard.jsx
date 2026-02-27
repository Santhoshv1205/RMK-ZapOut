import { useState, useRef, useEffect } from "react";
import Quagga from "quagga";
import { getStudentByRegisterNumber } from "../../services/watchmanService.jsx";

const WatchmanDashboard = () => {
  const [scannedStudent, setScannedStudent] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 🔹 Handle Scan
  const handleScan = async (code) => {
    // Validate 12 digit register number
    if (!/^\d{12}$/.test(code)) return;

    try {
      const response = await getStudentByRegisterNumber(code);

      if (!response.approved) {
        setScannedStudent({
          ...response.student,
          status: "NOT_APPROVED",
        });
      } else {
        setScannedStudent({
          ...response.student,
          status: "APPROVED",
          gatePass: response.gatePass,
        });
      }

    } catch (err) {
      setError("Failed to fetch student data"+( err.response?.data?.message ? `: ${err.response.data.message}` : ""));
    }

    setTimeout(() => setScannedStudent(null), 5000);
  };
    const drawPath = (ctx, path, color) => {
    if (!ctx || !path) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    path.slice(1).forEach((point) =>
      ctx.lineTo(point[0], point[1])
    );
    ctx.closePath();
    ctx.stroke();
  };

  useEffect(() => {
    if (!videoRef.current) return;

    let lastScannedCode = null;

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
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        decoder: {
          readers: ["code_128_reader"], // Only use Code128
          multiple: false,
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error(err);
          setError("Camera initialization failed");
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onProcessed((result) => {
      setProcessing(true);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", {
        willReadFrequently: true,
      });

      if (!ctx || !result) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (result.box) drawPath(ctx, result.box, "rgba(0,255,0,0.8)");
    });

    Quagga.onDetected((data) => {
      const code = data?.codeResult?.code;
      const confidence = data?.codeResult?.confidence;

      if (!code || confidence < 0.6 || code === lastScannedCode) return;

      lastScannedCode = code;
      handleScan(code);

      setTimeout(() => {
        lastScannedCode = null;
      }, 1500);
    });

    return () => {
      Quagga.stop();
    };
  }, []);



  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
      <h1 className="text-4xl font-bold text-center text-[#52dbff] mb-12">
        Watchman Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* 🔹 Scanner */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-green-400 mb-4">
            Barcode Scanner
          </h2>

          <div className="relative w-full h-[350px] bg-black rounded-2xl overflow-hidden">
            {processing && (
              <div className="absolute w-full h-[2px] bg-yellow-400 animate-scan top-0"></div>
            )}

            {error && (
              <p className="text-red-500 absolute top-2 left-2">
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

        {/* 🔹 Student Display */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center justify-center">

          {!scannedStudent ? (
            <p className="text-white/40 text-lg">
              No student scanned
            </p>
          ) : (
            <div className="w-full animate-fadeIn">

              {/* Basic Info */}
              <h2 className="text-2xl font-bold text-[#52dbff] mb-6 text-center">
                Student Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Register No</span>
                  <span>{scannedStudent.register_number}</span>
                </div>

                <div className="flex justify-between">
                  <span>Name</span>
                  <span>{scannedStudent.name}</span>
                </div>

                <div className="flex justify-between">
                  <span>Department</span>
                  <span>{scannedStudent.department}</span>
                </div>

                <div className="flex justify-between">
                  <span>Year</span>
                  <span>{scannedStudent.year_of_study}</span>
                </div>
              </div>

              {/* 🔴 Not Approved */}
              {scannedStudent.status === "NOT_APPROVED" && (
                <div className="mt-6 text-center text-red-400 font-bold text-lg">
                  ❌ No HOD Approved Gate Pass
                </div>
              )}

              {/* 🟢 Approved */}
              {scannedStudent.status === "APPROVED" && (
                <div className="mt-6 bg-green-900/40 p-4 rounded-xl space-y-3">

                  <div className="text-green-400 font-bold text-center">
                    ✅ Gate Pass Approved
                  </div>

                  <div className="flex justify-between">
                    <span>From</span>
                    <span>{scannedStudent.gatePass?.from_date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>To</span>
                    <span>{scannedStudent.gatePass?.to_date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Leaving Time</span>
                    <span>{scannedStudent.gatePass?.time_of_leaving}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Reason</span>
                    <span>{scannedStudent.gatePass?.reason}</span>
                  </div>
                </div>
              )}

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

export default WatchmanDashboard;