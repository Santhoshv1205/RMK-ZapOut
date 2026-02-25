import { useEffect, useState } from "react";
import {
  fetchDepartmentStudents,
} from "../../services/staffStudentService";

const Students = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const role = user?.role;

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH DATA (SAME AS STAFF LOGIC) ---------------- */
  const fetchData = async () => {
    if (!userId || !role) return;

    setLoading(true);
    try {
      const res = await fetchDepartmentStudents(userId, role);

      /* ⭐ IMPORTANT — same handling used in staff dashboard */
      const data = res?.data?.data || res?.data || [];

      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, role]);

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.includes(search)
  );

  /* ---------------- COUNTS ---------------- */
  const hostellerCount = students.filter(
    (s) => s.student_type?.toLowerCase() === "hosteller"
  ).length;

  const dayscholarCount = students.filter(
    (s) => s.student_type?.toLowerCase() === "dayscholar"
  ).length;

  return (
    <div className="p-6">
      <h2 className="text-2xl text-green-500 font-bold mb-4">
        Department Students
      </h2>

      {/* Counters */}
      <div className="flex justify-end gap-3 mb-4">
        <div className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 font-medium">
          Hosteller ({hostellerCount})
        </div>

        <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-400/30 font-medium">
          Dayscholar ({dayscholarCount})
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or register no"
        className="border p-2 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Students;