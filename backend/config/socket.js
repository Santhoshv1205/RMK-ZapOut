import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (userId) => {
      // ✅ CHANGED: guard null / undefined
      if (!userId) return;

      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
