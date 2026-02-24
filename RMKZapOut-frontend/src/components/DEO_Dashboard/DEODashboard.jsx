import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, Users, X } from "lucide-react";

/* ================= STAT CARD ================= */
const StatCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-[#53cf57]/20 text-[#53cf57]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-white/60">{label}</p>
        <h3 className="text-2xl font-semibold text-white">{value}</h3>
      </div>
    </div>
  );
};

/* ================= STUDENT DETAILS MODAL ================= */
const StudentDetailsModal = ({ student, onClose, onVerify }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-[#020617] border border-white/10 rounded-xl w-[600px] p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">
          Student Details
        </h2>

        <div className="space-y-4 text-sm">

          <div>
            <p className="text-white/60">Name</p>
            <p className="text-white">{student.name}</p>
          </div>

          <div>
            <p className="text-white/60">Register Number</p>
            <p className="text-white">{student.regNo}</p>
          </div>

          <div>
            <p className="text-white/60">Department</p>
            <p className="text-white">{student.department}</p>
          </div>

          <div>
            <p className="text-white/60">Request Type</p>
            <p className="text-white">{student.type}</p>
          </div>

          <div>
            <p className="text-white/60">Reason</p>
            <p className="text-white">{student.reason}</p>
          </div>

          {/* Parent */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-white font-semibold mb-2">Parent Details</h3>
            <p className="text-white/80">
              {student.parentName} — {student.parentPhone}
            </p>
          </div>

          {/* Guardian */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-white font-semibold mb-2">Guardian Details</h3>
            <p className="text-white/80">
              {student.guardianName} — {student.guardianPhone}
            </p>
          </div>

        </div>

        {/* Verify Button */}
        <button
          onClick={() => onVerify(student.id)}
          className="mt-6 w-full bg-[#53cf57] text-black py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Verify
        </button>

      </div>
    </div>
  );
};

/* ================= MAIN DASHBOARD ================= */
export default function DEODashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    od: 0,
    gatepass: 0,
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  /* ===== MOCK DATA ===== */
  useEffect(() => {
    setStats({
      total: 52,
      pending: 18,
      od: 20,
      gatepass: 32,
    });

    setRecentStudents([
      {
        id: 1,
        name: "Arun Kumar",
        regNo: "22IT101",
        department: "IT",
        type: "OD",
        reason: "Hackathon participation",
        parentName: "Ravi Kumar",
        parentPhone: "9876543210",
        guardianName: "Suresh",
        guardianPhone: "9123456780",
        status: "Pending",
      },
      {
        id: 2,
        name: "Priya",
        regNo: "22CSE202",
        department: "CSE",
        type: "Gatepass",
        reason: "Medical visit",
        parentName: "Lakshmi",
        parentPhone: "9001122334",
        guardianName: "Rajesh",
        guardianPhone: "9988776655",
        status: "Pending",
      },
    ]);
  }, []);

  /* ===== VERIFY ACTION ===== */
  const handleVerify = (id) => {
    setRecentStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "Verified" } : s
      )
    );
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-8">

      {/* TITLE */}
      <h1 className="text-2xl font-bold text-white">DEO Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={<FileText size={20} />} label="Total" value={stats.total} />
        <StatCard icon={<Clock size={20} />} label="Pending" value={stats.pending} />
        <StatCard icon={<CheckCircle size={20} />} label="OD Requests" value={stats.od} />
        <StatCard icon={<Users size={20} />} label="Gatepass Requests" value={stats.gatepass} />
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent Applications
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/60 border-b border-white/10">
              <th className="py-3">Student</th>
              <th>Reg No</th>
              <th>Dept</th>
              <th>Type</th>
              <th>Status</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {recentStudents.map((student) => (
              <tr key={student.id} className="border-b border-white/5">
                <td className="py-3 text-white">{student.name}</td>
                <td className="text-white/80">{student.regNo}</td>
                <td className="text-white/80">{student.department}</td>
                <td className="text-white/80">{student.type}</td>

                <td
                  className={
                    student.status === "Pending"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                >
                  {student.status}
                </td>

                <td>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="px-3 py-1 bg-[#53cf57]/20 text-[#53cf57] rounded-lg hover:bg-[#53cf57]/30"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP */}
      <StudentDetailsModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onVerify={handleVerify}
      />
    </div>
  );
}