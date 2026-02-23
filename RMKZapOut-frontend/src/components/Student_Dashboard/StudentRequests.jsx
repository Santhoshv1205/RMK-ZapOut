import { useEffect, useState } from "react";
import { Edit, Trash2, Save, X, FileText } from "lucide-react";
import {
  fetchStudentRequests,
  cancelRequest,
  updateRequest,
} from "../../services/requestService.jsx";

const glass =
  "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl";

const FILTERS = ["All", "Gate Pass", "On-Duty"];

const STATUS_LABEL = {
  SUBMITTED: "Waiting for Counsellor",
  COUNSELLOR_APPROVED: "Approved by Counsellor",
  COORDINATOR_APPROVED: "Approved by Coordinator",
  HOD_APPROVED: "Approved by HOD",
  WARDEN_APPROVED: "Approved by Warden",
  REJECTED: "Rejected",
};

const STAGES = ["COUNSELLOR", "COORDINATOR", "HOD", "WARDEN"];


const StudentRequests = () => {
  const sessionUser = JSON.parse(localStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editFile, setEditFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  

  const loadRequests = async () => {
    try {
      const res = await fetchStudentRequests(sessionUser.id);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUser?.id) loadRequests();
  }, [sessionUser?.id]);

  const filteredRequests =
    activeFilter === "All"
      ? requests
      : requests.filter((r) =>
          activeFilter === "Gate Pass"
            ? r.request_type === "GATE_PASS"
            : r.request_type === "ON_DUTY"
        );

  const handleEdit = (r) => {
    setEditId(r.id);
    if (r.request_type === "ON_DUTY") {
      setEditData({
        eventType: r.event_type,
        eventName: r.event_name,
        college: r.college,
        location: r.location,
        fromDate: r.od_from_date?.split("T")[0],
        toDate: r.od_to_date?.split("T")[0],
      });
    } else {
      setEditData({
        reason: r.reason,
        outTime: r.out_time,
        inTime: r.in_time,
        fromDate: r.gp_from_date?.split("T")[0],
        toDate: r.gp_to_date?.split("T")[0],
      });
    }
    setEditFile(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setEditFile(files[0]);
    else setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      const formData = new FormData();
      Object.entries(editData).forEach(([k, v]) => formData.append(k, v));
      if (editFile) formData.append("proofFile", editFile);

      await updateRequest(id, formData);
      setEditId(null);
      loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleCancelRequest = async (id) => {
    if (!confirm("Cancel this request?")) return;
    try {
      await cancelRequest(id);
      loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    }
  };

  if (loading) return <p className="text-white p-6">Loading…</p>;

return (
  <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] text-white">
    <div className="sticky top-0 z-30 px-10 pt-8 pb-6 bg-[#020617]/95 backdrop-blur border-b border-white/10">
      <h1 className="text-2xl font-semibold mb-4">
        My <span className="text-[#00d3d1]">{activeFilter}</span> Requests
      </h1>

      <div className="flex gap-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-3 rounded-2xl ${
              activeFilter === f
                ? "bg-white/25"
                : "bg-white/10 text-[#00d3d1]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>

    <div className="px-10 pb-10">
      {filteredRequests.map((r) => {
        const isEditing = editId === r.id;

        const canShowActions =
          isEditing ||
          (!isEditing &&
            (r.status === "SUBMITTED" || r.status === "REJECTED") &&
            r.current_stage === "COUNSELLOR");

        return (
          <div key={r.id} className={`${glass} p-6 mb-8`}>
            {/* HEADER */}
            <div className="grid grid-cols-3 items-start mb-8">
              <div>
                <p className="text-xs text-gray-400">Request Type</p>
                <p className="text-lg font-semibold text-[#00d3d1]">
                  {r.request_type}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400">Status</p>
                <p
                  className={`text-base font-semibold ${
                    r.status === "REJECTED"
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </p>

                {r.status === "REJECTED" && (
                  <div className="mt-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-xs text-red-400 font-semibold">
                      Rejection Reason
                    </p>
                    <p className="text-xs text-gray-300">
                      {r.rejection_reason || "No reason provided"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                {canShowActions && (
                  <div className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => handleEdit(r)}
                          className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/20"
                        >
                          <Edit size={16} />
                          <span className="text-[10px] text-gray-300">
                            Edit
                          </span>
                        </button>

                        <button
                          onClick={() => handleCancelRequest(r.id)}
                          className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 size={16} />
                          <span className="text-[10px] text-red-400">
                            Delete
                          </span>
                        </button>
                      </>
                    )}

                    {isEditing && (
                      <>
                        <button
                          onClick={() => handleSave(r.id)}
                          className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg hover:bg-green-500/20 text-green-400"
                        >
                          <Save size={16} />
                          <span className="text-[10px] text-green-400">
                            Save
                          </span>
                        </button>

                        <button
                          onClick={() => setEditId(null)}
                          className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/20"
                        >
                          <X size={16} />
                          <span className="text-[10px] text-gray-300">
                            Cancel
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* DETAILS */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <Card label="Request Type" value={r.request_type} />

                {r.request_type === "ON_DUTY" && (
                  <>
                    <EditableCard label="Event Type" name="eventType" value={isEditing ? editData.eventType : r.event_type} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="Event Name" name="eventName" value={isEditing ? editData.eventName : r.event_name} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="College" name="college" value={isEditing ? editData.college : r.college} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="Location" name="location" value={isEditing ? editData.location : r.location} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="From Date" name="fromDate" value={isEditing ? editData.fromDate : r.od_from_date?.split("T")[0]} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="To Date" name="toDate" value={isEditing ? editData.toDate : r.od_to_date?.split("T")[0]} editable={isEditing} onChange={handleChange} />
                    <Card label="Total Days" value={r.od_total_days} />
                    {/* PROOF FILE */}
<div className="bg-white/10 rounded-xl p-4 col-span-2">
  <p className="text-xs text-gray-400 mb-2">Proof File</p>

  {/* View Existing File */}
  {r.proof_file && !isEditing && (
    <button
      onClick={() => setPreviewFile(r.proof_file)}
      className="flex items-center gap-2 text-[#00d3d1] hover:underline"
    >
      <FileText size={16} />
      View Uploaded Proof
    </button>
  )}

  {/* Edit Mode File Upload */}
  {isEditing && (
    <div className="flex flex-col gap-3">
      {r.proof_file && (
        <button
          type="button"
          onClick={() => setPreviewFile(r.proof_file)}
          className="text-sm text-[#00d3d1] underline"
        >
          Preview Current File
        </button>
      )}

      <input
        type="file"
        name="proofFile"
        onChange={handleChange}
        className="text-sm bg-white/5 border border-white/20 rounded p-2"
      />

      {editFile && (
        <p className="text-xs text-green-400">
          New file selected: {editFile.name}
        </p>
      )}
    </div>
  )}
</div>
                  </>
                )}
                {r.request_type === "GATE_PASS" && (
                  <>
                    <EditableCard label="Reason" name="reason" value={isEditing ? editData.reason : r.reason} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="Out Time" name="outTime" value={isEditing ? editData.outTime : r.out_time} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="In Time" name="inTime" value={isEditing ? editData.inTime : r.in_time} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="From Date" name="fromDate" value={isEditing ? editData.fromDate : r.gp_from_date?.split("T")[0]} editable={isEditing} onChange={handleChange} />
                    <EditableCard label="To Date" name="toDate" value={isEditing ? editData.toDate : r.gp_to_date?.split("T")[0]} editable={isEditing} onChange={handleChange} />
                    <Card label="Total Days" value={r.gp_total_days} />
                    
                  </>
                  
                )}

              </div>

              {/* APPROVAL FLOW */}
              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-sm font-semibold mb-6 text-[#00d3d1]">
                  Approval Progress
                </p>

                <div className="relative pl-8">
                  {/* BACKGROUND LINE */}
                  <div className="absolute left-[12px] top-[8px] bottom-[8px] w-[6px] bg-white/20 rounded-full" />

                  {(() => {
                    const STEP_GAP = 56;

                    let completedCount = 1;
                    let lineColor = "bg-green-400";

                    if (r.status === "REJECTED") {
                      completedCount =
                        STAGES.indexOf(r.rejected_by) + 1;
                      lineColor = "bg-red-500";
                    } else if (r.status !== "SUBMITTED") {
                      completedCount =
                        STAGES.indexOf(r.current_stage) + 1;
                    }

                    const lineHeight = Math.max(
                      0,
                      (completedCount - 1) * STEP_GAP
                    );

                    return (
                      <div
                        className={`absolute left-[12px] top-[8px] w-[6px] rounded-full ${lineColor}`}
                        style={{ height: `${lineHeight}px` }}
                      />
                    );
                  })()}

                  <ApprovalStep label="SUBMITTED" state="COMPLETED" />

                  {STAGES.map((stage) => {
                    let state = "PENDING";

                    if (
                      r.status === "REJECTED" &&
                      r.rejected_by === stage
                    ) {
                      state = "REJECTED";
                    } else if (
                      r.status !== "SUBMITTED" &&
                      STAGES.indexOf(stage) <
                        STAGES.indexOf(r.current_stage)
                    ) {
                      state = "COMPLETED";
                    } else if (
                      stage === r.current_stage &&
                      r.status !== "REJECTED"
                    ) {
                      state = "ACTIVE";
                    }

                    return (
                      <ApprovalStep
                        key={stage}
                        label={stage}
                        state={state}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    {previewFile && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
    
    <div className="relative w-[95%] h-[90vh] bg-[#0f172a] rounded-2xl border border-white/20 shadow-2xl p-6 flex flex-col">
      
      {/* CLOSE BUTTON */}
     <button
  onClick={() => setPreviewFile(null)}
  className="absolute top-4 right-4 text-white hover:text-red-400"
>
  <X size={24} />
</button>

      <h2 className="text-lg font-semibold mb-4 text-[#00d3d1]">
        Proof Preview
      </h2>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-auto flex items-center justify-center">
        {previewFile.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
          <img
            src={previewFile}
            alt="Proof"
            className="max-h-full max-w-full object-contain rounded-xl"
          />
        ) : (
          <iframe
            src={previewFile}
            title="Proof Document"
            className="w-full h-full rounded-xl"
          />
        )}
      </div>

    </div>
  </div>
)}
  </div>
);



};

const ApprovalStep = ({ label, state }) => {
  let dot = "bg-white/30";
  let text = "text-gray-400";

  if (state === "COMPLETED") {
    dot = "bg-green-400";
    text = "text-green-400";
  } else if (state === "ACTIVE") {
    dot = "bg-[#00d3d1]";
    text = "text-[#00d3d1]";
  } else if (state === "REJECTED") {
    dot = "bg-red-500";
    text = "text-red-400";
  }

  return (
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <div className={`w-4 h-4 rounded-full ${dot}`} />
      <p className={`text-sm font-semibold ${text}`}>{label}</p>
    </div>
  );
};

const Card = ({ label, value }) => (
  <div className="bg-white/10 rounded-xl p-4">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-sm font-semibold">{value || "-"}</p>
  </div>
);

const EditableCard = ({ label, name, value, editable, onChange }) => {
  let type = "text";
  if (name.toLowerCase().includes("date")) type = "date";
  if (name.toLowerCase().includes("time")) type = "time";

  return (
    <div className="bg-white/10 rounded-xl p-4">
      <p className="text-xs text-gray-400">{label}</p>
      {editable ? (
        <input
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          className="w-full bg-transparent border border-white/30 rounded px-2 py-1"
        />
      ) : (
        <p className="text-sm font-semibold">{value || "-"}</p>
      )}
    </div>
  );
};

export default StudentRequests;
