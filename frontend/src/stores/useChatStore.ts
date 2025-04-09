import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { Message } from "@/types";
import { User } from "@/types";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
// import { useMusicState } from "./useMusicStore";
// import useUserFetchStore from "./fetchUserStore";

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
  isCalling: boolean;
  setCalling: (calling: boolean) => void;
  user: string | null;
  currentUser: any;
  fetchUsers: () => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  sendMessage: (
    recieverId: string,
    senderId: string,
    content: string,
    username: string
  ) => void;
  sendFileMessage: (
    recieverId: string,
    senderId: string,
    file: File,
    username: string
  ) => void;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  typeMessage: (message: string) => void;
  typingUsers: Set<string>;
  removeTypingUser: (userId: string) => void;
  addTypingUser: (userId: string) => void;
}

const baseURL =
  import.meta.env.MODE === "development" ? import.meta.env.VITE_BACKEND_URL : import.meta.env.VITE_BACKEND_URL;
// console.log(localStorage.getItem("token"));
const socket = io(baseURL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: localStorage.getItem("token"),
  },
});


// const { currentUser } = useUserFetchStore();
export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  isCalling: false,
  setCalling: (calling) => set({ isCalling: calling }),
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,
  user: localStorage.getItem("userId"),
  setSelectedUser: (user) => set({ selectedUser: user }),
  
  typingUsers: new Set(),

  // Add typing user
  addTypingUser: (userId) =>
    set((state) => ({ typingUsers: new Set(state.typingUsers).add(userId) })),

  removeTypingUser: (userId) =>
    set((state) => {
      const updated = new Set(state.typingUsers);
      updated.delete(userId);
      return { typingUsers: updated };
    }),
    
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data);
      set({ users: response?.data });
      // console.log("Users fetched:", response.data);
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },
  initSocket: (userId) => {
    // const userId = localStorage.getItem("userId");
    // console.log(userId); // MongoDB `_id` ko fetch karein
    if (!get().isConnected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();

      socket.on("connect", () => {
        // console.log("🔗 Socket Connected:", socket.id);
        socket.emit("user_connected", userId);
      });

      socket.on("users_online", (users: string[]) => {
        // console.log("Online Users List:", users);
        set(() => ({ onlineUsers: new Set(users) })); // ✅ Server se milne wali list ko update kar raha hai
      });

      socket.on("activities", (activities: [string, string][]) => {
        // console.log("User activities received:", activities);
        set({ userActivities: new Map(activities) });
      });

      socket.on("user_connected", (userId: string) => {
        // console.log("User connected event received:", userId);
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

      socket.on("receive_message", (message) => {
        set((state) => {
          if (
            state.selectedUser &&
            (state.selectedUser._id === message.recieverId ||
              state.selectedUser._id === message.senderId)
          ) {
            return { messages: [...state.messages, message] }; // Update chat immediately
          }
          return state; // Do nothing if the chat is not open
        });
      });

      // console.log("Message event listener added");

      socket.on("message_sent", (message: Message) => {
        set((state) => ({
          messages: Array.isArray(state.messages)
            ? [...state.messages, message]
            : [message],
        }));
      });

      socket.on("activity_updated", ({ userId, activity }) => {
        set((state) => {
          const newActivities = new Map(state.userActivities);
          newActivities.set(userId, activity);
          return { userActivities: newActivities };
        });
      });

      socket.on("message_notification", ({ message, username }) => {
        set((state) => {
          const notificationMessage = message || "📎 Sent a file";
          toast.info(
            `📩 New message from ${username}: ${notificationMessage}`,
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
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
    // console.log(recieverId, senderId, content, username);
    socket.emit("send_message", { recieverId, senderId, content, username });

    const receiverSocketId = get().onlineUsers.has(recieverId)
      ? recieverId
      : null;
    // console.log("Receiver Socket ID:", receiverSocketId);
    if (receiverSocketId) {
      // console.log("Sending message notification to receiver:", recieverId);
      socket.emit("message_notification", {
        message: content || "📎 Sent a file",
        username: username || "Buddy",
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
      // Upload file and get file URL
      const response = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = response.data.fileUrl; // Get stored file URL from backend

      // Emit socket event WITHOUT saving fileUrl again in the database
      socket.emit("send_message", {
        recieverId,
        senderId,
        username,
        fileName: file.name,
        fileType: file.type,
        fileUrl, // Use the existing fileUrl from upload response
      });

      // Notify receiver if online
      const receiverSocketId = get().onlineUsers.has(recieverId)
        ? recieverId
        : null;
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
      const response = await axiosInstance.get(`/users/messages/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      set({ messages: response.data.messages });
      // console.log('from messages',response.data);
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  typeMessage: (message: string) => {
    const socket = get().socket;
    if (!socket) return;
    socket.emit("typing", message);
  }
}));
