import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import { io } from "socket.io-client";
import multer from "multer";
import path from "path";

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
      origin: "http://localhost:3001",
      credentials: true,
    },
  });

  const userSockets = new Map(); // { userId: socketId}
  const userActivities = new Map(); // { userId: activity }

  io.on("connection", (socket) => {
    socket.on("user_connected", (userId) => {
      userSockets.set(userId, socket.id);
      userActivities.set(userId, "Idle");

      // Notify all users that this user is online
      io.emit("user_connected", userId);
      socket.emit("users_online", Array.from(userSockets.keys()));

      // Send user activity updates
      io.emit("activities", Array.from(userActivities.entries()));
    });

    socket.on("update_activity", ({ userId, activity }) => {
      //   console.log("Activity updated", userId, activity);
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });

    // Handle sending messages with or without files
    socket.on("send_message", async (data) => {
      try {
        const { senderId, recieverId, content, fileName, fileType, username } =
          data;
        console.log("Message received from socket", data);
        // Check if senderId exists
        if (!senderId) {
          throw new Error("senderId is required");
        }

        // Check if recieverId exists
        if (!recieverId) {
          throw new Error("recieverId is required");
        }
        let fileUrl = null;
        if (fileName) {
          fileUrl = `/uploads/${fileName}`;
        }

        // console.log("Message received from socket", data);

        const message = await Message.create({
          senderId,
          recieverId,
          content,
          fileUrl,
          fileType,
        });

        // Send to receiver in real-time, if online
        const receiverSocketId = userSockets.get(recieverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);

          socket.on("receive_message", (message) => {
            console.log("Received message:", message);
            if (message.fileUrl) {
              console.log("File URL received:", message.fileUrl);
            }
          });

          // Send notification to the receiver
          io.to(receiverSocketId).emit("message_notification", {
            username: username,
            message: content || "📎 Sent a file", // Show text or file alert
          });
        }

        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("message_error", error.message);
      }
    });

    // Handle file upload separately
    socket.on("upload_file", async (data, callback) => {
      try {
        console.log("File upload event triggered:", data);

        const { senderId, recieverId, file, fileName, fileType } = data;
        if (!file || !fileName) {
          throw new Error("No file data received.");
        }

        const filePath = `uploads/${Date.now()}_${fileName}`;
        const buffer = Buffer.from(file, "base64");

        require("fs").writeFileSync(filePath, buffer);

        console.log("File successfully saved at:", filePath);

        const message = await Message.create({
          senderId,
          recieverId,
          content: "",
          fileUrl: `/${filePath}`,
          fileType,
        });

        const receiverSocketId = userSockets.get(recieverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("file_uploaded", message);
        callback({ status: "success", fileUrl: `/${filePath}` });
      } catch (error) {
        console.error("File upload error:", error);
        callback({ status: "error", message: error.message });
      }
    });

    socket.on("typing", (data) => {
      const receiverSocketId = userSockets.get(data.recieverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", data);
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUserId;
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          userActivities.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit("user_disconnected", disconnectedUserId);
      }
    });
  });
};
