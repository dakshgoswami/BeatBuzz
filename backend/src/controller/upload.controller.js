import path from "path";
import fs from "fs";
import Message from "../models/message.model.js";

const __dirname = path.resolve();
const userSockets = new Map(); // { userId: socketId}

 const uploadFile = (io) => async (req, res, next) => {  // Accept io here
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.files.file;
        const uploadDir = path.join(__dirname, "uploads");

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, file.name);

        // Move file to uploads directory
        file.mv(uploadPath, async (err) => {
            if (err) {
                return res.status(500).json({ message: "File upload failed", error: err });
            }

            // Save file message in the database (Only One Time)
            const newMessage = {
                senderId: req.body.senderId,
                recieverId: req.body.recieverId,
                fileUrl: `http://localhost:5000/uploads/${file.name}`,
                fileType: file.mimetype,
                content: req.body.content,
            };

            // ✅ Emit socket event after saving the file
            const receiverSocketId = userSockets.get(req.body.recieverId);
            if (receiverSocketId) {
                io.to(req.body.recieverId).emit("receive_message", newMessage);
            }

            res.status(200).json({
                message: "File uploaded successfully",
                fileUrl: newMessage.fileUrl,
                fileType: newMessage.fileType,
                savedMessage: newMessage, // Return full saved message
            });
        });
    } catch (error) {
        next(error);
    }
};

export default uploadFile;  // Export the function