import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";
import { IoIosArrowBack } from "react-icons/io";
import { useEffect } from "react";

const ChatHeader = () => {
  const {
    selectedUser,
    onlineUsers,
    setSelectedUser,
    socket,
    typingUsers,
    addTypingUser,
  } = useChatStore();
  console.log("Selected user:", selectedUser);
  if (!selectedUser) return null;

  const isTyping = typingUsers.has(selectedUser._id);
  const isOnline = onlineUsers.has(String(selectedUser._id));

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (userId: string) => {
      if (userId === selectedUser._id) {
        addTypingUser(userId);
      }
    };

    const handleUserStoppedTyping = (userId: string) => {
      if (userId === selectedUser._id) {
        useChatStore.getState().removeTypingUser(userId);
      }
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping); // cleanup
    };
  }, [socket, selectedUser._id]);

  return (
    <div className="p-4 border-b border-zinc-800">
      <div className="flex items-center gap-3 relative">
        <Avatar>
          {
            selectedUser.imageUrl ? (
              <AvatarImage
            src={selectedUser.imageUrl}
            className="size-12"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              width: "100%",
              height: "100%",
            }}
          />
            ):(
              <AvatarImage
            src="/default-avatar.png"
            className="size-12"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              width: "100%",
              height: "100%",
            }}
          />
            )
          }
          <AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{selectedUser.username}</h2>
          <p className="text-sm text-zinc-400">
            {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
          </p>
        </div>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-zinc-800 rounded-full px-3 py-3 hover:bg-zinc-700 transition-colors"
          onClick={() => {
            setSelectedUser(null);
          }}
        >
          <IoIosArrowBack className="text-zinc-400 hover:text-zinc-300 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;