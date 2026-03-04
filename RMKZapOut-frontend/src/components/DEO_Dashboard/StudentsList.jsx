import { useEffect, useState } from "react";
import { fetchDepartmentStudents } from "../../services/deoService";

const StudentList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const role = user?.role;

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async () => {
    if (!userId || role !== "DEO") return;

    setLoading(true);
    try {
      const res = await fetchDepartmentStudents(userId);
      const data = res?.data?.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Student Fetch Error:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [userId]);

  /* ================= SEARCH ================= */
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= COUNTS ================= */
  const hostellerCount = students.filter(
    (s) => s.student_type?.toUpperCase() === "HOSTELLER"
  ).length;

  const dayscholarCount = students.filter(
    (s) => s.student_type?.toUpperCase() === "DAYSCHOLAR"
  ).length;

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl text-green-400 font-bold mb-6">
        Department Students
      </h2>

      {/* ================= COUNTERS ================= */}
      <div className="flex justify-end gap-3 mb-6">
        <div className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
          Hosteller ({hostellerCount})
        </div>

        <div className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-400/30">
          Dayscholar ({dayscholarCount})
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <input
        type="text"
        placeholder="Search by name or register number"
        className="border p-2 w-full mb-6 rounded-xl bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}
      {loading ? (
        <p className="text-gray-400">Loading students...</p>
      ) : filteredStudents.length === 0 ? (
        <p className="text-gray-500">No students found</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-lg">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-white/20 text-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Register</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Assigned Staff</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s, index) => (
                <tr
                  key={s.id}
                  className={`transition-all duration-300 hover:bg-white/10 ${
                    index % 2 === 0 ? "bg-white/5" : "bg-white/10"
                  }`}
                >
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.register_number}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.department}</td>
                  <td className="p-3">{s.year_of_study}</td>
                  <td className="p-3 text-cyan-400">{s.student_type}</td>
                  <td className="p-3">{s.assigned_staff || "-"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL ================= */}
    {selectedStudent && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-gray-200 
                    rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto 
                    shadow-2xl border border-white/10 relative p-8">

      {/* Close Button */}
      <button
        onClick={() => setSelectedStudent(null)}
        className="absolute top-5 right-6 text-gray-400 hover:text-white text-2xl transition"
      >
        ✕
      </button>

      {/* Header */}
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
            {selectedStudent.department} • Year {selectedStudent.year_of_study} • Section {selectedStudent.section || "-"}
          </p>
          <p className="text-green-400 text-sm mt-1">
            {selectedStudent.student_type}
          </p>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* BASIC INFO */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-green-400 mb-4">
            Basic Information
          </h3>

          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Register No:</span> {selectedStudent.register_number}</p>
            <p><span className="text-gray-400">Email:</span> {selectedStudent.email}</p>
            <p><span className="text-gray-400">Phone:</span> {selectedStudent.phone}</p>
            <p><span className="text-gray-400">DOB:</span> {selectedStudent.dob || "-"}</p>
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
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-orange-400 mb-4">
            {selectedStudent.student_type?.toUpperCase() === "HOSTELLER"
              ? "Hostel Information"
              : "Transport Information"}
          </h3>

          <div className="space-y-2 text-sm">
            {selectedStudent.student_type?.toUpperCase() === "HOSTELLER" ? (
              <>
                <p>
                  <span className="text-gray-400">Hostel Name:</span>{" "}
                  {selectedStudent.hostel_name || "-"}
                </p>
                <p>
                  <span className="text-gray-400">Room Number:</span>{" "}
                  {selectedStudent.room_number || "-"}
                </p>
              </>
            ) : (
              <p>
                <span className="text-gray-400">Bus Details:</span>{" "}
                {selectedStudent.bus_details || "-"}
              </p>
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

export default StudentList;