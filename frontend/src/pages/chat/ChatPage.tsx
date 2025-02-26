import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:5000");

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatPage = () => {
  const { user } = useUser();
  const { messages, selectedUser, fetchUsers, fetchMessages } = useChatStore();
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchUsers();
  }, [fetchUsers, user]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.clerkId);
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    socket.on("message_notification", (notification) => {
      toast.info(`📩 New message: ${notification.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });
    return () => {
      socket.off("message_notification");
    };
  }, []);

  return (
    <main className="h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden">
      <Topbar />
      <ToastContainer />
      <div className="grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-180px)]">
        <UsersList />
        <div className="flex flex-col h-full">
          {selectedUser ? (
            <>
              <ChatHeader />
              <ScrollArea className="h-[calc(100vh-340px)] overflow-y-auto">
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    console.log(message),
                    <div
                      key={message._id}
                      ref={index === messages.length - 1 ? lastMessageRef : null}
                      className={`flex items-start gap-3 ${message.senderId === user?.id ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="size-8">
                        <AvatarImage
                          src={
                            message.senderId === user?.id
                              ? user.imageUrl
                              : selectedUser.imageUrl
                          }
                        />
                      </Avatar>

                      <div className={`rounded-lg p-3 max-w-[70%] ${message.senderId === user?.id ? "bg-green-500" : "bg-zinc-800"}`}>
                      {message.content && !message.fileUrl && <p className="text-sm">{message.content}</p>}
                      {message.fileUrl && (
                          <div className="mt-2">
                            {message.fileType?.startsWith("image") ? (
                              <img src={message.fileUrl} alt="Sent file" className="max-w-xs rounded-lg" />
                            ) : message.fileType?.startsWith("video") ? (
                              <video controls className="max-w-xs rounded-lg">
                                <source src={message.fileUrl} type={message.fileType} />
                              </video>
                            ) : (
                              <a
                                href={message.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 underline"
                              >
                                Download file
                              </a>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-zinc-300 mt-1 block">{formatTime(message.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <MessageInput />
            </>
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>
    </main>
  );
};

export default ChatPage;

const NoConversationPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-6">
    <img src="/bb.png" alt="BeatBuzz" className="size-12 animate-bounce rounded-full" />
    <div className="text-center">
      <h3 className="text-zinc-300 text-lg font-medium mb-1">No conversation selected</h3>
      <p className="text-zinc-500 text-sm">Choose a friend to start chatting</p>
    </div>
  </div>
);
