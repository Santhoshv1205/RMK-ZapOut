import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Users } from "lucide-react";

const API = "http://localhost:5000/api/admin";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    username: "",
    register_number: "",
    email: "",
    phone: "",
    student_type: "HOSTELLER",
    department_id: "",
    staff_id: "",
    year_of_study: "",
  });

  /* ================= LOAD INITIAL DATA ================= */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [studentsRes, deptRes] = await Promise.all([
          axios.get(`${API}/students`),
          axios.get(`${API}/departments`),
        ]);
        setStudents(studentsRes.data);
        setDepartments(deptRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

  /* ============ LOAD COUNSELLORS WHEN DEPT OR YEAR CHANGES ============ */
  useEffect(() => {
    const fetchCounsellors = async () => {
      if (!form.department_id) {
        setCounsellors([]);
        return;
      }

      try {
        // Determine academic_type based on year
        let academic_type = form.year_of_study === "1" || form.year_of_study === 1
          ? "BASE_DEPT"
          : "CORE_DEPT";

        const res = await axios.get(
          `${API}/staff/${form.department_id}?academic_type=${academic_type}`
        );
        setCounsellors(res.data);
        // Reset staff selection if current staff doesn't match new list
        if (!res.data.find((c) => c.staff_id === form.staff_id)) {
          setForm((prev) => ({ ...prev, staff_id: "" }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCounsellors();
  }, [form.department_id, form.year_of_study]);

  /* ================= HANDLERS ================= */

  const handlePhoneChange = (value) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

  setForm((prev) => ({
    ...prev,
    phone: digitsOnly,
  }));
};

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleDepartmentChange = (e) => {
    setForm({ ...form, department_id: e.target.value, staff_id: "" });
  };

  const handleSubmit = async () => {
  if (!form.username || !form.register_number || !form.email || !form.department_id) {
    alert("Please fill all required fields");
    return;
  }

  // ✅ Phone validation
  const isValidPhone = /^[0-9]{10}$/.test(form.phone || "");

  if (!isValidPhone) {
    alert("Phone number must be exactly 10 digits.");
    return;
  }

    try {
      if (editData) {
        await axios.put(`${API}/students/${editData.student_id}`, form);
      } else {
        await axios.post(`${API}/students`, form);
      }

      const res = await axios.get(`${API}/students`);
      setStudents(res.data);
      setOpen(false);
      setEditData(null);
    } catch (err) {
      console.error("Submit Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

 const handleEdit = async (s) => {
  setEditData(s);
  setForm({
    username: s.username,
    register_number: s.register_number,
    email: s.email,
    phone: s.phone || "",
    student_type: s.student_type,
    department_id: s.department_id,
    staff_id: s.counsellor_id,
    year_of_study: s.year_of_study,
  });

  // Fetch counsellors for this department & year
  let academic_type = s.year_of_study === "1" || s.year_of_study === 1
    ? "BASE_DEPT"
    : "CORE_DEPT";

  try {
    const res = await axios.get(`${API}/staff/${s.department_id}?academic_type=${academic_type}`);
    setCounsellors(res.data);

    // Now set the staff_id if exists in fetched counsellors
    if (res.data.find((c) => c.staff_id === s.staff_id)) {
      setForm((prev) => ({ ...prev, staff_id: s.staff_id }));
    }
  } catch (err) {
    console.error(err);
  }

  setOpen(true);
};


  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API}/students/${deleteId}`);
      setStudents((prev) => prev.filter((s) => s.student_id !== deleteId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 text-2xl font-semibold">
          <Users className="text-red-500" /> <text className="text-red-500">Students Management</text>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setForm({
              username: "",
              register_number: "",
              email: "",
              phone: "",
              student_type: "HOSTELLER",
              department_id: "",
              staff_id: "",
              year_of_study: "",
            });
            setOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-lg"
        >
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/20">
            <tr className="text-center [&>th]:text-center [&>th]:px-0">
              <th className="px-6 py-4 text-center">Name</th>
              <th>Register</th>
              <th>Email</th>
              <th>Dept</th>
              <th>Year</th>
              <th>Type</th>
              <th>Counsellor</th>
              <th className="pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.student_id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-6 py-4">{s.username}</td>
                <td>{s.register_number}</td>
                <td>{s.email}</td>
                <td>{s.department}</td>
                <td>{s.year_of_study}</td>
                <td className="text-cyan-400">{s.student_type}</td>
                <td>{s.counsellor}</td>
                <td className="flex gap-3 py-4">
                  <button
                    className="px-3 py-1 bg-yellow-600/80 rounded"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600/80 rounded"
                    onClick={() => handleDeleteClick(s.student_id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE POPUP */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[380px] rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#020617] p-6 shadow-2xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2">Delete Student</h2>
            <p className="text-white/60 mb-6">
              Are you sure you want to delete this student?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[420px] rounded-2xl bg-gradient-to-br from-[#0b1220] to-[#020617] p-6 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {editData ? "Update Student" : "Add Student"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <Input label="Name" name="username" value={form.username} onChange={handleChange} />
              <Input label="Register Number" name="register_number" value={form.register_number} onChange={handleChange} />
              <Input label="Email" name="email" value={form.email} onChange={handleChange} />
              <Input
  label="Phone"
  name="phone"
  value={form.phone}
  onChange={(e) => handlePhoneChange(e.target.value)}
/>

              <Select
                label="Student Type"
                name="student_type"
                value={form.student_type}
                onChange={handleChange}
                options={[
                  { value: "HOSTELLER", label: "Hosteller" },
                  { value: "DAYSCHOLAR", label: "Dayscholar" },
                ]}
              />

              <Select
                label="Department"
                value={form.department_id}
                onChange={handleDepartmentChange}
                options={departments.map((d) => ({
                  value: d.id,
                  label: d.display_name,
                }))}
              />
 <Input label="Year" name="year_of_study" value={form.year_of_study} onChange={handleChange} />
              <Select
                label="Counsellor"
                name="staff_id"
                value={form.staff_id}
                onChange={handleChange}
                options={counsellors.map((c) => ({
                  value: c.staff_id,
                  label: c.username,
                }))}
              />

             
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold"
            >
              {editData ? "Update Student" : "Create Student"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= REUSABLE INPUT ================= */
const Input = ({ label, ...props }) => (
  <div>
    <label className="text-white/60">{label}</label>
    <input
      {...props}
      className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 text-white outline-none"
    />
  </div>
);

/* ================= REUSABLE SELECT ================= */
const Select = ({ label, options, ...props }) => (
  <div>
    <label className="text-white/60">{label}</label>
    <select
      {...props}
      className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 text-white outline-none"
    >
<option value="" className="bg-[#020617] text-white">
  Select {label}
</option>
      {options.map((opt) => (
<option key={opt.value} value={opt.value} className="bg-[#020617] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default AdminStudents;
