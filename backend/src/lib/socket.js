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
      origin: "http://localhost:3001",
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

    socket.on("update_activity", ({ activity }) => {
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
        io.emit("activity_updated", { userId, activity });
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
    
    // // Handle file upload separately
    // socket.on("upload_file", async (data, callback) => {
    //   try {
    //     console.log("File upload event triggered:", data);

    //     const { senderId, recieverId, file, fileName, fileType, username } =
    //       data;
    //     if (!file || !fileName) {
    //       throw new Error("No file data received.");
    //     }

    //     const filePath = `uploads/${fileName}`;
    //     // const buffer = Buffer.from(file, "base64");

    //     require("fs").writeFileSync(filePath, file);

    //     console.log("File successfully saved at:", filePath);

    //     const message = await Message.create({
    //       senderId,
    //       recieverId,
    //       fileUrl: `/${filePath}`,
    //       fileType,
    //       username,
    //     });

    //     const receiverSocketId = userSockets.get(recieverId);
    //     if (receiverSocketId) {
    //       io.to(receiverSocketId).emit("receive_message", message);
    //     }

    //     socket.emit("file_uploaded", message);
    //     callback({ status: "success", fileUrl: `/${filePath}` });
    //   } catch (error) {
    //     console.error("File upload error:", error);
    //     callback({ status: "error", message: error.message });
    //   }
    // });

    socket.on("typing", (data) => {
      const receiverSocketId = userSockets.get(data.recieverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", data);
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
