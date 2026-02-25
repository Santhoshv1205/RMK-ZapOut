import { useEffect, useState } from "react";
import { Edit, Save, RotateCcw, AlertTriangle, Phone } from "lucide-react";
import { fetchStudentProfile, updateStudentProfile } from "../../services/studentProfileService";

const glass =
  "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl";

const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [editBasic, setEditBasic] = useState(false);
  const [editContact, setEditContact] = useState(false);
  const [editParents, setEditParents] = useState(false);

  const [errorBasic, setErrorBasic] = useState("");
  const [errorContact, setErrorContact] = useState("");
  const [errorParents, setErrorParents] = useState("");

  const initialData = {
    photo: null,
    name: "",
    roll: "",
    dept: "",
    section: "",
    year: "",
    type: "",
    hostel: "",
    room: "",
    bus: "",
    mobile: "",
    collegeEmail: "",
    personalEmail: "",
    counsellorName: "",
    counsellorMobile: "",
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",
    guardianName: "",
    guardianMobile: "",
  };

  const [form, setForm] = useState(initialData);
  const [saved, setSaved] = useState(initialData);

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchStudentProfile(user.id);
        const p = res.data;

        const mapped = {
          photo: p.photo || "",
          name: p.username || "",
          roll: p.register_number || "",
          dept: p.department || "",
          section: p.section || "",
          year: p.year_of_study || "",
          type: p.student_type === "HOSTELLER" ? "Hosteller" : "Day Scholar",
          hostel: p.hostel_name || "",
          room: p.room_number || "",
          bus: p.bus_details || "",
          mobile: p.phone || "",
          collegeEmail: p.collegeEmail || "",
          personalEmail: p.personal_email || "",
          counsellorName: p.counsellor_name || "",
          counsellorMobile: p.counsellor_mobile || "",
          fatherName: p.father_name || "",
          fatherMobile: p.father_mobile || "",
          motherName: p.mother_name || "",
          motherMobile: p.mother_mobile || "",
          guardianName: p.guardian_name || "",
          guardianMobile: p.guardian_mobile || "",
          guardianAddress: p.guardian_address || "",
        };

        setForm(mapped);
        setSaved(mapped);
      } catch {
        alert("Failed to load profile");
      }
    };

    loadProfile();
  }, [user.id]);

  /* ================= SAVE ================= */
  const saveToDB = async (section) => {
    try {
      await updateStudentProfile(user.id, {
        ...form,
        type: form.type === "Hosteller" ? "HOSTELLER" : "DAYSCHOLAR",
      });

      setSaved(form);

      if (section === "basic") setEditBasic(false);
      if (section === "contact") setEditContact(false);
      if (section === "parents") setEditParents(false);
    } catch {
      alert("Update failed");
    }
  };

  /* ================= VALIDATION ================= */
  const handleMobileChange = (field, value) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

  setForm((prev) => ({
    ...prev,
    [field]: digitsOnly,
  }));
};
  const validateBasic = () => {
    if (!form.name || !form.roll || !form.dept || !form.section || !form.year || !form.type)
      return false;

    if (form.type === "Hosteller" && (!form.hostel || !form.room)) return false;
    if (form.type === "Day Scholar" && !form.bus) return false;

    return true;
  };

  const validateContact = () =>
  isValidMobile(form.mobile) &&
  form.collegeEmail &&
  form.counsellorName;

  const validateParents = () =>
    form.fatherName && form.fatherMobile && form.motherName && form.motherMobile;

  /* ================= SAVE HANDLERS ================= */
  const saveBasic = () => {
    if (!validateBasic()) {
      setErrorBasic("All required fields are mandatory");
      return;
    }
    saveToDB("basic");
    setErrorBasic("");
  };

  const saveContact = () => {
    if (!validateContact()) {
      setErrorContact("Contact & counsellor details required");
      return;
    }
    saveToDB("contact");
    setErrorContact("");
  };

  const saveParents = () => {
    if (!validateParents()) {
      setErrorParents("Parent details are mandatory");
      return;
    }
    saveToDB("parents");
    setErrorParents("");
  };

  const resetSection = (section) => {
    setForm(saved);
    if (section === "basic") setEditBasic(false);
    if (section === "contact") setEditContact(false);
    if (section === "parents") setEditParents(false);
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-br from-[#020617] via-[#041b32] to-[#020617]/30">
      <div className="h-full px-10 py-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-8">

          {/* BASIC */}
          <div className={`${glass} p-6`}>
            <Header title="Basic Information" editing={editBasic} onEdit={() => setEditBasic(true)} onSave={saveBasic} onReset={() => resetSection("basic")} />
            {errorBasic && <Error text={errorBasic} />}
            <BasicFields editing={editBasic} form={form} setForm={setForm} />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-8">

            {/* CONTACT */}
            <div className={`${glass} p-6`}>
              <Header title="Student Contact Details" editing={editContact} onEdit={() => setEditContact(true)} onSave={saveContact} onReset={() => resetSection("contact")} />
              {errorContact && <Error text={errorContact} />}
<ContactFields
  editing={editContact}
  form={form}
  setForm={setForm}
  handleMobileChange={handleMobileChange}
/>
              
            </div>

            {/* PARENTS */}
            <div className={`${glass} p-6`}>
              <Header title="Parents & Guardian" editing={editParents} onEdit={() => setEditParents(true)} onSave={saveParents} onReset={() => resetSection("parents")} />
              {errorParents && <Error text={errorParents} />}
<ParentsFields
  editing={editParents}
  form={form}
  setForm={setForm}
  handleMobileChange={handleMobileChange}
/>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const Error = ({ text }) => (
  <div className="mb-4 flex items-center gap-2 text-red-400">
    <AlertTriangle size={16} /> {text}
  </div>
);

const BasicFields = ({ editing, form, setForm }) => (
  <div className={`${editing ? "" : "pointer-events-none opacity-60"} space-y-4`}>
    <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <Input label="Roll Number" required value={form.roll} onChange={(e) => setForm({ ...form, roll: e.target.value })} />
    <Input label="Department" required value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
    <Input label="Section" required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
    <Input label="Year / Semester" required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />

    <Select label="Student Type" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, hostel: "", room: "", bus: "" })} options={["", "Day Scholar", "Hosteller"]} />

    {form.type === "Hosteller" && (
      <>
        <Input label="Hostel Name" required value={form.hostel} onChange={(e) => setForm({ ...form, hostel: e.target.value })} />
        <Input label="Room Number" required value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
      </>
    )}
    {form.type === "Day Scholar" && (
      <Input label="Bus Stop & Bus No" required value={form.bus} onChange={(e) => setForm({ ...form, bus: e.target.value })} />
    )}
  </div>
);

const ContactFields = ({ editing, form, setForm, handleMobileChange }) => (
    <div className={`${editing ? "" : "pointer-events-none opacity-60"} space-y-4`}>
<Input
  label="Mobile Number"
  required
  type="tel"
  maxLength={10}
  value={form.mobile}
  onChange={(e) => handleMobileChange("mobile", e.target.value)}
/>
    <Input label="College Email ID" required value={form.collegeEmail} onChange={(e) => setForm({ ...form, collegeEmail: e.target.value })} />
    <Input label="Personal Email" value={form.personalEmail} onChange={(e) => setForm({ ...form, personalEmail: e.target.value })} />
    <Divider />
    <Input label="Counsellor Name" required value={form.counsellorName} onChange={(e) => setForm({ ...form, counsellorName: e.target.value })} />
  </div>
);

const ParentsFields = ({ editing, form, setForm, handleMobileChange }) => (
  <div className={`${editing ? "" : "pointer-events-none opacity-60"} space-y-4`}>
    <Input label="Father Name" required value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
<Input
  label="Father Mobile"
  required
  type="tel"
  maxLength={10}
  value={form.fatherMobile}
  onChange={(e) => handleMobileChange("fatherMobile", e.target.value)}
/>
    <Divider />
    <Input label="Mother Name" required value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} />
<Input
  label="Mother Mobile"
  required
  type="tel"
  maxLength={10}
  value={form.motherMobile}
  onChange={(e) => handleMobileChange("motherMobile", e.target.value)}
/>
    <Divider />
    <Input label="Guardian Name" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
<Input
  label="Guardian Mobile"
  type="tel"
  maxLength={10}
  value={form.guardianMobile}
  onChange={(e) => handleMobileChange("guardianMobile", e.target.value)}
/>
    <Input
  label="Guardian Address"
  value={form.guardianAddress}
  onChange={(e) => setForm({ ...form, guardianAddress: e.target.value })}
/>

  </div>
);

const Input = ({ label, required, ...props }) => (
  <div>
    <label className="text-sm text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      {...props}
      className="w-full mt-1 bg-white/5 border border-white/20 text-white rounded-lg p-2 outline-none"
    />
  </div>
);

const Select = ({ label, options, required, ...props }) => (
  <div>
    <label className="text-sm text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <select
      {...props}
      className="w-full mt-1 bg-[#0b1220] text-white border border-white/20 rounded-lg p-2"
    >
      {options.map((o, i) => (
        <option key={i} value={o}>
          {o || "Select"}
        </option>
      ))}
    </select>
  </div>
);

const Header = ({ title, editing, onEdit, onSave, onReset }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="flex gap-2">
      {!editing ? (
        <button onClick={onEdit} className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30">
          <Edit size={16} />
        </button>
      ) : (
        <>
          <button onClick={onSave} className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30">
            <Save size={16} />
          </button>
          <button onClick={onReset} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30">
            <RotateCcw size={16} />
          </button>
        </>
      )}
    </div>
  </div>
);

const Divider = () => <div className="h-px bg-white/15 my-4" />;

export default StudentProfile;
