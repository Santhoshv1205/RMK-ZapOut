import { useEffect, useState } from "react";
import {
  fetchDepartmentStudents,
  fetchMyStudents,
  assignStudent,
  unassignStudent,
} from "../../services/staffStudentService";

const Students = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id; 
  const role = user?.role;

  const [activeTab, setActiveTab] = useState("department");
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchData = async () => {
    if (!userId || !role) return;
    setLoading(true);
    try {
      const res =
        activeTab === "department"
          ? await fetchDepartmentStudents(userId, role)
          : await fetchMyStudents(userId, role);
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, userId, role]);

  const handleAssign = async (studentId) => {
    if (!userId) return;
    setProcessingId(studentId);
    try {
      const res = await assignStudent(studentId, userId);
      if (res.data.success) {
        setMessage({ type: "success", text: "Student added to counselling!" });
        await fetchData();
      } else {
        setMessage({ type: "error", text: res.data.message || "Failed to assign student" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to assign student" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnassign = async (studentId) => {
    setProcessingId(studentId);
    try {
      const res = await unassignStudent(studentId);
      if (res.data.success) {
        setMessage({ type: "success", text: "Student removed from counselling!" });
        await fetchData();
      } else {
        setMessage({ type: "error", text: res.data.message || "Failed to unassign student" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to unassign student" });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.includes(search)
  );

  const hostellerCount = students.filter(
    (s) => s.student_type?.toLowerCase() === "hosteller"
  ).length;

  const dayscholarCount = students.filter(
    (s) => s.student_type?.toLowerCase() === "dayscholar"
  ).length;

  return (
    <div className="p-6">
      <h2 className="text-2xl text-green-500 font-bold mb-4">Students</h2>

      {message && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <button
            className={`px-5 py-2 rounded-lg font-medium transition ${
              activeTab === "department"
                ? "bg-green-600 text-white shadow"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            onClick={() => setActiveTab("department")}
          >
            Department Students
          </button>

          <button
            className={`px-5 py-2 rounded-lg font-medium transition ${
              activeTab === "my"
                ? "bg-green-600 text-white shadow"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            onClick={() => setActiveTab("my")}
          >
            My Counselling Students
          </button>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 font-medium">
            Hosteller ({hostellerCount})
          </div>

          <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-400/30 font-medium">
            Dayscholar ({dayscholarCount})
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name or register no"
        className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : filteredStudents.length === 0 ? (
        <p className="text-gray-500">No students found</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-lg">
          <table className="w-full border-collapse text-sm text-white">
            <thead className="bg-white/20 backdrop-blur-md text-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Register</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Dept</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Assigned Staff</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`transition-all duration-300 hover:bg-white/10 ${
                    idx % 2 === 0 ? "bg-white/5" : "bg-white/10"
                  }`}
                >
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.register_number}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.department}</td>
                  <td className="p-3">{s.year_of_study}</td>
                  <td className="p-3 text-cyan-400">{s.student_type}</td>
                  <td className="p-3">{s.assigned_staff || "-"}</td>
                  <td className="p-3 text-center flex justify-center gap-2">

                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs transition"
                    >
                      View
                    </button>

                    {activeTab === "department" ? (
                      <button
                        className={`px-3 py-1 rounded-lg font-medium text-white backdrop-blur-sm transition-all ${
                          s.assigned_staff
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        onClick={() => !s.assigned_staff && handleAssign(s.id)}
                        disabled={!!s.assigned_staff || processingId === s.id}
                      >
                        {processingId === s.id
                          ? "Processing..."
                          : s.assigned_staff
                          ? "Assigned"
                          : "Add"}
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white backdrop-blur-sm transition-all"
                        onClick={() => handleUnassign(s.id)}
                        disabled={processingId === s.id}
                      >
                        {processingId === s.id ? "Processing..." : "Remove"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-gray-200 
                          rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto 
                          shadow-2xl border border-white/10 relative p-8">

            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-6 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 
                              flex items-center justify-center text-3xl font-bold text-green-400">
                {selectedStudent.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white">
                  {selectedStudent.name}
                </h2>
                <p className="text-gray-400 text-sm">
                  {selectedStudent.department} • Year {selectedStudent.year_of_study}
                </p>
                <p className="text-green-400 text-sm mt-1">
                  {selectedStudent.student_type}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

  {/* BASIC INFO */}
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-green-400 mb-4">
      Basic Information
    </h3>

    <div className="space-y-2 text-sm">
      <p><span className="text-gray-400">Register No:</span> {selectedStudent.register_number}</p>
      <p><span className="text-gray-400">Email:</span> {selectedStudent.email}</p>
      <p><span className="text-gray-400">Phone:</span> {selectedStudent.phone || "-"}</p>
      {/* <p><span className="text-gray-400">DOB:</span> {selectedStudent.dob || "-"}</p> */}
      <p><span className="text-gray-400">Assigned Staff:</span> {selectedStudent.assigned_staff || "-"}</p>
    </div>
  </div>

  {/* ADDRESS */}
  {/* <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-blue-400 mb-4">
      Address Details
    </h3>

    <div className="space-y-3 text-sm">
      <div>
        <p className="text-gray-400">Current Address</p>
        <p>{selectedStudent.address || "-"}</p>
      </div>

      <div>
        <p className="text-gray-400">Permanent Address</p>
        <p>{selectedStudent.permanent_address || "-"}</p>
      </div>
    </div>
  </div> */}

  {/* PARENTS */}
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-purple-400 mb-4">
      Parent / Guardian Details
    </h3>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <p><span className="text-gray-400">Father:</span> {selectedStudent.father_name || "-"}</p>
      <p><span className="text-gray-400">Mobile:</span> {selectedStudent.father_mobile || "-"}</p>

      <p><span className="text-gray-400">Mother:</span> {selectedStudent.mother_name || "-"}</p>
      <p><span className="text-gray-400">Mobile:</span> {selectedStudent.mother_mobile || "-"}</p>

      <p><span className="text-gray-400">Guardian:</span> {selectedStudent.guardian_name || "-"}</p>
      <p><span className="text-gray-400">Mobile:</span> {selectedStudent.guardian_mobile || "-"}</p>
    </div>
  </div>

  {/* HOSTEL / BUS */}
 {/* HOSTEL / TRANSPORT */}
<div className="bg-white/5 rounded-2xl p-6 border border-white/10">
  <h3 className="text-lg font-semibold text-orange-400 mb-4">
    {selectedStudent.student_type?.toUpperCase() === "HOSTELLER"
      ? "Hostel Information"
      : "Transport Information"}
  </h3>

  <div className="space-y-2 text-sm">
    {selectedStudent.student_type?.toLowerCase() === "hosteller" ? (
      <>
        {selectedStudent.hostel_name && (
          <p>
            <span className="text-gray-400">Hostel Name:</span>{" "}
            {selectedStudent.hostel_name}
          </p>
        )}

        {selectedStudent.room_number && (
          <p>
            <span className="text-gray-400">Room Number:</span>{" "}
            {selectedStudent.room_number}
          </p>
        )}

        {!selectedStudent.hostel_name &&
          !selectedStudent.room_number && (
            <p className="text-gray-500">No hostel details available</p>
          )}
      </>
    ) : (
      <>
        {selectedStudent.bus_details ? (
          <p>
            <span className="text-gray-400">Bus Details:</span>{" "}
            {selectedStudent.bus_details}
          </p>
        ) : (
          <p className="text-gray-500">No transport details available</p>
        )}
      </>
    )}
  </div>
</div>

</div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;