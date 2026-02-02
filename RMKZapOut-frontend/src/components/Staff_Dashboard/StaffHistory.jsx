import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { getStaffHistory } from "../../services/historyService";

const StaffHistory = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await getStaffHistory(userId);
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  /* ================= FILTER LOGIC ================= */
  const filteredData = history.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Gate Pass") return item.requestType === "Gate Pass";
    if (filter === "On-Duty") return item.requestType === "On Duty";
    if (filter === "Approved") return item.status === "Approved";
    if (filter === "Rejected") return item.status === "Rejected";
    if (filter === "Pending") return !item.status || item.status === "Pending";
    return true;
  });

  /* ================= COUNTS ================= */
  const count = (type = null, status = null) =>
    history.filter(
      (h) =>
        (!type || h.requestType === type) &&
        (!status
          ? !h.status || h.status === "Pending"
          : h.status === status)
    ).length;

  /* ================= UI STATES ================= */
  if (loading)
    return <p className="text-center mt-10 text-cyan-300">Loading...</p>;

  if (error)
    return <p className="text-center mt-10 text-red-400">{error}</p>;

  return (
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl text-green-400 font-semibold">
          Request History
        </h1>
        <p className="text-sm text-cyan-300">
          Complete record of student requests you handled
        </p>
      </div>

      {/* COUNT CARDS */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {/* Gate Pass */}
        <StatCard
          title="Gate Pass Pending"
          value={count("Gate Pass", "Pending")}
          
        />
        <StatCard
          title="Gate Pass Approved"
          value={count("Gate Pass", "Approved")}
          color="green"
        />
        <StatCard
          title="Gate Pass Rejected"
          value={count("Gate Pass", "Rejected")}
          color="red"
        />
       

        {/* On-Duty */}
         <StatCard
          title="On-Duty Pending"
          value={count("On Duty", "Pending")}
         
        />
        <StatCard
          title="On-Duty Approved"
          value={count("On Duty", "Approved")}
          color="green"
        />
        <StatCard
          title="On-Duty Rejected"
          value={count("On Duty", "Rejected")}
          color="red"
        />
       
      </div>

      {/* FILTER + DOWNLOAD */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 flex-wrap">
          {["All", "Gate Pass", "On-Duty", "Approved", "Rejected", "Pending"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg backdrop-blur-md border transition
                  ${
                    filter === f
                      ? "bg-white/20 border-cyan-400"
                      : "border-white/10 text-cyan-300 hover:bg-white/10"
                  }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        <div className="flex gap-2">
          <button className="glass-btn flex items-center gap-1">
            <Download size={16} /> CSV
          </button>
          <button className="glass-btn flex items-center gap-1">
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-white/10 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/10 text-cyan-300">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3">Type</th>
              <th className="p-3">Reason</th>
              <th className="p-3">
                <Calendar size={14} className="inline" /> Date
              </th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.map((req) => (
                <tr
                  key={req.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="p-3">{req.studentName}</td>
                  <td className="p-3">{req.requestType}</td>
                  <td className="p-3">{req.reason}</td>
                  <td className="p-3">{req.date || "—"}</td>
                  <td className="p-3">
                    {req.status === "Approved" ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle size={14} /> Approved
                      </span>
                    ) : req.status === "Rejected" ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle size={14} /> Rejected
                      </span>
                    ) : (
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Calendar size={14} /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */
const StatCard = ({ title, value, color }) => (
  <div
    className={`rounded-xl p-4 text-center backdrop-blur-xl border border-white/10
      ${color === "green" && "text-green-400"}
      ${color === "red" && "text-red-400"}
      ${color === "yellow" && "text-yellow-400"}`}
  >
    <p className="text-xs text-cyan-300">{title}</p>
    <h2 className="text-xl font-semibold">{value}</h2>
  </div>
);

export default StaffHistory;
