import { useEffect, useState } from "react";
import axios from "axios";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentStudents();
  }, []);

  const fetchDepartmentStudents = async () => {
    try {
      // get logged-in DEO department
      const department = localStorage.getItem("department");

      if (!department) {
        console.error("Department not found in localStorage");
        setLoading(false);
        return;
      }

      // call backend
      const res = await axios.get(
        `http://localhost:8080/api/students/department/${department}`
      );

      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white text-lg p-6">Loading students...</div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-6">
        Department Students
      </h1>

      <div className="overflow-x-auto bg-[#0f172a] rounded-xl shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-[#1e293b] text-gray-300">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Register No</th>
              <th className="p-4">Department</th>
              <th className="p-4">Year</th>
              <th className="p-4">Email</th>
            </tr>
          </thead>

          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No students found for your department
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-gray-700 hover:bg-[#1e293b]"
                >
                  <td className="p-4">{student.name}</td>
                  <td className="p-4">{student.registerNumber}</td>
                  <td className="p-4">{student.department}</td>
                  <td className="p-4">{student.year}</td>
                  <td className="p-4">{student.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;