export default function StatusBadge({ status }) {
  const styles = {
    PENDING_EXIT: "bg-yellow-400/20 text-yellow-300",
    OUT: "bg-red-400/20 text-red-300",
    RETURNED: "bg-green-400/20 text-green-300",
  };

  return (
    <span
      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
        styles[status] || "bg-gray-400/20 text-gray-300"
      }`}
    >
      {status || "N/A"}
    </span>
  );
}