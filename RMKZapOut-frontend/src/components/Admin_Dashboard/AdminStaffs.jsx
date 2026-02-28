import { useEffect, useState } from "react";
import { Users, UserPlus, Search, Trash2, X } from "lucide-react";
import {
  fetchStaffs,
  createStaff,
  deleteStaff,
  updateStaff,
} from "../../services/adminStaffService";
import { fetchDepartments } from "../../services/departmentService";

/* ---------------- CONSTANTS ---------------- */
const ACADEMIC_TYPES = ["BASE_DEPT", "CORE_DEPT"];

const EMPTY_FORM = {
  id: null,
  username: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  academic_type: "",
  year: "",
  is_active: false,
};

/* ---------------- COMPONENT ---------------- */
const AdminStaffs = () => {
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const adminId = loggedInUser?.role === "ADMIN" ? loggedInUser?.id : null;

  /* ---------------- STATE ---------------- */
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);

  const [popupMsg, setPopupMsg] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* ---------------- HELPERS ---------------- */
  const showPopup = (msg) => {
    setPopupMsg(msg);
    setTimeout(() => setPopupMsg(""), 2500);
  };

  const loadStaffs = async () => {
    try {
      const res = await fetchStaffs();
      setStaffs(
        res.data.map((s) => ({
          id: s.id,
          username: s.username,
          email: s.email,
          phone: s.phone || "",
          role: s.role,
          department: s.department || "-",
          year: s.coordinator_year || null,
          academic_type: s.academic_type || "-",
          is_active: s.is_active === 1,
        }))
      );
    } catch (error) {
      console.error(error);
      showPopup("Failed to load staffs");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load staffs
        const staffRes = await fetchStaffs();
        setStaffs(
          staffRes.data.map((s) => ({
            id: s.id,
            username: s.username,
            email: s.email,
            phone: s.phone || "",
            role: s.role,
            department: s.department || "-",
            year: s.coordinator_year || null,
            academic_type: s.academic_type || "-",
            is_active: s.is_active === 1,
          }))
        );

        // Load departments
        const deptRes = await fetchDepartments();
        setDepartments(deptRes.data); // res.data is array of {id, name, display_name}
      } catch (error) {
        console.error(error);
        setTimeout(() => showPopup("Failed to load data"), 0);
      }
    };

    fetchData();
  }, []);

  /* ---------------- CHECK BASE_DEPT AVAILABILITY ---------------- */
  const baseDeptExists = (role) => {
    return staffs.some(
      (s) => s.role === role && s.academic_type === "BASE_DEPT"
    );
  };

  /* ---------------- CRUD ---------------- */
  const handleSaveStaff = async () => {
    // Validate phone: exactly 10 digits
    if (!/^\d{10}$/.test(form.phone)) {
      return showPopup("Phone number must be exactly 10 digits");
    }

    try {
      // Prevent duplicate BASE_DEPT Coordinator/HOD
      if (
        form.academic_type === "BASE_DEPT" &&
        ["COORDINATOR", "HOD"].includes(form.role) &&
        !editStaffId &&
        baseDeptExists(form.role)
      ) {
        return showPopup(
          `BASE_DEPT ${form.role} already exists. Cannot create another.`
        );
      }

      if (editStaffId) {
        await updateStaff(editStaffId, adminId, form);
        showPopup("Staff updated successfully");
      } else {
        await createStaff({ adminId, ...form });
        showPopup("Staff added successfully");
      }

      setShowModal(false);
      setEditStaffId(null);
      setForm(EMPTY_FORM);
      loadStaffs();
    } catch (error) {
      console.error(error);
      showPopup(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteStaffId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStaff = async () => {
    try {
      await deleteStaff(deleteStaffId, adminId);
      showPopup("Staff deleted successfully");
      setShowDeleteConfirm(false);
      setDeleteStaffId(null);
      loadStaffs();
    } catch (error) {
      console.error(error);
      showPopup("Delete failed");
    }
  };

  const handleEditStaff = (s) => {
    setForm({
      id: s.id,
      username: s.username,
      email: s.email,
      phone: s.phone,
      role: s.role,
      department: s.department === "-" ? "" : s.department,
      academic_type: s.academic_type === "-" ? "" : s.academic_type,
      year: s.year || "",
      is_active: s.is_active,
    });
    setEditStaffId(s.id);
    setShowModal(true);
  };

  /* ---------------- FILTER ---------------- */
  const filteredStaffs = staffs.filter((s) => {
    const matchSearch =
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

   const matchRole =
  roleFilter === "All"
    ? true
    : roleFilter === "OTHERS"
    ? ["ADMIN", "DEO"].includes(s.role)
    : s.role === roleFilter;

    return matchSearch && matchRole;
  });

  /* ---------------- UI ---------------- */
  return (
    <div className="p-8 space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white flex gap-2">
          <Users className="text-red-500" /> <text className="text-red-500">Staff Management</text>
        </h1>

        {adminId && (
          <button
            onClick={() => {
              setEditStaffId(null);
              setForm(EMPTY_FORM);
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-cyan-300 text-black font-medium"
          >
            <UserPlus size={16} className="inline mr-1" />
            Add Staff
          </button>
        )}
      </div>

      {/* Search + Role Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
          <Search size={16} />
          <input
            placeholder="Search staff..."
            className="bg-transparent outline-none text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {["All", "COUNSELLOR", "COORDINATOR", "HOD", "OTHERS"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-5 py-2 rounded-xl ${
              roleFilter === r
                ? "bg-cyan-500/20 text-cyan-300"
                : "bg-white/10 text-white/70"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-white text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Department</th>
              <th>Academic Type</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>
       <tbody>
  {filteredStaffs.map((s) => (
    <tr key={s.id} className="border-t border-white/10 text-center hover:bg-white/5 transition-colors">
      <td className="py-2 font-medium">{s.username}</td>
      <td>{s.email}</td>
      <td>{s.phone}</td>
      <td className="text-cyan-300 font-semibold">{s.role || "N/A"}</td>

      {/* Department */}
      <td>
        {s.role === "COUNSELLOR" || s.academic_type !== "BASE_DEPT" ? (
          <span className="px-2 py-1 rounded text-sm bg-white/10">
            {s.department || "N/A"}
          </span>
        ) : (
          <span className="text-white/50">N/A</span>
        )}
      </td>

      {/* Academic Type */}
      <td>
        {s.academic_type ? (
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              s.academic_type === "BASE_DEPT"
                ? "bg-red-500/20 text-red-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {s.academic_type}
          </span>
        ) : (
          <span className="text-white/50">N/A</span>
        )}
      </td>

      {/* Year */}
      <td>
        {s.role === "COORDINATOR" ? (
          s.year ? (
            <span className="px-2 py-1 rounded text-sm bg-white/10">{s.year}</span>
          ) : (
            <span className="text-white/50">N/A</span>
          )
        ) : (
          <span className="text-white/50">N/A</span>
        )}
      </td>

      {/* Actions */}
      <td className="flex justify-center gap-2 py-2">
        <button
          onClick={() => handleEditStaff(s)}
          className="px-3 py-1 rounded bg-yellow-500/30 hover:bg-yellow-500/50 transition"
        >
          Edit
        </button>
        {adminId && (
          <button
            onClick={() => handleDeleteClick(s.id)}
            className="px-3 py-1 rounded bg-red-500/30 hover:bg-red-500/50 transition"
          >
            <Trash2 size={14} />
          </button>
        )}
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

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="w-[420px] rounded-2xl bg-[#020617] border border-white/10 p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-white font-semibold">
                {editStaffId ? "Edit Staff" : "Add Staff"}
              </h2>
              <X
                className="cursor-pointer"
                onClick={() => setShowModal(false)}
              />
            </div>

            <div className="space-y-4">
              {/* Username & Email */}
              <input
                placeholder="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 rounded text-white"
              />
              <input
                placeholder="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 rounded text-white"
              />

              {/* Phone */}
              <input
                placeholder="phone"
                value={form.phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  if (digitsOnly.length <= 10) {
                    setForm({ ...form, phone: digitsOnly });
                  }
                }}
                className="w-full px-3 py-2 bg-white/10 rounded text-white"
              />

              {/* Role Dropdown */}
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value, year: "" })
                }
                className="w-full px-3 py-2 bg-white/10 rounded text-white"
              >
<option value="" disabled className="bg-[#020617] text-white">
                  Select role
                </option>
                <option value="COUNSELLOR" className="bg-[#020617] text-white">Counsellor</option>
<option value="COORDINATOR" className="bg-[#020617] text-white">Coordinator</option>
<option value="HOD" className="bg-[#020617] text-white">HOD</option>
<option value="WARDEN" className="bg-[#020617] text-white">Warden</option>
<option value="DEO" className="bg-[#020617] text-white">
  DEO
</option>

              </select>

              {/* Academic Type */}
              <select
                value={form.academic_type}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({
                    ...form,
                    academic_type: value,
                    year:
                      value === "BASE_DEPT" && form.role === "COORDINATOR"
                        ? 1
                        : form.year,
                  });
                }}
                className="w-full px-3 py-2 bg-white/10 rounded text-white"
              >
<option value="" disabled className="bg-[#020617] text-white">
                  Select academic type
                </option>
                {ACADEMIC_TYPES.map((t) => (
                  <option
                    key={t}
                      className="bg-[#020617] text-white"

                    disabled={
                      t === "BASE_DEPT" &&
                      ["COORDINATOR", "HOD","DEO"].includes(form.role) &&
                      baseDeptExists(form.role) &&
                      !editStaffId
                    }
                  >
                    {t}
                  </option>
                ))}
              </select>

              {/* Department */}
              {!(form.academic_type === "BASE_DEPT" &&
                ["HOD", "COORDINATOR","DEO"].includes(form.role)) && (
                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/10 rounded text-white"
                >
<option value="" disabled className="bg-[#020617] text-white">
                    Select department
                  </option>
                  {departments.map((d) => (
<option key={d.id} value={d.name} className="bg-[#020617] text-white">
                      {d.display_name}
                    </option>
                  ))}
                </select>
              )}

              {/* Coordinator Year */}
              {form.role === "COORDINATOR" &&
                !(form.academic_type === "BASE_DEPT") && (
                  <select
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white/10 rounded text-white"
                  >
<option value="" disabled className="bg-[#020617] text-white">
                      Select year
                    </option>
                    <option value={1} className="bg-[#020617] text-white">1st Year</option>
<option value={2} className="bg-[#020617] text-white">2nd Year</option>
<option value={3} className="bg-[#020617] text-white">3rd Year</option>
<option value={4} className="bg-[#020617] text-white">4th Year</option>

                  </select>
                )}
            </div>

            <button
              onClick={handleSaveStaff}
              className="w-full mt-6 bg-cyan-500 text-black py-2 rounded-xl"
            >
              {editStaffId ? "Update Staff" : "Create Staff"}
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#020617] p-6 rounded-xl text-center">
            <p className="text-white mb-4">Delete this staff?</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white/10 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStaff}
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

export default AdminStaffs;
