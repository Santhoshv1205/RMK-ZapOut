import { useEffect, useState } from "react";
import {
  getWatchmanProfile,
  updateWatchmanProfile,
} from "../../services/watchmanService";

const WatchmanProfile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "WATCHMAN",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  /* ---------- FETCH PROFILE ---------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getWatchmanProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  /* ---------- AUTO CLEAR SUCCESS MESSAGE ---------- */
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  /* ---------- SAVE PROFILE ---------- */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateWatchmanProfile(userId, {
        username: profile.username,
      });

      setMessage("Profile updated successfully ✅");
      setEditMode(false);
    } catch (err) {
      setError(err);
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
          <h1 className="text-3xl font-bold">Watchman Profile</h1>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 px-4 py-2 rounded-lg"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-4 text-green-400 text-sm">{message}</div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 text-red-400 text-sm">{error}</div>
        )}

        {/* PROFILE INFO */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Username */}
          <div>
            <label className="text-gray-400 text-sm">Full Name</label>
            <input
              type="text"
              name="username"
              value={profile.username}
              disabled={!editMode}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-400 text-sm">Email</label>
            <input
              type="text"
              value={profile.email}
              disabled
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg opacity-70"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-400 text-sm">Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full mt-1 bg-[#1f2937] p-3 rounded-lg opacity-70"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default WatchmanProfile;