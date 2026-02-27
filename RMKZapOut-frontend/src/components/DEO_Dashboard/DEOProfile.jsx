import { useEffect, useState } from "react";
import { getDeoProfile, updateDeoProfile } from "../../services/deoService.jsx";

const DEOProfile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    department: "",
    academic_type: "",
    role: "DEO",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  /* ---------- FETCH PROFILE ---------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDeoProfile(userId);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  /* ---------- AUTO CLEAR MESSAGE ---------- */
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  /* ---------- HANDLE INPUT ---------- */
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  /* ---------- VALIDATION ---------- */
  const validateProfile = () => {
    // Phone: exactly 10 digits
    if (!/^\d{10}$/.test(profile.phone)) {
      setMessage("Phone number must be exactly 10 digits ❌");
      return false;
    }

    // Email: valid format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      setMessage("Invalid email format ❌");
      return false;
    }

    return true;
  };

  /* ---------- SAVE PROFILE ---------- */
  const handleSave = async () => {
    if (!validateProfile()) return;

    try {
      setSaving(true);

      await updateDeoProfile(userId, {
        username: profile.username,
        phone: profile.phone,
      });

      setMessage("Profile updated successfully ✅");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-8">
      <div className="max-w-4xl mx-auto bg-[#111827] rounded-2xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">DEO Profile</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your personal information
            </p>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {message && (
          <div className="mb-6 text-sm text-red-400">{message}</div>
        )}

        {/* PROFILE INFO */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Full Name */}
          <div>
            <label className="text-gray-400 text-sm">Full Name</label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg focus:outline-none"
            />
          </div>

          {/* Phone - DIGITS ONLY */}
          <div>
            <label className="text-gray-400 text-sm">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              disabled={!editMode}
              maxLength="10"
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setProfile({ ...profile, phone: onlyNumbers });
              }}
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-400 text-sm">Email</label>
            <input
              type="text"
              value={profile.email}
              disabled
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg opacity-70 cursor-not-allowed"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-400 text-sm">Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg opacity-70 cursor-not-allowed"
            />
          </div>

          {/* Department */}
          <div>
            <label className="text-gray-400 text-sm">Department</label>
            <input
              type="text"
              value={profile.department || "N/A"}
              disabled
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg opacity-70 cursor-not-allowed"
            />
          </div>

          {/* Academic Type */}
          <div>
            <label className="text-gray-400 text-sm">Academic Type</label>
            <input
              type="text"
              value={profile.academic_type}
              disabled
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg opacity-70 cursor-not-allowed"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default DEOProfile;