import { useEffect, useState } from "react";
import { fetchStudentInfo, submitGatepass } from "../../services/gatepassService.jsx";

const GatepassForm = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "" });

  const [form, setForm] = useState({
    // student details
    username: "",
    register_number: "",
    department: "",
    year: "",
    student_type: "",
    phone: "",
    father_name: "",
    father_mobile: "",
    mother_name: "",
    mother_mobile: "",
    hostel_name: "",
    room_number: "",

    // gate pass
    from_date: "",
    out_time: "",
    to_date: "",
    total_days: 0,
    reason: "",

    // guardian
    guardian_name: "",
    guardian_mobile: "",
    guardian_address: "",
  });

  const glass =
    "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl";

  /* ---------------- DATE HELPERS ---------------- */
  const today = new Date().toISOString().split("T")[0];

  const calculateDays = (from, to) => {
    if (!from || !to) return 0;
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (d2 < d1) return 0;
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
  };

  /* ---------------- FETCH STUDENT INFO ---------------- */
  useEffect(() => {
    if (!user) return;

    fetchStudentInfo(user.id)
      .then((res) => {
        const d = res.data;
        setForm((prev) => ({
          ...prev,
          username: d.username,
          register_number: d.register_number,
          department: d.department,
          year: d.year,
          student_type: d.student_type,
          phone: d.phone,
          father_name: d.father_name,
          father_mobile: d.father_mobile,
          mother_name: d.mother_name,
          mother_mobile: d.mother_mobile,
          hostel_name: d.hostel_name,
          room_number: d.room_number,
          guardian_name: d.guardian_name || "",
          guardian_mobile: d.guardian_mobile || "",
          guardian_address: d.guardian_address || "",
        }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  /* ---------------- RESET GATEPASS FIELDS ---------------- */
  const resetGatepassFields = () => {
    setForm((prev) => ({
      ...prev,
      from_date: "",
      out_time: "",
      to_date: "",
      total_days: 0,
      reason: "",
      guardian_name: "",
      guardian_mobile: "",
      guardian_address: "",
    }));
  };

  /* ---------------- VALIDATION ---------------- */
  const isFormValid =
    form.from_date &&
    form.to_date &&
    form.out_time &&
    form.total_days > 0 &&
    form.reason &&
    form.guardian_name &&
    form.guardian_mobile &&
    form.guardian_address;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await submitGatepass({
        student_id: user.id,
        from_date: form.from_date,
        out_time: form.out_time,
        to_date: form.to_date,
        total_days: form.total_days,
        reason: form.reason,
        guardian_name: form.guardian_name,
        guardian_mobile: form.guardian_mobile,
        guardian_address: form.guardian_address,
      });

setPopup({
  show: true,
  message: "Gate Pass request submitted successfully",
});

setTimeout(() => {
  setPopup({ show: false, message: "" });
}, 2500);
      resetGatepassFields();
    } catch (err) {
      console.error(err);
setPopup({
  show: true,
  message: "Failed to submit Gate Pass request",
});

setTimeout(() => {
  setPopup({ show: false, message: "" });
}, 2500);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-[#020617]">
        Loading form...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617] px-10 py-6">
      <h1 className="text-3xl font-semibold mb-6">
        Apply <span className="text-cyan-400">Gate Pass</span>
      </h1>

      <div className="max-w-5xl space-y-6">
        {/* STUDENT DETAILS */}
        <div className={`${glass} p-6`}>
          <h2 className="text-lg font-semibold text-cyan-400 mb-4">
            Student Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <ReadOnly label="Student Name" value={form.username} />
            <ReadOnly label="Student Type" value={form.student_type} />
            <ReadOnly label="Register Number" value={form.register_number} />
            <ReadOnly label="Department" value={form.department} />
            <ReadOnly label="Year" value={form.year} />
            <ReadOnly label="Phone" value={form.phone || "—"} />
            <ReadOnly label="Father Name" value={form.father_name} />
            <ReadOnly label="Father Mobile" value={form.father_mobile || "—"} />
            <ReadOnly label="Mother Name" value={form.mother_name} />
            <ReadOnly label="Mother Mobile" value={form.mother_mobile || "—"} />
            <ReadOnly label="Hostel" value={form.hostel_name} />
            <ReadOnly label="Room" value={form.room_number} />
          </div>
        </div>

        {/* GATE PASS DETAILS */}
        <div className={`${glass} p-6`}>
          <h2 className="text-lg font-semibold text-cyan-400 mb-4">
            Gate Pass Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Date of Departure *"
              value={form.from_date}
              min={today}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  from_date: v,
                  to_date: p.to_date && new Date(p.to_date) < new Date(v) ? "" : p.to_date,
                  total_days: calculateDays(v, p.to_date),
                }))
              }
            />
            <TimeInput
              label="Time of Leaving *"
              value={form.out_time}
              onChange={(v) => setForm((p) => ({ ...p, out_time: v }))}
            />
            <DateInput
              label="Expected Date of Return *"
              value={form.to_date}
              min={form.from_date || today}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  to_date: v,
                  total_days: calculateDays(p.from_date, v),
                }))
              }
            />
            <ReadOnly label="Total Number of Days" value={form.total_days} />
            <Textarea
              label="Purpose of Outing *"
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            />
          </div>
        </div>

        {/* GUARDIAN DETAILS */}
        <div className={`${glass} p-6`}>
          <h2 className="text-lg font-semibold text-cyan-400 mb-4">
            Guardian Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Guardian Name *"
              value={form.guardian_name}
              onChange={(e) => setForm((p) => ({ ...p, guardian_name: e.target.value }))}
            />
            <TextInput
              label="Guardian Mobile *"
              value={form.guardian_mobile}
              onChange={(e) => setForm((p) => ({ ...p, guardian_mobile: e.target.value }))}
            />
            <Textarea
              label="Guardian Address *"
              value={form.guardian_address}
              onChange={(e) => setForm((p) => ({ ...p, guardian_address: e.target.value }))}
            />
          </div>
        </div>

        <button
          disabled={!isFormValid || submitting}
          onClick={handleSubmit}
          className={`px-8 py-3 rounded-xl font-semibold transition ${
            isFormValid && !submitting
              ? "bg-cyan-400 text-black hover:scale-105"
              : "bg-gray-500/30 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Gate Pass Request"}
        </button>

{/* ✅ ADD POPUP HERE */}
{popup.show && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <div className="px-8 py-4 rounded-2xl shadow-lg bg-cyan-400 text-black">
      {popup.message}
    </div>
  </div>
)}

</div>
</div>
  );
};

/* ---------------- REUSABLE INPUTS ---------------- */
const ReadOnly = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-300 mb-1 block">{label}</label>
    <input
      readOnly
      value={value}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-gray-300"
    />
  </div>
);

const TextInput = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-gray-300 mb-1 block">{label}</label>
    <input
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
    />
  </div>
);

const DateInput = ({ label, value, min, onChange }) => (
  <div>
    <label className="text-sm text-gray-300 mb-1 block">{label}</label>
    <input
      type="date"
      value={value || ""}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
    />
  </div>
);

const TimeInput = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-gray-300 mb-1 block">{label}</label>
    <input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
    />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-gray-300 mb-1 block">{label}</label>
    <textarea
      rows={3}
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
    />
  </div>
);

export default GatepassForm;
