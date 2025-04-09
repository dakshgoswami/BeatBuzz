import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import { io } from "socket.io-client";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
export const socket = io("http://localhost:5000");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://beat-buzz-flax.vercel.app/",
      credentials: true,
    },
  });
  const userSockets = new Map(); // { userId: socketId}
  const userActivities = new Map(); // { userId: activity }

  io.on("connection", (socket) => {
    // console.log("Socket connected:", socket.id);
    socket.on("user_connected", () => {
      try {
        const token = socket.handshake.auth?.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // ✅ Ensure multiple sockets per user
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }

        // ✅ Remove old socket IDs before adding a new one (to prevent memory leaks)
        userSockets.get(userId).delete(socket.id);
        userSockets.get(userId).add(socket.id);

        // console.log("🟢 User connected:", userId, "Sockets:", [...userSockets.get(userId)]);
        io.emit("users_online", Array.from(userSockets.keys()));
      } catch (error) {
        console.error("❌ Authentication Error:", error.message);
        socket.disconnect();
      }
    });

    socket.on("update_activity", ({ activity, currentSongId }) => {
      try {
        const token = socket.handshake.auth?.token;
        let decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId;
        // Ensure multiple sockets per user
        if (!userSockets.has(userId)) {
          // userSockets.set(userId, new Set());
          userActivities.set(userId, activity);
        }

        // console.log("Activity updated", userId, activity);
        io.emit("activity_updated", { userId, activity, currentSongId });
      } catch (error) {
        console.error("❌ Socket Error:", error.message);
        socket.disconnect();
      }
    });

    // Handle sending messages with or without files
    socket.on("send_message", async (data) => {
      try {
        const { senderId, recieverId, content, fileUrl, fileType, username } =
          data;
        // console.log("📩 Backend received message:", data);

        if (!senderId || !recieverId) {
          console.error("❌ senderId or recieverId missing");
          return;
        }

        const message = await Message.create({
          senderId,
          recieverId,
          content,
          fileUrl,
          fileType,
        });

        io.to(socket.id).emit("receive_message", message);

        const receiverSocketIds = userSockets.get(recieverId) || new Set();
        receiverSocketIds.forEach((socketId) => {
          io.to(socketId).emit("receive_message", message);
          io.to(socketId).emit("message_notification", {
            message: content || "📎 Sent a file",
            username: username || "Buddy",
          });
        });

        // socket.emit("message_notification", {
        //   message: content || "📎 Sent a file",
        //   username: username || "Buddy",
        // });
      } catch (error) {
        console.error("❌ Message error:", error);
        socket.emit("message_error", error.message);
      }
    });

    // Server.js
    socket.on("typing", ({ userId, recieverId }) => {
      const receiverSocketId = userSockets.get(recieverId);
      // console.log(`User ${userId} is typing... to ${recieverId}`);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { userId });
      }
    });

    socket.on("stopTyping", ({ userId, recieverId }) => {
      const receiverSocketId = userSockets.get(recieverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { userId });
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sockets] of userSockets.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(userId);
          }
          break;
        }
      }

      // console.log("🚪 User Disconnected:", socket.id);
      io.emit("users_online", Array.from(userSockets.keys()));
    });
  });
};

export default io;
