import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Filter,
  User,
  IdCard,
} from "lucide-react";
import {
  fetchStaffRequests,
  updateRequestStatus,
} from "../../services/requestService.jsx";
import { useRequestBadge } from "../context/RequestBadgeContext.jsx";

/* ================= UI HELPERS ================= */

const glass =
  "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl";

const InfoBox = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <p className="text-xs text-white/60">{label}</p>
    <p className="font-semibold mt-1">{value || "N/A"}</p>
  </div>
);

const FILTERS = ["All", "GATE-PASS", "ON-DUTY"];

const STATUS_LABEL = {
  SUBMITTED: "Submitted",
  COUNSELLOR_APPROVED: "Approved by Counsellor",
  COORDINATOR_APPROVED: "Approved by Coordinator",
  HOD_APPROVED: "Approved by HOD",
  WARDEN_APPROVED: "Approved by Warden",
  REJECTED: "Rejected",
};

const STAGES = ["SUBMITTED", "COUNSELLOR", "COORDINATOR", "HOD"];

const StaffRequests = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const staffId = user?.id;
  const role = user?.role;
  const coordinatorYear = user?.year;

const [previewUrl, setPreviewUrl] = useState(null);
const [previewType, setPreviewType] = useState(null); 
 const [filter, setFilter] = useState("All");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionPopup, setActionPopup] = useState(null);
  useEffect(() => {
  if (!actionPopup) return;

  const timer = setTimeout(() => {
    setActionPopup(null);
  }, 2500); // popup disappears after 2.5 sec

  return () => clearTimeout(timer);
}, [actionPopup]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const { clearRequestBadge } = useRequestBadge();

  /* ================= LOAD REQUESTS ================= */

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetchStaffRequests(staffId, role);
      let data = res.data.requests || [];

      data = data.map((r) => {
        let actionable = false;

        if (role === "COUNSELLOR" && r.current_stage === "COUNSELLOR")
          actionable = true;

        if (role === "COORDINATOR") {
          if (r.current_stage === "COORDINATOR") actionable = true;
          else if (r.current_stage === "COUNSELLOR") {
            if (r.student_year_of_study === coordinatorYear)
              actionable = true;
            else if (r.counsellor_user_id === staffId) actionable = true;
          }
        }

        if (role === "HOD" && r.current_stage === "HOD") actionable = true;
        

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

    // detect file type from original url
    if (url.toLowerCase().includes(".pdf")) setPreviewType("pdf");
    else setPreviewType("image");
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
    setActionPopup("approved");
    await loadRequests();
  } catch (err) {
    console.error(err);
    setActionPopup("failed");
  }
};

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return alert("Enter rejection reason");

    try {
      await updateRequestStatus(
        selectedRequestId,
        role,
        "REJECT",
        staffId,
        rejectReason
      );
      setShowRejectModal(false);
      setRejectReason("");
      await loadRequests();
      setActionPopup("rejected");
    } catch (err) {
      console.error(err);
      alert("Rejection failed");
    }
  };

  /* ================= HELPERS ================= */

  const filtered =
    filter === "All"
      ? requests
      : requests.filter(
          (r) => r.request_type.replace("_", "-") === filter
        );

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

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
    <div className="flex justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold">Student Requests</h1>
        <p className="text-sm text-white/60">Review & approve requests</p>
      </div>

      <div className="flex items-center gap-2">
        <Filter size={18} />
        <select
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  className="bg-[#1e293b] text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
>
          {FILTERS.map((f) => (
  <option key={f} className="bg-[#1e293b] text-white">
    {f}
  </option>
))}
        </select>
      </div>
    </div>

    {/* REQUEST LIST */}
    {loading ? (
      <p className="text-center text-white/60">Loading...</p>
    ) : filtered.length === 0 ? (
      <p className="text-center text-white/60">No requests</p>
    ) : (
      filtered.map((r) => {
// progress based ONLY on approval status (not current_stage)
let completedSteps = 0;

if (r.status === "COUNSELLOR_APPROVED") completedSteps = 1;
if (r.status === "COORDINATOR_APPROVED") completedSteps = 2;
if (r.status === "HOD_APPROVED") completedSteps = 3;

if (r.status === "REJECTED") {
  completedSteps = STAGES.indexOf(r.rejected_by || "SUBMITTED");
}
        return (
          <div key={r.id} className={`${glass} p-6 mb-8`}>
            {/* TOP */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-semibold flex items-center gap-2 text-lg">
                  <User size={18} /> {r.student_name}
                </h2>

                <p className="text-sm text-white/70 mt-1">
                  <IdCard size={14} className="inline" /> {r.register_number}
                </p>

                <p className="mt-2 text-cyan-400 font-semibold">
                  {r.request_type.replace("_", "-")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-white/60">Status</p>
                <p className="font-semibold">{getStatusText(r)}</p>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {/* DETAILS */}
              <div className="md:col-span-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  {r.request_type === "ON_DUTY" && (
                    <>
                      <InfoBox label="Event Type" value={r.event_type} />
                      <InfoBox label="Event Name" value={r.event_name} />
                      <InfoBox label="College" value={r.college} />
                      <InfoBox label="Location" value={r.location} />
                      <InfoBox label="From Date" value={formatDate(r.od_from_date)} />
                      <InfoBox label="To Date" value={formatDate(r.od_to_date)} />
                      <InfoBox label="Total Days" value={r.od_total_days} />

                      {/* ✅ PROOF BESIDE TOTAL DAYS */}
                      {r.od_proof_file && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                          <p className="text-xs text-white/60">Proof Document</p>

                          <button
                            onClick={() => loadPreview(r.od_proof_file)}
                            className="mt-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm w-fit"
                          >
                            View Document
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {r.request_type === "GATE_PASS" && (
                    <>
                      <InfoBox label="Reason" value={r.reason} />
                      <InfoBox label="Out Time" value={r.out_time || "N/A"} />
                      {/* <InfoBox label="In Time" value={r.in_time || "N/A"} /> */}
                      <InfoBox label="From Date" value={formatDate(r.gp_from_date)} />
                      <InfoBox label="To Date" value={formatDate(r.gp_to_date)} />
                      <InfoBox label="Total Days" value={r.gp_total_days} />
                    </>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                {r.actionable && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 font-semibold"
                    >
                      <CheckCircle size={18} /> Approve
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRequestId(r.id);
                        setRejectReason("");
                        setShowRejectModal(true);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 font-semibold"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}
              </div>

              {/* APPROVAL TRACKER — NO EMPTY SPACE */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 h-fit">
                <p className="text-sm text-white/60 mb-6">Approval Progress</p>

                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-white/20" />

                  <div
                    className="absolute left-[7px] top-1 w-[2px] bg-green-400"
                    style={{
height: `${(completedSteps / (STAGES.length - 1)) * 100}%`,
                    }}
                  />

                  <div className="space-y-6">
                    {STAGES.map((stage, i) => {
  const isRejected = r.status === "REJECTED";

  let dotColor = "bg-white/30";

if (r.status === "REJECTED" && i === completedSteps) {
  dotColor = "bg-red-500";
} else if (i <= completedSteps) {
  dotColor = "bg-green-400";
} else if (i === completedSteps + 1) {
  dotColor = "bg-cyan-400";
}
                      return (
                        <div key={stage} className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${dotColor}`} />
                          <span className="text-sm text-white/80">
                            {stage === "SUBMITTED"
  ? "Submitted"
  : stage === "COUNSELLOR"
  ? "Counsellor"
  : stage === "COORDINATOR"
  ? "Coordinator"
  : "HOD"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* REJECT INFO */}
            {r.status === "REJECTED" && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 font-semibold">Rejected by: {r.rejected_by}</p>
                <p className="text-gray-300">
                  Reason: {r.rejection_reason || "No reason provided"}
                </p>
              </div>
            )}
          </div>
        );
      })
    )}

    {/* PROOF PREVIEW MODAL */}
    {previewUrl && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-[#020617] rounded-xl w-[92vw] h-[92vh] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
            <p className="text-sm text-white/70 font-semibold">Document Preview</p>

            <button
              onClick={() => {
                setPreviewUrl(null);
                setPreviewType(null);
              }}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
            >
              Close
            </button>
          </div>

          <div className="flex-1 bg-black overflow-auto">
            {previewType === "pdf" ? (
              <iframe
                src={`${previewUrl}#toolbar=1&zoom=page-width`}
                className="w-full h-full"
              />
            ) : (
              <img src={previewUrl} className="max-h-full max-w-full mx-auto my-4" />
            )}
          </div>
        </div>
      </div>
    )}

   { /* REJECT MODAL */}
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

{/* ✅ BOTTOM TOAST POPUP */}
{actionPopup && (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
    <div
      className={`px-6 py-3 rounded-xl shadow-xl border text-sm font-semibold backdrop-blur-md
      ${
        actionPopup === "approved"
          ? "bg-green-500/20 border-green-400 text-green-400"
          : actionPopup === "rejected"
          ? "bg-red-500/20 border-red-400 text-red-400"
          : "bg-red-500/20 border-red-400 text-red-400"
      }`}
    >
      {actionPopup === "approved"
        ? "✅ Request Approved"
        : actionPopup === "rejected"
        ? "❌ Request Rejected"
        : "Operation Failed"}
    </div>
  </div>
)}
  </div>
);
};

export default StaffRequests;