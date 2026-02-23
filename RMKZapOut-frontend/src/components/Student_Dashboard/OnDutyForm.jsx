// src/components/OnDutyForm.jsx
import { useEffect, useState } from "react";
import { fetchStudentProfile, applyOnDuty } from "../../services/onDutyService.jsx";
import { Trash2 } from "lucide-react";

const OnDutyForm = () => {
  const sessionUser = JSON.parse(localStorage.getItem("user"));

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false); // ✅ added

  const [form, setForm] = useState({
    eventType: "",
    eventName: "",
    organization: "",
    location: "",
    fromDate: "",
    toDate: "",
    proof: null,
  });

  // ================= FETCH STUDENT PROFILE =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchStudentProfile(sessionUser.id);

        if (res.data.role !== "STUDENT") {
          setError("Only students can apply for On-Duty");
          return;
        }

        setStudent(res.data);
      } catch {
        setError("Failed to load student details");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [sessionUser.id]);

  useEffect(() => {
    if (!form.proof) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(form.proof);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [form.proof]);

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {
    try {
      // event validation
      if (
        !form.eventType ||
        !form.eventName ||
        !form.organization ||
        !form.location ||
        !form.fromDate ||
        !form.toDate
      ) {
        alert("Please fill all event details.");
        return;
      }

      // proof validation
      if (form.eventType !== "PLACEMENT" && !form.proof) {
        alert("Proof upload is required.");
        return;
      }

      // ✅ file size limit (5MB)
      if (form.proof && form.proof.size > 5 * 1024 * 1024) {
        alert("File must be less than 5MB");
        return;
      }

      setSubmitting(true); // ✅ start loading

      const fd = new FormData();
      fd.append("userId", sessionUser.id);
      fd.append("eventType", form.eventType);
      fd.append("eventName", form.eventName);
      fd.append("college", form.organization);
      fd.append("location", form.location);
      fd.append("fromDate", form.fromDate);
      fd.append("toDate", form.toDate);

      if (form.proof) fd.append("proofFile", form.proof);

      await applyOnDuty(fd);

      alert("On-Duty request submitted successfully");

      setForm({
        eventType: "",
        eventName: "",
        organization: "",
        location: "",
        fromDate: "",
        toDate: "",
        proof: null,
      });
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false); // ✅ stop loading
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error) return <p className="text-red-400 p-6">{error}</p>;

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 md:px-10 py-6">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">
        Apply <span className="text-cyan-400">On-Duty</span>
      </h1>

      {/* ================= STUDENT DETAILS ================= */}
      <Section title="Student Details">
        <Grid>
          <ReadOnly label="Name" value={student.username} />
          <ReadOnly label="Student Type" value={student.student_type} />
          <ReadOnly label="Register No" value={student.register_number} />
          <ReadOnly label="Email" value={student.email} />
          <ReadOnly label="Department" value={student.department || "—"} />
          <ReadOnly label="Year" value={student.year_of_study || "—"} />
        </Grid>
      </Section>

      {/* ================= EVENT DETAILS ================= */}
      <Section title="Event Details">
        <Grid>
          <Select
            label="Event Type"
            value={form.eventType}
            options={["HACKATHON", "WORKSHOP", "SYMPOSIUM", "PLACEMENT", "CONFERENCE", "OTHER"]}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
          />
          <Input
            label="Event Name"
            value={form.eventName}
            onChange={(e) => setForm({ ...form, eventName: e.target.value })}
          />
          <Input
            label="Organization / College"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Date
            label="From Date"
            value={form.fromDate}
            onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
          />
          <Date
            label="To Date"
            value={form.toDate}
            onChange={(e) => setForm({ ...form, toDate: e.target.value })}
          />
        </Grid>
      </Section>

      {/* ================= PROOF UPLOAD ================= */}
      {form.eventType !== "PLACEMENT" && (
        <Section title="Proof Upload">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-white/20 px-5 py-3 rounded-xl">
              Click here to select file
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                className="hidden"
                onChange={(e) => setForm({ ...form, proof: e.target.files[0] })}
              />
            </label>

            {form.proof && (
              <span className="text-sm text-gray-300">{form.proof.name}</span>
            )}

            {form.proof && (
              <button
                onClick={() => setForm({ ...form, proof: null })}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg"
              >
                <Trash2 size={18} className="text-red-400" />
              </button>
            )}
          </div>

          {previewUrl && form.proof && (
            <div className="mt-4">
              {form.proof.type === "application/pdf" ? (
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
        </Section>
      )}

      {/* ================= SUBMIT BUTTON ================= */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 px-8 py-3 rounded-xl bg-cyan-400 text-black font-semibold hover:scale-105 transition disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit On-Duty"}
      </button>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */
const Section = ({ title, children }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
    <h2 className="text-lg font-semibold mb-4 text-cyan-400">{title}</h2>
    {children}
  </div>
);

const Grid = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;

const ReadOnly = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <input
      readOnly
      value={value}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-gray-300"
    />
  </div>
);

const Input = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <input
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
    />
  </div>
);

const Date = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
    />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o} className="text-black">
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default OnDutyForm;