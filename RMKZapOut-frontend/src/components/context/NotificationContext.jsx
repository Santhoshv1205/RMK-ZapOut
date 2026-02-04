import { createContext, useContext, useEffect, useState } from "react";
import notificationService from "../../services/notificationService.jsx";
import socket from "./socket.js"; // ✅ USE SHARED SOCKET

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    // 🔌 CONNECT SOCKET ONCE
    if (!socket.connected) {
      socket.connect();
    }

    // ✅ JOIN STUDENT ROOM
    socket.emit("joinRoom", userId);
    console.log("🔗 Student joined room:", userId);

    // 📥 INITIAL FETCH
    notificationService.getNotifications(userId).then((res) => {
      setNotifications(res.data);
    });

    // 📡 REAL-TIME LISTENER
    const handleNewNotification = (notification) => {
      console.log("📩 Student received notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
      // ❌ DO NOT disconnect socket here (used globally)
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
  };

  const markAllRead = async () => {
    await notificationService.markAllAsRead(userId);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: 1 }))
    );
  };

  const clearAll = async () => {
    await notificationService.clearAll(userId);
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return ctx;
};
