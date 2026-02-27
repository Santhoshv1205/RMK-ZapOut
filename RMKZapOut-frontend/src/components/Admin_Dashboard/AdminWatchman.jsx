import { useEffect, useState } from "react";
import { Users, UserPlus, Search, Trash2, X } from "lucide-react";
import {
  fetchWatchmen,
  createWatchman,
  deleteWatchman,
  updateWatchman,
} from "../../services/adminWatchmanService.jsx";

/* ---------------- EMPTY FORM ---------------- */
const EMPTY_FORM = {
  id: null,
  username: "",
  email: "",
  is_active: true,
};

const AdminWatchmen = () => {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const adminId = loggedInUser?.role === "ADMIN" ? loggedInUser?.id : null;

  const [watchmen, setWatchmen] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [popupMsg, setPopupMsg] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const showPopup = (msg) => {
    setPopupMsg(msg);
    setTimeout(() => setPopupMsg(""), 2500);
  };

  const loadWatchmen = async () => {
    try {
      const res = await fetchWatchmen();
      setWatchmen(
        res.data.map((w) => ({
          id: w.id,
          username: w.username,
          email: w.email,
          is_active: w.is_active === 1,
        }))
      );
    } catch (error) {
      console.error(error);
      showPopup("Failed to load watchmen");
    }
  };

useEffect(() => {
  let isMounted = true; // flag to prevent state update if unmounted

  const fetchData = async () => {
    try {
      const res = await fetchWatchmen();
      if (isMounted) {
        setWatchmen(
          res.data.map((w) => ({
            id: w.id,
            username: w.username,
            email: w.email,
            is_active: w.is_active === 1,
          }))
        );
      }
    } catch (error) {
      console.error(error);
      if (isMounted) showPopup("Failed to load watchmen");
    }
  };

  fetchData();

  return () => {
    isMounted = false; // cleanup flag
  };
}, []);

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (!form.username || !form.email)
      return showPopup("Username and Email required");

    try {
      if (editId) {
        await updateWatchman(editId, form);
        showPopup("Watchman updated successfully");
      } else {
        await createWatchman(form);
        showPopup("Watchman added successfully");
      }

      setShowModal(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      loadWatchmen();
    } catch (error) {
      console.error(error);
      showPopup(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (w) => {
    setForm(w);
    setEditId(w.id);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteWatchman(deleteId, adminId);
      showPopup("Watchman deleted successfully");
      setShowDeleteConfirm(false);
      setDeleteId(null);
      loadWatchmen();
    } catch (error) {
      console.error(error);
      showPopup("Delete failed");
    }
  };

  const filtered = watchmen.filter(
    (w) =>
      w.username.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white flex gap-2">
          <Users className="text-red-500" />
          <span className="text-red-500">Watchman Management</span>
        </h1>

        {adminId && (
          <button
            onClick={() => {
              setEditId(null);
              setForm(EMPTY_FORM);
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-black font-medium"
          >
            <UserPlus size={16} className="inline mr-1" />
            Add Watchman
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl w-fit">
        <Search size={16} />
        <input
          placeholder="Search watchman..."
          className="bg-transparent outline-none text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-white text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr
                key={w.id}
                className="border-t border-white/10 text-center hover:bg-white/5"
              >
                <td className="py-2 font-medium">{w.username}</td>
                <td>{w.email}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      w.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {w.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="flex justify-center gap-2 py-2">
                  <button
                    onClick={() => handleEdit(w)}
                    className="px-3 py-1 rounded bg-yellow-500/30 hover:bg-yellow-500/50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(w.id)}
                    className="px-3 py-1 rounded bg-red-500/30 hover:bg-red-500/50"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup */}
      {popupMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-6 py-2 rounded-xl">
          {popupMsg}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="w-[420px] rounded-2xl bg-[#020617] border border-white/10 p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-white font-semibold">
                {editId ? "Edit Watchman" : "Add Watchman"}
              </h2>
              <X
                onClick={() => setShowModal(false)}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-4">
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 rounded text-white"
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 rounded text-white"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-6 bg-cyan-500 text-black py-2 rounded-xl"
            >
              {editId ? "Update Watchman" : "Create Watchman"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#020617] p-6 rounded-xl text-center">
            <p className="text-white mb-4">Delete this watchman?</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white/10 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWatchmen;