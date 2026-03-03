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
  <div className="bg-gradient-to-br from-[#0f172a]/80 to-[#1e293b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-5 shadow-lg hover:scale-[1.02] transition-all duration-300">
    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-500/10 text-red-400 border border-red-500/20">
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase tracking-wider text-white/50">
        {label}
      </p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
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

  const fetchReports = async () => {
    try {
      setLoading(true);

      const filters = {
        type: type !== "ALL" ? type : undefined,
        fromDate,
        toDate,
      };

      const data = await getAdminReports(filters);

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
    <div className="w-full min-h-screen px-10 py-10 text-white bg-gradient-to-br from-[#050b16] via-[#081827] to-[#0f172a] relative">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-red-500 tracking-wide">
          <FileText size={28} className="text-red-500" />
          Reports & Analytics
        </h1>

        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-600/30"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-10 flex flex-wrap gap-8 items-end shadow-md">
        <div>
          <label className="text-sm text-white/60 font-medium">
            Request Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-2 w-52 bg-[#081827] text-white border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All</option>
            <option value="GATE_PASS">Gate Pass</option>
            <option value="ON_DUTY">On-Duty</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-white/60 font-medium">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="date-input mt-2"
          />
        </div>

        <div>
          <label className="text-sm text-white/60 font-medium">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="date-input mt-2"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-8 mb-12">
        <StatCard icon={<Users size={22} />} label="Total Requests" value={summary.total || 0} />
        <StatCard icon={<CheckCircle size={22} />} label="Approved" value={summary.approved || 0} />
        <StatCard icon={<XCircle size={22} />} label="Rejected" value={summary.rejected || 0} />
        <StatCard icon={<FileText size={22} />} label="Gate Pass" value={summary.gatePass || 0} />
        <StatCard icon={<FileText size={22} />} label="On-Duty" value={summary.onDuty || 0} />
      </div>

      {/* TABLE */}
      <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-6 text-white tracking-wide">
          Request Summary
        </h2>

        {loading ? (
          <p className="text-white/60">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-white/40">No records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-3">
              <thead>
                <tr className="text-white/60 text-left">
                  <th>Student</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    className="bg-[#081827] hover:bg-[#0d2136] transition-all duration-200 rounded-xl"
                  >
                    <td className="py-3 px-4 rounded-l-xl">
                      {r.student_name}
                    </td>
                    <td className="py-3 px-4">{r.request_type}</td>
                    <td className="py-3 px-4">{r.department}</td>
                    <td className="py-3 px-4">{r.year_of_study}</td>
                    <td className="py-3 px-4">{r.section}</td>
                    <td className="py-3 px-4">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        r.status === "REJECTED"
                          ? "text-red-400"
                          : "text-green-400"
                      } rounded-r-xl`}
                    >
                      {r.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .date-input {
          background-color: #081827;
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 0.75rem;
          padding: 0.6rem 0.9rem;
          outline: none;
        }
        .date-input:focus {
          border: 1px solid #ef4444;
        }
      `}</style>
    </div>
  );
};

export default AdminReports;