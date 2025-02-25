import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
            required: true,
        },
        recieverId: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: false, // Content is now optional since messages can be files.
        },
        fileUrl: {
            type: String,
            required: false, // Optional field for storing file paths.
        },
        fileType: {
            type: String,
            required: false, // Helps in identifying if the file is an image, video, document, etc.
        },
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
export default Message;
