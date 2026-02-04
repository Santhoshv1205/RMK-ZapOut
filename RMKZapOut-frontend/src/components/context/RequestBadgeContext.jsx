import { createContext, useContext, useEffect, useState } from "react";
import socket from "./socket"; // ✅ CHANGED: shared socket

const RequestBadgeContext = createContext(null);

export const RequestBadgeProvider = ({ children }) => {
  const [newRequestCount, setNewRequestCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const staffId = user?.id;

  useEffect(() => {
    if (!staffId) return;

    // ✅ CHANGED: reuse same socket
    if (!socket.connected) {
      socket.connect();
    }

    console.log("🔗 Staff socket join:", staffId);
    socket.emit("joinRoom", staffId);

    const handleNewRequest = () => {
      console.log("📥 New request for staff");
      setNewRequestCount((prev) => prev + 1);
    };

    socket.on("newRequest", handleNewRequest);

    return () => {
      socket.off("newRequest", handleNewRequest);
    };
  }, [staffId]);

  const clearRequestBadge = () => setNewRequestCount(0);

  return (
    <RequestBadgeContext.Provider
      value={{ newRequestCount, clearRequestBadge }}
    >
      {children}
    </RequestBadgeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRequestBadge = () => {
  const ctx = useContext(RequestBadgeContext);
  if (!ctx) throw new Error("useRequestBadge must be used inside RequestBadgeProvider");
  return ctx;
};
