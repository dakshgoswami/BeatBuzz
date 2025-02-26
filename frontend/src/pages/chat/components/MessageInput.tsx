import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { GoPaperclip } from "react-icons/go";
import { io } from "socket.io-client";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";

const MessageInput = () => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { user } = useUser();
  const { selectedUser, sendMessage, sendFileMessage } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = io("http://localhost:5000");
  console.log(user);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  const username = user?.username || "";

  const handleSend = async () => {
    if (!selectedUser || !user || (!newMessage.trim() && selectedFiles.length === 0)) return;

    if (newMessage.trim() && selectedFiles.length === 0) {
      sendMessage(selectedUser.clerkId, user.id, newMessage.trim(), username);
      // sendFileMessage(selectedUser.clerkId, user.id, selectedFiles, username);
      setNewMessage("");
    }

    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        sendFileMessage(selectedUser.clerkId, user.id, file, username);        //to send file 
      }
      setSelectedFiles([]); // Clear files after sending
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setSelectedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };

  const sendFile = async (file: File) => {
    if (!user || !selectedUser) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderId", user.id);
    formData.append("recieverId", selectedUser.clerkId);

    try {
      const response = await axios.post(`${axiosInstance}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("File upload response:", response.data);

      if (response.data.success) {
        socket.emit("file_message", {
          senderId: user.id,
          recieverId: selectedUser.clerkId,
          fileUrl: response.data.fileUrl,
          fileName: file.name,
          username: user.username,
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  return (
    <div className="p-4 mt-auto border-t border-zinc-800">
      <div className="flex gap-2 flex-row items-center">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={handleFilesChange}
          />
          <GoPaperclip
            className="size-9 text-black font-thin px-2 bg-green-700 rounded-lg cursor-pointer"
            onClick={handleFileSelect}
          />
        </div>
        <Input
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="bg-zinc-800 border-none"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!newMessage.trim() && selectedFiles.length === 0}
        >
          <Send className="size-4" />
        </Button>
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-2 text-white text-sm">
          <p>Files ready to send:</p>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
