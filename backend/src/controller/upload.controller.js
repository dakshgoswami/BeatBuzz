import path from "path";
import fs from "fs";
import Message from "../models/message.model.js";

const __dirname = path.resolve();

export const uploadFile = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = req.files.file;
        const uploadDir = path.join(__dirname, "uploads");

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, file.name);

        // Move file to uploads directory
        file.mv(uploadPath, async (err) => {
            if (err) {
                return res.status(500).json({ message: "File upload failed", error: err });
            }

            // Save the message with file URL
            const newMessage = new Message({
                senderId: req.auth.userId,
                recieverId: req.body.recieverId,
                fileUrl: `http://localhost:5000/uploads/${file.name}`, // Fixed URL path
                fileType: file.mimetype,
            });

            await newMessage.save();

            res.status(200).json({
                message: "File uploaded successfully",
                fileUrl: newMessage.fileUrl,
                fileType: newMessage.fileType,
            });
        });
    } catch (error) {
        next(error);
    }
};

export default uploadFile;
