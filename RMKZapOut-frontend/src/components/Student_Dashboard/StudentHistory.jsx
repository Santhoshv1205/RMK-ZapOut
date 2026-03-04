import { useEffect, useState } from "react";
import { Download, FileX, CheckCircle, XCircle, Clock } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/zaplogo.png";
import { getStudentHistory } from "../../services/historyService.jsx";

// Format date as dd/mm/yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date)) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function StudentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    if (userId) fetchHistory();
    else setLoading(false);
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const res = await getStudentHistory(userId);
      setHistory(res.data || []);
    } catch (err) {
      console.error("History Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter based on type and status
  const filteredHistory = history.filter(
    (r) =>
      (typeFilter === "All" || r.type === typeFilter) &&
      (statusFilter === "All" || r.status === statusFilter)
  );

  // Stats helpers
  const countStatus = (type, status) =>
    history.filter((r) => r.type === type && r.status === status).length;

  const totalByType = (type) =>
    history.filter((r) => r.type === type).length;

  // CSV Export
  const downloadCSV = () => {
    if (!filteredHistory.length) return;

    const headers = [
      "Type",
      "Date Range",
      "Total Days",
      "Event",
      "Status",
      "Remarks",
    ];

    const rows = filteredHistory.map((r) => [
      r.type,
      r.type === "Gate Pass"
        ? `${formatDate(r.gp_from)} → ${formatDate(r.gp_to)}`
        : `${formatDate(r.od_from)} → ${formatDate(r.od_to)}`,
      r.type === "Gate Pass" ? `${r.gp_days || "-"} day(s)` : `${r.od_days || "-"} day(s)`,
      r.type === "Gate Pass" ? r.gp_reason || "-" : r.od_event_name || "-",
      r.status,
      r.remark || "-",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "request-history.csv";
    link.click();
  };

  // PDF Export
  const downloadPDF = () => {
    if (!filteredHistory.length) return;

    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 10, 8, 28, 18);
    doc.setFontSize(16);
    doc.text("Student Request History", 105, 18, { align: "center" });

    autoTable(doc, {
      startY: 32,
      head: [["Type", "Date Range", "Total Days", "Event", "Status", "Remarks"]],
      body: filteredHistory.map((r) => [
        r.type,
        r.type === "Gate Pass"
          ? `${formatDate(r.gp_from)} → ${formatDate(r.gp_to)}`
          : `${formatDate(r.od_from)} → ${formatDate(r.od_to)}`,
        r.type === "Gate Pass" ? `${r.gp_days || "-"} day(s)` : `${r.od_days || "-"} day(s)`,
        r.type === "Gate Pass" ? r.gp_reason || "-" : r.od_event_name || "-",
        r.status,
        r.remark || "-",
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    doc.save("request-history.pdf");
  };

  if (loading)
    return <p className="text-white text-center">Loading history...</p>;

  return (
    <div className="p-6 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-cyan-300">
          Request History
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Complete record of your Gate Pass and On-Duty requests
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Gate Pass Total" value={totalByType("Gate Pass")} />
        <StatCard
          label="Gate Pass Approved"
          value={countStatus("Gate Pass", "Approved")}
          type="approved"
        />
        <StatCard
          label="Gate Pass Rejected"
          value={countStatus("Gate Pass", "Rejected")}
          type="rejected"
        />
        <StatCard label="On-Duty Total" value={totalByType("On-Duty")} />
        <StatCard
          label="On-Duty Approved"
          value={countStatus("On-Duty", "Approved")}
          type="approved"
        />
        <StatCard
          label="On-Duty Rejected"
          value={countStatus("On-Duty", "Rejected")}
          type="rejected"
        />
      </div>

      {/* FILTERS + EXPORT */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <FilterTab active={typeFilter === "All"} onClick={() => setTypeFilter("All")}>All</FilterTab>
          <FilterTab active={typeFilter === "Gate Pass"} onClick={() => setTypeFilter("Gate Pass")}>Gate Pass</FilterTab>
          <FilterTab active={typeFilter === "On-Duty"} onClick={() => setTypeFilter("On-Duty")}>On-Duty</FilterTab>

          <div className="w-px bg-white/20 mx-2" />

          <FilterTab active={statusFilter === "Approved"} onClick={() => setStatusFilter("Approved")}>Approved</FilterTab>
          <FilterTab active={statusFilter === "Rejected"} onClick={() => setStatusFilter("Rejected")}>Rejected</FilterTab>
          <FilterTab active={statusFilter === "Pending"} onClick={() => setStatusFilter("Pending")}>Pending</FilterTab>
        </div>

        <div className="flex gap-3">
          <button onClick={downloadCSV} disabled={!filteredHistory.length}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 disabled:opacity-40">
            <Download size={16} /> CSV
          </button>
          <button onClick={downloadPDF} disabled={!filteredHistory.length}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 disabled:opacity-40">
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      {/* TABLE */}
      {!filteredHistory.length ? (
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-10 text-center text-white/70 flex flex-col items-center gap-3">
          <FileX size={42} />
          <p>No request history found.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-white">
            <thead className="bg-[#111827] text-cyan-300">
              <tr>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Date Range</th>
                <th className="p-4 text-left">Total Days</th>
                <th className="p-4 text-left">Event / Reason</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="p-4">{r.type}</td>
                  <td className="p-4">
                    {r.type === "Gate Pass"
                      ? `${formatDate(r.gp_from)} → ${formatDate(r.gp_to)}`
                      : `${formatDate(r.od_from)} → ${formatDate(r.od_to)}`}
                  </td>
                  <td className="p-4">
                    {r.type === "Gate Pass"
                      ? r.gp_days ? `${r.gp_days} day(s)` : "-"
                      : r.od_days ? `${r.od_days} day(s)` : "-"}
                  </td>
                  <td className="p-4">
                    {r.type === "Gate Pass"
                      ? r.gp_reason || "-"
                      : r.od_event_name || "-"}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-4 text-white/60">{r.remark || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */

function StatCard({ label, value, type }) {
  const color =
    type === "approved"
      ? "text-green-400"
      : type === "rejected"
      ? "text-red-400"
      : "text-cyan-300";

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 hover:border-cyan-400/40 transition">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function FilterTab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm border transition ${
        active
          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
          : "text-white/70 border-white/20 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  if (status === "Approved")
    return (
      <span className="flex items-center gap-1 text-green-400 text-sm">
        <CheckCircle size={14} /> Approved
      </span>
    );
  if (status === "Rejected")
    return (
      <span className="flex items-center gap-1 text-red-400 text-sm">
        <XCircle size={14} /> Rejected
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-yellow-400 text-sm">
      <Clock size={14} /> Pending
    </span>
  );
}