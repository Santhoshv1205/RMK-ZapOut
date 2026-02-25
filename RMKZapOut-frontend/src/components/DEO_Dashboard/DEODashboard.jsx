// src/pages/deo/DEODashboard.jsx
import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, Users, X } from "lucide-react";
import { getDeoDashboardStats } from "../../services/deoService.jsx";

/* ================= STAT CARD ================= */
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center gap-4">
    <div className="p-3 rounded-lg bg-[#53cf57]/20 text-[#53cf57]">{icon}</div>
    <div>
      <p className="text-sm text-white/60">{label}</p>
      <h3 className="text-2xl font-semibold text-white">{value}</h3>
    </div>
  </div>
);

/* ================= PROFILE CARD ================= */
const ProfileCard = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-semibold break-words">{value || "-"}</p>
  </div>
);

/* ================= STUDENT DETAILS MODAL ================= */
const StudentDetailsModal = ({ student, onClose, onVerify }) => {
  if (!student) return null;

  const isHosteller = student.student_type === "HOSTELLER";
  const isOD = student.type === "OD";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#020617] border border-white/10 rounded-xl w-[600px] p-6 relative max-h-[90vh] overflow-y-auto">

        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 text-white/60 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">
          {isOD ? "On-Duty Request Details" : "Gate Pass Request Details"}
        </h2>

        {/* ================= STUDENT DETAILS ================= */}
        <h3 className="text-white font-semibold mb-3">Student Details</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <ProfileCard label="Name" value={student.student_name} />
          <ProfileCard label="Student Type" value={student.student_type} />
          <ProfileCard label="Register Number" value={student.register_number} />
          <ProfileCard label="Email" value={student.student_email} />
          <ProfileCard label="Department" value={student.department} />
          <ProfileCard label="Year" value={student.year_of_study} />
          {isHosteller && (
            <>
              <ProfileCard label="Phone" value={student.phone} />
              <ProfileCard label="Father Name" value={student.father_name} />
              <ProfileCard label="Father Mobile" value={student.father_mobile} />
              <ProfileCard label="Mother Name" value={student.mother_name} />
              <ProfileCard label="Mother Mobile" value={student.mother_mobile} />
              {student.type !== "OD" && (
                <>
                  <ProfileCard label="Hostel" value={student.hostel_name} />
                  <ProfileCard label="Room" value={student.room_number} />
                  <ProfileCard label="Guardian Name" value={student.guardian_name} />
                  <ProfileCard label="Guardian Mobile" value={student.guardian_mobile} />
                  <ProfileCard label="Guardian Address" value={student.guardian_address} />
                </>
              )}
            </>
          )}
        </div>

        {/* ================= REQUEST DETAILS ================= */}
        {isOD ? (
          <>
            <h3 className="text-white font-semibold mb-3">Event Details</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <ProfileCard label="Event Type" value={student.event_type} />
              <ProfileCard label="Event Name" value={student.event_name} />
              <ProfileCard label="Organization / College" value={student.college} />
              <ProfileCard label="Location" value={student.location} />
              <ProfileCard label="From Date" value={student.od_from_date} />
              <ProfileCard label="To Date" value={student.od_to_date} />
              <ProfileCard
                label="Proof File"
                value={student.proof_file ? (
                  <a href={student.proof_file} target="_blank" className="text-purple-400 underline">View</a>
                ) : "-"}
              />
            </div>
          </>
        ) : (
          <>
            <h3 className="text-white font-semibold mb-3">Gate Pass Details</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <ProfileCard label="Date of Departure" value={student.gp_from_date} />
              <ProfileCard label="Time of Leaving" value={student.out_time || "--:--"} />
              <ProfileCard label="Expected Date of Return" value={student.gp_to_date} />
              <ProfileCard label="Total Number of Days" value={student.gp_total_days || 0} />
              <ProfileCard label="Purpose of Outing" value={student.reason} />
            </div>
          </>
        )}

        {/* ================= VERIFY BUTTON ================= */}
        {student.status === "Pending" && (
          <button
            onClick={() => onVerify(student.id)}
            className="mt-4 w-full bg-[#53cf57] text-black py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Verify
          </button>
        )}
      </div>
    </div>
  );
};

/* ================= MAIN DEO DASHBOARD ================= */
export default function DEODashboard() {
 const [stats, setStats] = useState({
  total: 0,
  odPending: 0,
  odApproved: 0,
  gatepassPending: 0,
  gatepassApproved: 0,
});

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicCalendar, setAcademicCalendar] = useState([]);

  /* ===== FETCH DASHBOARD DATA ===== */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const data = await getDeoDashboardStats(user.id);

      setStats({
  total: data.totalStudents,
  odPending: data.odPending,
  odApproved: data.odApproved,
  gatepassPending: data.gatepassPending,
  gatepassApproved: data.gatepassApproved,
});

     
        setAcademicCalendar(data.academicCalendar || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboard();
  }, []);



  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-white">DEO Dashboard</h1>

      {/* ===== STATS ===== */}
   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
  <StatCard icon={<FileText size={20} />} label="Total Students" value={stats.total} />
  <StatCard icon={<Clock size={20} />} label="OD Pending" value={stats.odPending} />
  <StatCard icon={<CheckCircle size={20} />} label="OD Approved" value={stats.odApproved} />
  <StatCard icon={<Clock size={20} />} label="Gatepass Pending" value={stats.gatepassPending} />
  <StatCard icon={<Users size={20} />} label="Gatepass Approved" value={stats.gatepassApproved} />
</div>

    
      {/* ===== ACADEMIC CALENDAR ===== */}
     <div className="space-y-4">
  {academicCalendar.map((event) => (
    <div key={event.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
      <h3 className="text-white font-semibold">{event.filename}</h3>
     
      <p className="text-white/70 text-sm mt-1">
        <a href={event.cloud_url} target="_blank" className="text-purple-400 underline">
          View File
        </a>
      </p>
      <p className="text-white/60 text-sm mt-1">Uploaded At: {new Date(event.uploaded_at).toLocaleString()}</p>
    </div>
  ))}
</div>

      {/* ===== STUDENT MODAL ===== */}
      <StudentDetailsModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
       
      />
    </div>
  );
}