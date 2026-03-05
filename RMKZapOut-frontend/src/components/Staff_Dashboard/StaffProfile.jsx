import { useEffect, useState } from "react";
import { User, Mail, Phone, ShieldCheck, Pencil, Save, RotateCcw } from "lucide-react";
import { fetchStaffProfile, updateStaffProfile } from "../../services/staffProfileService.jsx";
import axios from "axios";

const DEPT_API = `${import.meta.env.VITE_API_URL}/api/departments`;

const StaffProfile = () => {
  const sessionUser = JSON.parse(localStorage.getItem("user"));
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
const [errorMsg, setErrorMsg] = useState("");

  // Fetch profile
  const loadProfile = async () => {
    try {
      const res = await fetchStaffProfile(sessionUser.id);
      setProfile(res.data.profile);
      setTempProfile(res.data.profile);
    } catch (err) {
      console.error("Profile fetch failed", err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const loadDepartments = async () => {
    try {
      const res = await axios.get(DEPT_API);
      setDepartments(res.data);
    } catch (err) {
      console.error("Department fetch failed", err);
    }
  };

  useEffect(() => {
    if (sessionUser?.id) {
      loadProfile();
      loadDepartments();
    }
  }, [sessionUser?.id]);

const handleEdit = () => {
  setErrorMsg("");
  setEditMode(true);
};

const handleSave = async () => {
  try {
    setErrorMsg(""); // clear old errors

    // ✅ Mobile must be exactly 10 digits
    const isValidMobile = /^[0-9]{10}$/.test(tempProfile?.phone || "");

    if (!isValidMobile) {
      setErrorMsg("Mobile number must be exactly 10 digits.");
      return; // stop save
    }

    await updateStaffProfile(sessionUser.id, tempProfile);
    setProfile(tempProfile);
    setEditMode(false);

  } catch (err) {
    console.error("Profile update error:", err);

    const message =
      err?.response?.data?.message ||
      "Failed to update profile. Please try again.";

    setErrorMsg(message); // show UI error box
  }
};


  const handleReset = () => setTempProfile(profile);
  const handleMobileChange = (value) => {
  if (!tempProfile) return; // prevent crash

  const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

  setTempProfile((prev) => ({
    ...(prev || {}),
    phone: digitsOnly,
  }));
};

  if (loading) return <p className="p-6 text-white">Loading profile…</p>;
  if (!profile) return null;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl text-green-500 font-semibold mb-6">Staff Profile</h1>

      {/* PROFILE CARD */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6 flex gap-6 items-center">
        <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
          {profile.username?.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{profile.username}</h2>
          <p className="text-[#00d3d1]">{profile.role}</p>
          <p className="text-sm text-white/70">
            {profile.department} ({profile.department_short})
          </p>
          {profile.designation && (
            <p className="text-sm text-white/70">{profile.designation}</p>
          )}
        </div>
      </div>
{errorMsg && (
  <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
    <p className="text-sm font-medium">{errorMsg}</p>
  </div>
)}

      {/* BASIC DETAILS */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User size={18} /> Basic Details
          </h3>
          {!editMode ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 text-sm text-[#00d3d1]"
            >
              <Pencil size={16} /> Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 text-sm text-green-400"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-yellow-400"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NAME */}
          <InputField
            label="Name"
            value={tempProfile.username}
            disabled={!editMode}
            onChange={(v) => setTempProfile({ ...tempProfile, username: v })}
          />

          {/* DEPARTMENT */}
          <div>
            <label className="text-sm text-white/70 mb-1 block">Department</label>
            <select
              disabled={!editMode}
              value={tempProfile.department_id || ""}
              onChange={(e) => {
                const deptId = e.target.value;
                const dept = departments.find((d) => d.id == deptId) || {};
                setTempProfile({
                  ...tempProfile,
                  department_id: deptId,
                  department: dept.display_name || "",
                  department_short: dept.name || "",
                });
              }}
              className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 w-full text-white"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.display_name} ({d.name})
                </option>
              ))}
            </select>
          </div>
{/* YEAR (ONLY FOR COORDINATOR) */}
{tempProfile.role === "COORDINATOR" && (
  <div>
    <label className="text-sm text-white/70 mb-1 block">Year</label>
    <select
      disabled={!editMode}
      value={tempProfile.year || ""}
      onChange={(e) =>
        setTempProfile({ ...tempProfile, year: Number(e.target.value) })
      }
      className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 w-full text-white"
    >
      <option value="">Select Year</option>
      <option value={1}>1st Year</option>
      <option value={2}>2nd Year</option>
      <option value={3}>3rd Year</option>
      <option value={4}>4th Year</option>
    </select>
  </div>
)}

          {/* DESIGNATION */}
          <InputField
            label="Designation"
            value={tempProfile.designation || ""}
            disabled={!editMode}
            onChange={(v) => setTempProfile({ ...tempProfile, designation: v })}
          />

          {/* ROLE */}
          <InputField label="Role" value={tempProfile.role} disabled />
        </div>
      </div>

      {/* CONTACT DETAILS */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <ShieldCheck size={18} /> Contact Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            icon={<Mail size={16} />}
            label="Official Email"
            value={tempProfile.email}
            disabled={!editMode}
            onChange={(v) => setTempProfile({ ...tempProfile, email: v })}
          />

          <InputField
  icon={<Phone size={16} />}
  label="Mobile Number"
  value={tempProfile.phone || ""}
  disabled={!editMode}
  onChange={(v) => handleMobileChange(v)}
/>
        </div>
      </div>
    </div>
  );
};

/* INPUT FIELD COMPONENT */
const InputField = ({ label, value, onChange, disabled, icon }) => (
  <div>
    <label className="text-sm text-white/70 mb-1 block">{label}</label>
    <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
      {icon}
      <input
        type="text"
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="bg-transparent outline-none w-full text-white disabled:text-white/60"
      />
    </div>
  </div>
);

export default StaffProfile;
