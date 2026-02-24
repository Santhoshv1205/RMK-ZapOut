import { useEffect, useState } from "react";
import axios from "axios";

const PrintView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentRecords();
  }, []);

  const fetchDepartmentRecords = async () => {
    try {
      const department = localStorage.getItem("department");

      if (!department) {
        console.error("Department not found");
        setLoading(false);
        return;
      }

      // backend endpoint (adjust if needed)
      const res = await axios.get(
        `http://localhost:8080/api/records/department/${department}`
      );

      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records", err);
    } finally {
      setLoading(false);
    }
  };

  // print handler
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-white p-6">Loading records...</div>;
  }

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Department Records</h1>

        <button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold"
        >
          Print Records
        </button>
      </div>

      <div className="overflow-x-auto bg-[#0f172a] rounded-xl shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-[#1e293b] text-gray-300">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4">Register No</th>
              <th className="p-4">Department</th>
              <th className="p-4">Type</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-400">
                  No records available
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b border-gray-700 hover:bg-[#1e293b]"
                >
                  <td className="p-4">{rec.studentName}</td>
                  <td className="p-4">{rec.registerNumber}</td>
                  <td className="p-4">{rec.department}</td>
                  <td className="p-4">{rec.type}</td>
                  <td className="p-4">{rec.reason}</td>
                  <td className="p-4">{rec.status}</td>
                  <td className="p-4">{rec.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* print styling */}
      <style>
        {`
          @media print {
            button {
              display: none;
            }
            body {
              background: white;
              color: black;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PrintView;