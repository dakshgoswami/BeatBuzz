import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";

const UsersList = () => {
  const { users, selectedUser, isLoading, setSelectedUser, onlineUsers } =
    useChatStore();
  // console.log(onlineUsers);
  // console.log(users);
  return (
    <div
      className={`border-r border-zinc-800 ${selectedUser ? "w-0" : "w-18"}`}
    >
      <div className="flex flex-col h-full">
        <ScrollArea className="h-[calc(100vh-280px)]">
          {users.length > 0 ? (
            <div className="space-y-2 p-4">
              {isLoading ? (
                <UsersListSkeleton />
              ) : (
                users.filter(user => onlineUsers.has(user._id)).map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center justify-center lg:justify-start gap-3 p-3 
										rounded-lg cursor-pointer transition-colors
                    ${
                      selectedUser?._id === user._id
                        ? "bg-zinc-800"
                        : "hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="size-8 md:size-12">
                        {user.imageUrl ? (
                          <AvatarImage
                            src={user.imageUrl}
                            style={{
                              objectFit: "cover",
                              objectPosition: "center",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        ) : (
                          <AvatarImage
                            src="/default-avatar.png"
                            style={{
                              objectFit: "cover",
                              objectPosition: "center",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        )}
                        <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                      </Avatar>
                      {/* online indicator */}
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-zinc-900
                        ${
                          onlineUsers.has(user._id)
                            ? "bg-green-500"
                            : "bg-zinc-500"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0 lg:block hidden">
                      <span className="font-medium truncate">
                        {user.username}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-[10.6rem] h-full space-y-6">
              <img
                src="/bb.png"
                alt="BeatBuzz"
                className="size-12 animate-bounce rounded-full"
              />
              <div className="text-center">
                <h3 className="text-zinc-300 text-lg font-medium mb-1 max-sm:text-xs">
                  No Online Users
                </h3>
                <p className="text-zinc-500 text-sm max-sm:text-xs">
                  Wait for users to join
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default UsersList;
