import { useEffect, useState } from "react";
import { getWatchmanLogs } from "../../services/watchmanService";

const WatchmanLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await getWatchmanLogs();
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
                <th className="text-left py-3">Type</th>
                <th className="text-left py-3">Reason</th>
                <th className="text-left py-3">From</th>
                <th className="text-left py-3">To</th>
                <th className="text-left py-3">Exit Time</th>
                <th className="text-left py-3">Entry Time</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-white/40">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-white/40">
                    No scan records available
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3">{log.register_number}</td>
                    <td className="py-3">{log.student_name}</td>
                    <td className="py-3">{log.department}</td>
                    <td className="py-3">{log.request_type}</td>
                    <td className="py-3">{log.reason}</td>
                    <td className="py-3">
                      {formatDateTime(log.from_date)}
                    </td>
                    <td className="py-3">
                      {formatDateTime(log.to_date)}
                    </td>

                    <td className="py-3 text-red-400 font-medium">
                      {formatDateTime(log.exit_datetime)}
                    </td>

                    <td className="py-3 text-green-400 font-medium">
                      {formatDateTime(log.entry_datetime)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WatchmanLogs;    