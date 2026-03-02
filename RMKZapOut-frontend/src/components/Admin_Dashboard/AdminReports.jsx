import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getAdminReports } from "../../services/adminReportService";

const StatCard = ({ icon, label, value }) => (
  <div className="glass-card flex items-center gap-4 p-5">
    <div className="p-3 rounded-xl bg-white/10">{icon}</div>
    <div>
      <p className="text-sm text-white/60">{label}</p>
      <h3 className="text-xl font-semibold text-white">{value}</h3>
    </div>
  </div>
);

const AdminReports = () => {
  const [type, setType] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchReports = async () => {
    try {
      setLoading(true);

      const filters = {
        type: type !== "ALL" ? type : undefined,
        fromDate,
        toDate,
      };

      const data = await getAdminReports(filters);

      // Important Fix
      setReports(data.requests || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [type, fromDate, toDate]);

  /* ================= CSV EXPORT ================= */
  const exportCSV = () => {
    if (!reports.length) return;

    const headers = [
      "Student",
      "Type",
      "Department",
      "Year",
      "Section",
      "Date",
      "Status",
    ];

    const rows = reports.map((r) =>
      [
        r.student_name,
        r.request_type,
        r.department,
        r.year_of_study,
        r.section,
        new Date(r.created_at).toLocaleDateString(),
        r.status,
      ].join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Request_Summary_Report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  return (
    <div className="w-full min-h-screen p-8 text-white relative">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-red-500">
          <FileText size={26} />
          Reports & Analytics
        </h1>

        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* FILTERS */}
      <div className="glass-card p-6 mb-8 flex flex-wrap gap-6 items-end">
        <div>
          <label className="text-sm text-white/60">Request Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-48 bg-[#081827] text-white border border-white/20 rounded-lg px-3 py-2"
          >
            <option value="ALL">All</option>
            <option value="GATE_PASS">Gate Pass</option>
            <option value="ON_DUTY">On-Duty</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-white/60">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div>
          <label className="text-sm text-white/60">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* STATS (Using Backend Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        <StatCard
          icon={<Users size={22} />}
          label="Total Requests"
          value={summary.total || 0}
        />
        <StatCard
          icon={<CheckCircle size={22} />}
          label="Approved"
          value={summary.approved || 0}
        />
        <StatCard
          icon={<XCircle size={22} />}
          label="Rejected"
          value={summary.rejected || 0}
        />
        <StatCard
          icon={<FileText size={22} />}
          label="Gate Pass"
          value={summary.gatePass || 0}
        />
        <StatCard
          icon={<FileText size={22} />}
          label="On-Duty"
          value={summary.onDuty || 0}
        />
      </div>

      {/* TABLE */}
      <div className="glass-card p-6 bg-white/5 border border-white/10">
        <h2 className="text-lg font-semibold mb-4">Request Summary</h2>

        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-white/50">No records found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/60 border-b border-white/20">
                <th className="text-left py-3">Student</th>
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">Department</th>
                <th className="text-left py-3">Year</th>
                <th className="text-left py-3">Section</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-white/10">
                  <td className="py-3">{r.student_name}</td>
                  <td className="py-3">{r.request_type}</td>
                  <td className="py-3">{r.department}</td>
                  <td className="py-3">{r.year_of_study}</td>
                  <td className="py-3">{r.section}</td>
                  <td className="py-3">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td
                    className={`py-3 ${
                      r.status === "REJECTED"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .date-input {
          background-color: #081827;
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default AdminReports;