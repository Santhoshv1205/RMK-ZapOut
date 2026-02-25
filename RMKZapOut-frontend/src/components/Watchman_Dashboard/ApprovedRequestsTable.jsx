import StatusBadge from "./StatusBadge";

export default function ApprovedRequestsTable({ requests }) {
  return (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl overflow-hidden mt-4">

      <table className="w-full text-sm">
        <thead className="border-b border-white/20 text-gray-300">
          <tr>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Register No</th>
            <th className="px-6 py-3 text-left">Department</th>
            <th className="px-6 py-3 text-left">Year</th>
            <th className="px-6 py-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-10 text-gray-400">
                No approved requests
              </td>
            </tr>
          ) : (
            requests.map((r) => (
              <tr
                key={r.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-6 py-4">{r.name}</td>
                <td className="px-6 py-4">{r.registerNumber}</td>
                <td className="px-6 py-4">{r.department}</td>
                <td className="px-6 py-4">{r.year}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}