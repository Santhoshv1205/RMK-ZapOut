import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Filter,
  User,
  IdCard,
  Calendar,
  FileText,
} from "lucide-react";
import { fetchStaffRequests, updateRequestStatus } from "../../services/requestService.jsx";
import { useRequestBadge } from "../context/RequestBadgeContext.jsx";
const glass =
  "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl";

const FILTERS = ["All", "GATE-PASS", "ON-DUTY"];

const STATUS_LABEL = {
  SUBMITTED: "Submitted",
  COUNSELLOR_APPROVED: "Approved by Counsellor",
  COORDINATOR_APPROVED: "Approved by Coordinator",
  HOD_APPROVED: "Approved by HOD",
  WARDEN_APPROVED: "Approved by Warden",
  REJECTED: "Rejected",
};

const STAGES = ["SUBMITTED", "COUNSELLOR", "COORDINATOR", "HOD", "WARDEN"];

const StaffRequests = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const staffId = user?.id;
  const role = user?.role;
  const coordinatorYear = user?.year;
const [previewUrl, setPreviewUrl] = useState(null);
  const [filter, setFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
const { clearRequestBadge } = useRequestBadge();
  
  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetchStaffRequests(staffId, role);
      let data = res.data.requests || [];

      // Compute actionable flag for approve/reject buttons
      data = data.map((r) => {
        let actionable = false;

        if (role === "COUNSELLOR" && r.current_stage === "COUNSELLOR") actionable = true;

        if (role === "COORDINATOR") {
          if (r.current_stage === "COORDINATOR") actionable = true;
          else if (r.current_stage === "COUNSELLOR") {
            // Coordinator skip logic: year matches student → approve as coordinator
            if (r.student_year_of_study === coordinatorYear) actionable = true;
            // Coordinator is student's assigned counsellor → approve as counsellor
            else if (r.counsellor_user_id === staffId) actionable = true;
          }
        }

        if (role === "HOD" && r.current_stage === "HOD") actionable = true;
        if (role === "WARDEN" && r.current_stage === "WARDEN") actionable = true;

        return { ...r, actionable };
      });
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));


      setRequests(data);
    } finally {
      setLoading(false);
    }
  };
  const loadPreview = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const localUrl = URL.createObjectURL(blob);
    setPreviewUrl(localUrl);
  } catch (err) {
    console.error("Preview load failed:", err);
  }
};

  useEffect(() => {
    if (staffId && role) loadRequests();
    clearRequestBadge();
  }, [staffId, role]);

  /* ================= ACTIONS ================= */
  const handleApprove = async (id) => {
    try {
      await updateRequestStatus(id, role, "APPROVE", staffId);
      await loadRequests(); // reload to reflect updated status & skip logic
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return alert("Enter rejection reason");

    try {
      await updateRequestStatus(selectedRequestId, role, "REJECT", staffId, rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
      await loadRequests();
    } catch (err) {
      console.error(err);
      alert("Rejection failed");
    }
  };

  /* ================= HELPERS ================= */
  const filtered =
    filter === "All"
      ? requests
      : requests.filter((r) => r.request_type.replace("_", "-") === filter);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  // Correct status text logic
const getStatusText = (r) => {
  if (r.status === "REJECTED") return "Rejected";

  if (r.status_flag === "SKIP_COUNSELLOR")
    return "Waiting for Coordinator (Skipped Counsellor)";
  if (r.status_flag === "COORD_APPROVE_AS_COUNSELLOR")
    return "You are Coordinator but approving as Counsellor";

  switch (r.current_stage) {
    case "COUNSELLOR":
      return "Waiting for Counsellor";
    case "COORDINATOR":
      return "Waiting for Coordinator";
    case "HOD":
      return "Waiting for HOD";
    case "WARDEN":
      return "Waiting for Warden";
    case "SUBMITTED":
      return STATUS_LABEL[r.status] || "Submitted";
    default:
      return STATUS_LABEL[r.status] || "Unknown";
  }
};


  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Student Requests</h1>
          <p className="text-sm text-white/60">Review & approve requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2"
          >
            {FILTERS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* REQUESTS */}
      {loading ? (
        <p className="text-center text-white/60">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-white/60">No requests</p>
      ) : (
        filtered.map((r) => {
          const currentIndex = STAGES.indexOf(r.current_stage);

          return (
            <div key={r.id} className={`${glass} p-6 mb-6`}>
              <h2 className="font-semibold flex items-center gap-2">
  <User size={16} /> {r.student_name}
</h2>

<p className="text-sm text-white/70">
  <IdCard size={14} className="inline" /> {r.register_number}
</p>

<p className="mt-2 font-medium">
  <FileText size={14} className="inline" />{" "}
  {r.request_type.replace("_", "-")}
</p>

{/* ================= ON DUTY DETAILS ================= */}
{r.request_type === "ON_DUTY" && (
  <div className="mt-3 text-sm text-white/80 space-y-1">
    <p>
      <strong>Event Type:</strong> {r.event_type}
    </p>
    <p>
      <strong>Event Name:</strong> {r.event_name}
    </p>
    <p>
      <strong>College:</strong> {r.college}
    </p>
    <p>
      <strong>Location:</strong> {r.location}
    </p>

    <p className="text-xs text-white/60 mt-2">
      <Calendar size={14} className="inline" />{" "}
      {formatDate(r.od_from_date)} → {formatDate(r.od_to_date)}
    </p>

    <p>
      <strong>Total Days:</strong> {r.total_days}
    </p>
  </div>
)}
{/* ===== PROOF FILE ===== */}
{r.od_proof_file && (
  <div className="mt-4">
    <p className="font-semibold mb-2">Proof Document:</p>

    {!previewUrl ? (
      <button
        onClick={() => loadPreview(r.od_proof_file)}
        className="px-4 py-2 bg-cyan-500 rounded-lg text-sm"
      >
        Load Preview
      </button>
    ) : r.od_proof_file.toLowerCase().endsWith(".pdf") ? (
      <iframe
        src={previewUrl}
        className="w-full h-96 rounded-xl border border-white/20"
        title="PDF Preview"
      />
    ) : (
      <img
        src={previewUrl}
        alt="Preview"
        className="max-h-80 rounded-xl border border-white/20"
      />
    )}
  </div>
)}
{/* ================= GATE PASS DETAILS ================= */}
{r.request_type === "GATE_PASS" && (
  <div className="mt-3 text-sm text-white/80 space-y-1">
    <p>
      <strong>Reason:</strong> {r.reason}
    </p>

    <p>
      <strong>Out Time:</strong> {r.out_time || "N/A"}
    </p>

    <p>
      <strong>In Time:</strong> {r.in_time || "N/A"}
    </p>

    <p className="text-xs text-white/60 mt-2">
      <Calendar size={14} className="inline" />{" "}
      {formatDate(r.gp_from_date)} → {formatDate(r.gp_to_date)}
    </p>

    <p>
      <strong>Total Days:</strong> {r.total_days}
    </p>
  </div>
)}


              {/* TRACK PROGRESS */}
            <div className="mt-6 flex items-center justify-between">
  {STAGES.map((stage, i) => {
    const isRejected = r.status === "REJECTED";
    const isCurrent = i === currentIndex;

    /* ---------- DOT COLOR ---------- */
  let dotColor = "bg-white/30";

// ✅ SUBMITTED is always green
if (stage === "SUBMITTED") {
  dotColor = "bg-green-400";
}
else if (isRejected) {
  if (isCurrent) dotColor = "bg-red-500";
}
else {
  if (i < currentIndex) dotColor = "bg-green-400";
  else if (isCurrent) dotColor = "bg-cyan-400";
}


    /* ---------- LINE COLOR ---------- */
let lineColor = "bg-white/30";

// ✅ Line after SUBMITTED is always green
if (STAGES[i + 1] === "COUNSELLOR") {
  lineColor = "bg-green-400";
}

// ✅ Approved stages
else if (!isRejected && i <= currentIndex-1) {
  lineColor = "bg-green-400";
}

    return (
      <div key={stage} className="flex items-center flex-1">
        {/* DOT + LABEL */}
        <div className="flex flex-col items-center">
          {/* DOT */}
          <div className={`w-4 h-4 rounded-full ${dotColor}`} />

          {/* LABEL BELOW DOT */}
        <span className="text-xs mt-2 text-white/70">
  {stage === "SUBMITTED"
    ? "Submitted"
    : stage === "COUNSELLOR"
    ? "Counsellor"
    : stage === "COORDINATOR"
    ? "Coordinator"
    : stage === "HOD"
    ? "HOD"
    : "Warden"}
</span>

        </div>

        {/* CONNECTING LINE */}
        {i < STAGES.length - 1 && (
          <div className={`flex-1 h-1 mx-2 ${lineColor}`} />
        )}
      </div>
    );
  })}
</div>


              {/* STATUS */}
              <p className="mt-3 font-semibold">Status: {getStatusText(r)}</p>
{r.status === "REJECTED" && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 font-semibold">
                    Rejected by: {r.rejected_by}
                  </p>
                  <p className="text-gray-300">
                    Reason: {r.rejection_reason || "No reason provided"}
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              {r.actionable && (
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleApprove(r.id)} className="btn-green">
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequestId(r.id);
                      setRejectReason("");
                      setShowRejectModal(true);
                    }}
                    className="btn-red"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* REJECTION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#020617] p-6 rounded-xl w-96">
            <h3 className="font-semibold mb-2">Rejection Reason</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded p-2"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button onClick={handleRejectSubmit} className="btn-red">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRequests;
