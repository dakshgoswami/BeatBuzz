import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { Message } from "@/types";
import { User } from "@/types";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

interface ChatStore {
  users: any[];
  isLoading: boolean;
  error: string | null;
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Message[];
  selectedUser: User | null;

  fetchUsers: () => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (recieverId: string, senderId: string, content: string, username: string) => void;
  sendFileMessage: (recieverId: string, senderId: string, file: File, username: string) => void;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, {
  autoConnect: false,
  withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,

  setSelectedUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users");
      set({ users: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  initSocket: (userId) => {
    if (!get().isConnected) {
      socket.auth = { userId };
      socket.connect();

      socket.emit("user_connected", userId);

      socket.on("users_online", (users: string[]) => {
        set({ onlineUsers: new Set(users) });
      });

      socket.on("activities", (activities: [string, string][]) => {
        set({ userActivities: new Map(activities) });
      });

      socket.on("user_connected", (userId: string) => {
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, userId]),
        }));
      });

      socket.on("user_disconnected", (userId: string) => {
        set((state) => {
          const newOnlineUsers = new Set(state.onlineUsers);
          newOnlineUsers.delete(userId);
          return { onlineUsers: newOnlineUsers };
        });
      });

      socket.on("receive_message", (message: Message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      socket.on("message_sent", (message: Message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      socket.on("activity_updated", ({ userId, activity }) => {
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(userId, activity);
          return { userActivities: newActivities };
        });
      });

      socket.on("message_notification", ({ username, message }) => {
        set((state) => {
          const notificationMessage = message || "📎 Sent a file";
          toast.info(`📩 New message from ${username}: ${notificationMessage}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return state;
        });
      });

      set({ isConnected: true });
    }
  },

  disconnectSocket: () => {
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false });
    }
  },

  sendMessage: async (recieverId, senderId, content, username) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit("send_message", { recieverId, senderId, content, username });

    const receiverSocketId = get().onlineUsers.has(recieverId) ? recieverId : null;
    if (receiverSocketId) {
      socket.emit("message_notification", {
        username,
        message: content || "📎 Sent a file",
      });
    }
  },

  sendFileMessage: async (recieverId, senderId, file, username) => {
    const socket = get().socket;
    if (!socket) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderId", senderId);
    formData.append("recieverId", recieverId);

    try {
      const response = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = response.data.fileUrl;
      socket.emit("send_message", {
        recieverId,
        senderId,
        content: fileUrl,
        username,
        fileName: file.name,
        fileType: file.type,
      });

      const receiverSocketId = get().onlineUsers.has(recieverId) ? recieverId : null;
      if (receiverSocketId) {
        socket.emit("message_notification", {
          username,
          message: "📎 Sent a file",
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file.");
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/users/messages/${userId}`);
      set({ messages: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));

