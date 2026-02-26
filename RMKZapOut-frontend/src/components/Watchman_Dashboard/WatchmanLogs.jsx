import { useState } from "react";

const WatchmanLogs = () => {
  // Dummy scanned students data
  const [logs] = useState([
    {
      id: 1,
      register_number: "21CS001",
      name: "Arun Kumar",
      department: "CSE",
      year_of_study: 3,
      entry_time: "09:12 AM",
      exit_time: "-",
    },
    {
      id: 2,
      register_number: "22ME045",
      name: "Rahul",
      department: "MECH",
      year_of_study: 2,
      entry_time: "08:55 AM",
      exit_time: "01:30 PM",
    },
    {
      id: 3,
      register_number: "23IT021",
      name: "Priya",
      department: "IT",
      year_of_study: 1,
      entry_time: "10:05 AM",
      exit_time: "-",
    },
  ]);

  return (
    <div className="p-8 text-white min-h-screen">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-[#52dbff] mb-8">
        Watchman Logs
      </h1>

      {/* LOG TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="border-b border-white/10 text-white/60">
              <tr>
                <th className="text-left py-3">Reg No</th>
                <th className="text-left py-3">Name</th>
                <th className="text-left py-3">Department</th>
                <th className="text-left py-3">Year</th>
                <th className="text-left py-3">Entry Time</th>
                <th className="text-left py-3">Exit Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-3">{student.register_number}</td>
                  <td className="py-3">{student.name}</td>
                  <td className="py-3">{student.department}</td>
                  <td className="py-3">{student.year_of_study}</td>

                  <td className="py-3 text-green-400 font-medium">
                    {student.entry_time}
                  </td>

                  <td className="py-3 text-red-400 font-medium">
                    {student.exit_time}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-white/40"
                  >
                    No scan records available
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
};

export default WatchmanLogs;