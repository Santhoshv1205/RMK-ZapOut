// src/pages/deo/DEORequests.jsx
import { useEffect, useState } from "react";
import { getDeoRequests } from "../../services/deoService.jsx";
import { X, Eye, FileText } from "lucide-react";

export default function DEORequests() {
  const [onDutyRequests, setOnDutyRequests] = useState([]);
  const [gatePassRequests, setGatePassRequests] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getDeoRequests(user.id);
      setOnDutyRequests(data.onDutyRequests || []);
      setGatePassRequests(data.gatePassRequests || []);
    } catch (err) {
      console.error("Error fetching DEO requests:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Loading Requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <h1 className="text-3xl font-bold mb-10 text-[#00d3d1]">
        DEO Request Dashboard
      </h1>

      {/* ================= ON DUTY ================= */}
      <SectionTitle title="On-Duty Requests" />
      <RequestGrid
        requests={onDutyRequests}
        type="OD"
        onViewStudent={setStudentProfile}
        onViewProof={setProofFile}
      />

      {/* ================= GATE PASS ================= */}
      <SectionTitle title="Gate Pass Requests" />
      <RequestGrid
        requests={gatePassRequests}
        type="GP"
        onViewStudent={setStudentProfile}
      />

      {studentProfile && (
        <StudentModal
          student={studentProfile}
          onClose={() => setStudentProfile(null)}
        />
      )}

      {proofFile && (
        <ProofModal file={proofFile} onClose={() => setProofFile(null)} />
      )}
    </div>
  );
}

/* =====================================================
   SECTION TITLE
===================================================== */
const SectionTitle = ({ title }) => (
  <h2 className="text-xl font-semibold mb-6 text-gray-300 border-l-4 border-[#00d3d1] pl-3">
    {title}
  </h2>
);

/* =====================================================
   REQUEST GRID
===================================================== */
const RequestGrid = ({ requests, type, onViewStudent, onViewProof }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
    {requests.length === 0 && (
      <EmptyState message={`No ${type === "OD" ? "On-Duty" : "Gate Pass"} Requests Found`} />
    )}
    {requests.map((r) => (
      <RequestCard
        key={r.id}
        request={r}
        type={type}
        onViewStudent={() => onViewStudent(r)}
        onViewProof={r.proof_file ? () => onViewProof(r.proof_file) : undefined}
      />
    ))}
  </div>
);

/* =====================================================
   REQUEST CARD
===================================================== */
const RequestCard = ({ request, type, onViewStudent, onViewProof }) => (
  <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl transition">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">{request.student_name}</h3>
        <p className="text-sm text-gray-400">{request.department}</p>
      </div>
      <StatusBadge status={request.status} />
    </div>

    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
      <Info label="Request Type" value={request.request_type} />
      <Info label="Stage" value={request.current_stage} />
      <Info
        label="Created"
        value={new Date(request.created_at).toLocaleDateString()}
      />
    </div>

    {type === "OD" && (
      <div className="mt-4 text-sm text-gray-400">
        Event: <span className="text-white">{request.event_name}</span>
      </div>
    )}

    <div className="flex gap-3 mt-6">
      <ActionButton onClick={onViewStudent} icon={<Eye size={16} />} text="View Student" />
      {onViewProof && (
        <ActionButton onClick={onViewProof} icon={<FileText size={16} />} text="View Proof" color="purple" />
      )}
    </div>
  </div>
);

/* =====================================================
   ACTION BUTTON
===================================================== */
const ActionButton = ({ onClick, icon, text, color = "cyan" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 bg-${color}-500/20 border border-${color}-400/40 rounded-xl hover:bg-${color}-500/30 transition`}
  >
    {icon}
    {text}
  </button>
);

/* =====================================================
   STATUS BADGE
===================================================== */
const StatusBadge = ({ status }) => {
  const colors = {
    SUBMITTED: "bg-yellow-500/20 text-yellow-400",
    COUNSELLOR_APPROVED: "bg-cyan-500/20 text-cyan-400",
    COORDINATOR_APPROVED: "bg-blue-500/20 text-blue-400",
    HOD_APPROVED: "bg-green-500/20 text-green-400",
    WARDEN_APPROVED: "bg-indigo-500/20 text-indigo-400",
    REJECTED: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-500/20 text-gray-300"}`}>
      {status.replace("_", " ")}
    </span>
  );
};

/* =====================================================
   INFO CARD
===================================================== */
const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-xs">{label}</p>
    <p>{value || "-"}</p>
  </div>
);

/* =====================================================
   EMPTY STATE
===================================================== */
const EmptyState = ({ message }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-400">
    {message}
  </div>
);

const StudentModal = ({ student, onClose }) => {
  const isOD = student.request_type === "ON_DUTY";
  const isHosteller = student.student_type === "HOSTELLER";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative w-[95%] max-w-6xl h-[90vh] bg-[#111827] rounded-2xl border border-white/20 shadow-2xl p-8 overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-white hover:text-red-400">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-8 text-[#00d3d1]">
          {isOD ? "On-Duty Request Details" : "Gate Pass Request Details"}
        </h2>

        {/* ================= STUDENT DETAILS ================= */}
        <h3 className="text-xl font-semibold mb-4 text-gray-300">Student Details</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
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
              {isOD ? null : (
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
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Event Details</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <ProfileCard label="Event Type" value={student.event_type} />
              <ProfileCard label="Event Name" value={student.event_name} />
              <ProfileCard label="Organization / College" value={student.college} />
              <ProfileCard label="Location" value={student.location} />
              <ProfileCard label="From Date" value={formatDate(student.od_from_date)} />
              <ProfileCard label="To Date" value={formatDate(student.od_to_date)} />
              <ProfileCard
                label="Proof File"
                value={student.proof_file ? (
                  <a href={student.proof_file} target="_blank" className="text-purple-400 underline">
                    View
                  </a>
                ) : "-"}
              />
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Gate Pass Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ProfileCard label="Date of Departure" value={formatDate(student.gp_from_date)} />
              <ProfileCard label="Time of Leaving" value={student.out_time || "--:--"} />
              <ProfileCard label="Expected Date of Return" value={formatDate(student.gp_to_date)} />
              <ProfileCard label="Total Number of Days" value={student.gp_total_days || 0} />
              <ProfileCard label="Purpose of Outing" value={student.reason || "-"} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =====================================================
   FORMAT DATE HELPER
===================================================== */
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
};

/* =====================================================
   PROOF MODAL
===================================================== */
const ProofModal = ({ file, onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
    <div className="relative w-[90%] max-w-4xl h-[80vh] bg-white rounded-2xl p-4 shadow-2xl">
      <button onClick={onClose} className="absolute top-3 right-3 text-black hover:text-red-500">
        <X size={24} />
      </button>
      <iframe src={`http://localhost:5000/uploads/${file}`} className="w-full h-full rounded-lg" title="Proof File" />
    </div>
  </div>
);

/* =====================================================
   PROFILE CARD
===================================================== */
const ProfileCard = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-semibold break-words">{value || "-"}</p>
  </div>
);