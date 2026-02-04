import { useEffect } from "react";
import { Bell, Trash2, Check, CalendarCheck, LogOut } from "lucide-react";
import { useNotifications } from "../context/NotificationContext.jsx";

const StaffNotifications = () => {
  const { notifications, markAllRead, clearAll } = useNotifications();


  useEffect(() => {
    if (notifications.some((n) => !n.is_read)) {
      
      markAllRead();
    }
  }, [notifications, markAllRead]);

const getTypeStyle = (type) => {
  if (type === "on-duty") {
    return {
      bg: "bg-emerald-900/20 border-emerald-600/50",
      badge: "bg-emerald-600",
      icon: <CalendarCheck size={20} className="text-emerald-400" />,
      label: "ON-DUTY",
    };
  }

  if (type === "gate-pass") {
    return {
      bg: "bg-indigo-900/20 border-indigo-600/50",
      badge: "bg-indigo-600",
      icon: <LogOut size={20} className="text-indigo-400" />,
      label: "GATE PASS",
    };
  }

  return {
    bg: "bg-gray-800/30 border-gray-700/50",
    badge: "bg-gray-600",
    icon: <Bell size={20} className="text-gray-400" />,
    label: "SYSTEM",
  };
};



  return (
    <div className="max-w-5xl mx-auto mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-900/80">
        <div className="flex items-center gap-3">
          <Bell className="text-indigo-400" />
          <h3 className="text-xl font-semibold text-white">Notifications</h3>
          {notifications.some((n) => !n.is_read) && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">NEW</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition"
          >
            <Check size={16} /> Mark All Read
          </button>

          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      {/* Notifications Body */}
      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Bell size={48} className="mb-4 opacity-40" />
            <p className="text-lg">No notifications available</p>
          </div>
        ) : (
        notifications.map((n) => {
  const style = getTypeStyle(n.type);

  // ✅ detect rejection
// ✅ Detect rejection and remove student info
const isRejected = n.message.toLowerCase().includes("rejected");

let displayMessage = n.message;

if (isRejected) {
  // Remove " for <name> (...)" part
 displayMessage = n.message.replace(/\sfor\s.*?\(.+?\)/, "");
}


  // ✅ forwarded request regex
  const forwardMatch = n.message.match(
    /(.*) forwarded this request for (.*) \((.*) - (.*) Year, Reg: (.*)\)/
  );

  // ✅ original submission regex
  const originalMatch = n.message.match(
    /(New.*submitted) by (.*) \((.*) - (.*) Year, Reg: (.*)\)/
  );

  const isForwarded = !!forwardMatch;

  // ✅ TITLE LOGIC (VERY IMPORTANT)
  const title = isRejected
    ? "Request Rejected"
    : isForwarded
      ? forwardMatch[1]
      : originalMatch?.[1] || "Notification";

  // ✅ Extract details ONLY if NOT rejected
  const forwarderName =
    !isRejected && isForwarded ? forwardMatch[1] : null;

  const studentName =
    !isRejected && (isForwarded ? forwardMatch[2] : originalMatch?.[2]);

  const dept =
    !isRejected && (isForwarded ? forwardMatch[3] : originalMatch?.[3]);

  const year =
    !isRejected && (isForwarded ? forwardMatch[4] : originalMatch?.[4]);

  const reg =
    !isRejected && (isForwarded ? forwardMatch[5] : originalMatch?.[5]);

  return (
    <div
      key={n.id}
      className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 ${
        style.bg
      }`}
    >
      <div className="flex gap-3">
        <div className="mt-1">{style.icon}</div>

        <div className="space-y-1">
          {/* Badge */}
          <span className={`px-2 py-0.5 text-xs text-white rounded-full ${style.badge}`}>
            {style.label}
          </span>

          {/* Title */}
          <p className="font-medium text-white">{title}</p>

          {/* ✅ REJECTED MESSAGE SHOWN CLEARLY */}
         {/* ✅ REJECTED MESSAGE SHOWN CLEARLY WITH DETAILS */}
{isRejected && (
  <div className="text-sm text-red-400 font-semibold space-y-1">
    <p>{displayMessage}</p>

    {/* Extract student info from message if possible */}
    {(() => {
      const match = n.message.match(
        /(.*) rejected this .* request for (.*) \((.*) - (\d+) Year, Reg: (\d+)\)/
      );
      if (!match) return null;

     
      const studentName = match[2];
      const dept = match[3];
      const year = match[4];
      const reg = match[5]; 

      return (
        <div className="text-gray-300 text-xs space-y-0.5">
          <p className="font-semibold text-indigo-200">{studentName}</p>
          <p>
            {dept} • {year} Year • Reg No: {reg}
          </p>
        </div>
      );
    })()}
  </div>
)}


          {/* ✅ STUDENT INFO (ONLY FOR FORWARDED / SUBMITTED) */}
          {!isRejected && studentName && (
            <div className="text-sm text-gray-300">
              {forwarderName && (
                <p className="text-xs text-indigo-300 font-semibold">
                  Forwarded by {forwarderName}
                </p>
              )}
              <p className="font-semibold text-indigo-200">{studentName}</p>
              <p className="text-xs">
                {dept} • {year} Year • Reg No: {reg}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400">
            {new Date(n.created_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );
        })
        )}    

      </div>
    </div>
  );
};

export default StaffNotifications;
