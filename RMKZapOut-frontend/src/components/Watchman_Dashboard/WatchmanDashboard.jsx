import { useState } from "react";

const WatchmanDashboard = () => {
  const [scannedStudent, setScannedStudent] = useState(null);

  // Dummy student data for UI simulation
  const dummyStudents = [
    {
      register_number: "21CS001",
      name: "Arun Kumar",
      department: "CSE",
      year_of_study: 3,
      entry_time: "09:12 AM",
      exit_time: "-",
    },
    {
      register_number: "22ME045",
      name: "Rahul",
      department: "MECH",
      year_of_study: 2,
      entry_time: "08:55 AM",
      exit_time: "01:30 PM",
    },
    {
      register_number: "23IT021",
      name: "Priya",
      department: "IT",
      year_of_study: 1,
      entry_time: "10:05 AM",
      exit_time: "-",
    },
  ];

  // Simulate QR Scan
  const handleFakeScan = () => {
    const randomStudent =
      dummyStudents[Math.floor(Math.random() * dummyStudents.length)];

    setScannedStudent(randomStudent);

    // Hide after 4 seconds
    setTimeout(() => {
      setScannedStudent(null);
    }, 4000);
  };

  return (
    <div className="p-8 text-white min-h-screen">

      <h1 className="text-3xl font-bold text-[#52dbff] mb-8">
        Watchman Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ================= QR SCANNER ================= */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">

          <h2 className="text-lg font-semibold text-green-400 mb-4">
            QR Scanner
          </h2>

          <div className="relative w-full h-[350px] bg-black rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">

            {/* Scanner Frame */}
            <div className="absolute w-64 h-64 border-4 border-green-400 rounded-xl animate-pulse"></div>

            <p className="text-white/40 text-sm">
              Camera Preview Area
            </p>
          </div>

          {/* Fake Scan Button (UI Only) */}
          <button
            onClick={handleFakeScan}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 transition py-3 rounded-xl font-semibold"
          >
            Simulate Scan
          </button>

        </div>

        {/* ================= SCANNED STUDENT DISPLAY ================= */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex items-center justify-center">

          {!scannedStudent ? (
            <p className="text-white/40 text-center">
              No student scanned
            </p>
          ) : (
            <div className="w-full animate-fadeIn">

              <h2 className="text-xl font-bold text-[#52dbff] mb-6 text-center">
                Student Verified ✅
              </h2>

              <div className="space-y-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-white/60">Register Number</span>
                  <span className="font-semibold">
                    {scannedStudent.register_number}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/60">Name</span>
                  <span className="font-semibold">
                    {scannedStudent.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/60">Department</span>
                  <span className="font-semibold">
                    {scannedStudent.department}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/60">Year</span>
                  <span className="font-semibold">
                    {scannedStudent.year_of_study}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-green-400">Entry Time</span>
                  <span className="font-semibold text-green-400">
                    {scannedStudent.entry_time}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-red-400">Exit Time</span>
                  <span className="font-semibold text-red-400">
                    {scannedStudent.exit_time}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default WatchmanDashboard;