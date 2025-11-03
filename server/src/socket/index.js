import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: \${socket.id}`);

    // Join user to their personal room
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user:\${userId}`);
      console.log(`User \${userId} joined their room`);
    }

    socket.on("disconnect", () => {
      console.log(`User disconnected: \${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Helper function to send notification to specific user
export const sendNotificationToUser = (userId, eventName, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(eventName, data);
  }
};

// Helper function to send notification to all users
export const broadcastNotification = (eventName, data) => {
  if (io) {
    io.emit(eventName, data);
  }
};
