// src/components/Admin_Dashboard/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Users, UserCheck, GraduationCap, Shield, X } from "lucide-react";
import * as XLSX from "xlsx";
import {
  fetchDashboardStats,
  fetchDepartments,
  fetchCalendars,
  uploadCalendar,
  deleteCalendar,
} from "../../services/admindashboardService";

const StatCard = ({ icon, title, value, color }) => (
  <div className={`backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/15 transition`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-red-500">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value ?? "—"}</h3>
    </div>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-red-500 mb-4">{title}</h3>
    {children}
  </div>
);

const AdminDashboard = () => {
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFileName, setPreviewFileName] = useState("");

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load dashboard, departments, calendars
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, deptRes, calRes] = await Promise.all([
          fetchDashboardStats(),
          fetchDepartments(),
          fetchCalendars(),
        ]);
        setStats(statsRes.data.stats);
        setDepartments(deptRes.data.data || []);
        setCalendars(calRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Upload Academic Calendar
  const handleUpload = async () => {
    if (!file) return alert("Select a file first");
    setUploading(true);
    try {
      await uploadCalendar(file);
      setFile(null);
      const calRes = await fetchCalendars();
      setCalendars(calRes.data.data || []);
      alert("Uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Delete Academic Calendar
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this calendar?")) return;
    try {
      await deleteCalendar(id);
      alert("Calendar deleted successfully");
      const calRes = await fetchCalendars();
      setCalendars(calRes.data.data || []);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete calendar");
    }
  };

  // Preview Excel file
  const handlePreview = async (fileUrl, fileName) => {
    try {
      const res = await fetch(fileUrl);
      const arrayBuffer = await res.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setPreviewData(jsonData);
      setPreviewFileName(fileName);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error("Preview error:", err);
      alert("Cannot preview this file.");
    }
  };

  if (loading) return <div className="p-10 text-center text-white text-lg">Loading Dashboard...</div>;

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Welcome to </span>
            <span className="text-red-500">Admin Dashboard</span>
          </h1>
          <p className="text-white/70 mt-1">System overview & administrative controls</p>
        </div>
        <div className="text-right text-sm text-white/70">
          <p>{now.toDateString()}</p>
          <p className="text-red-500 font-semibold">{now.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers} icon={<Users className="text-white" />} color="bg-cyan-500/80"/>
        <StatCard title="Students" value={stats?.totalStudents} icon={<GraduationCap className="text-white" />} color="bg-blue-500/80"/>
        <StatCard title="Staff" value={stats?.totalStaff} icon={<UserCheck className="text-white" />} color="bg-emerald-500/80"/>
        <StatCard title="Roles" value={stats?.totalRoles} icon={<Shield className="text-white" />} color="bg-purple-500/80"/>
      </div>

      {/* Departments */}
      <SectionCard title="Department-wise Reports">
        {departments.length === 0 ? <p className="text-white/80">No departments found</p> : (
          <ul className="space-y-2 text-sm">
            {departments.map(d => (
              <li key={d.id} className="flex justify-between items-center p-3 border border-white/10 rounded-xl hover:bg-white/5 transition">
                <span className="font-semibold text-white">{d.name}</span>
                <div className="flex gap-4 text-white/70 text-xs">
                  <span>Students: {d.total_students}</span>
                  <span>Staff: {d.total_staff}</span>
                  <span className="text-blue-200">Gate Pass: {d.gate_pass_reports ?? 0}</span>
                  <span className="text-green-200">On-Duty: {d.on_duty_reports ?? 0}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Academic Calendar Upload */}
      <SectionCard title="Upload Academic Calendar">
        <div className="flex items-center gap-4">
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button onClick={handleUpload} disabled={uploading} className="bg-red-500 text-white px-4 py-2 rounded">
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <div className="mt-6">
          <h4 className="text-white font-semibold mb-2">Uploaded Files</h4>
          <ul className="text-sm space-y-2 text-white/80">
            {calendars.map(c => (
              <li key={c.id} className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span
                    className="underline text-blue-300 cursor-pointer"
                    onClick={() => handlePreview(c.cloud_url, c.filename)}
                  >
                    {c.filename}
                  </span>
                  <a href={c.cloud_url} download className="text-green-300">Download</a>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-xs text-white/50">{new Date(c.uploaded_at).toLocaleDateString()}</p>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-400"
                    title="Delete Calendar"
                  >
                    <X className="w-4 h-4"/>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      {/* Modal for Preview */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl w-[90%] max-w-6xl p-6 relative overflow-auto max-h-[90%]">
            <button
              className="absolute top-4 right-4 text-white hover:text-red-500"
              onClick={() => setPreviewModalOpen(false)}
            >
              <X />
            </button>
            <h3 className="text-white text-xl font-semibold mb-4">{previewFileName}</h3>

            <div className="overflow-auto">
              <table className="table-auto w-full border border-gray-700 text-white text-sm">
                <thead className="bg-gray-800 sticky top-0">
                  {previewData && (
                    <tr>
                      {previewData[0].map((head, i) => (
                        <th key={i} className="border border-gray-700 px-3 py-1">{head}</th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {previewData && previewData.slice(1).map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-gray-700 px-3 py-1">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;