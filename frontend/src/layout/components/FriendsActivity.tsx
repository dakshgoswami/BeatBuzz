import { HeadphonesIcon, Music, Users } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
// import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router";

const FriendsActivity = () => {
  const { users, fetchUsers, onlineUsers, userActivities, setSelectedUser } =
    useChatStore();
  const navigate = useNavigate();
  // console.log(users);
  const user = localStorage.getItem("token");
  useEffect(() => {
    if (user) fetchUsers();
  }, [fetchUsers, user]);
  
  useEffect(() => {
    // console.log("Online users updated:", onlineUsers);
  }, [onlineUsers]);

  return (
    <div className="h-full bg-zinc-900 rounded-lg flex flex-col">
      <div className="p-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="size-5 shrink-0" />
          <h2 className="font-semibold">What they're listening to</h2>
        </div>
      </div>

      {!user && <LoginPrompt />}

      <ScrollArea className="flex-1">
       {users.length > 0 ? (
          <div className="p-4 space-y-4">
          {users.map((user) => {
            // console.log(user);
            const activity = userActivities.get(user._id);
            // console.log(userActivities);
            const isPlaying = activity && activity !== "Idle";
            return (
              <div
                key={user._id}
                className="p-3 cursor-pointer hover:bg-zinc-800/50 rounded-md trsnsition-colors group"
                onClick={() => (setSelectedUser(user), navigate("/chat"))}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex items-center gap-3">
                    <Avatar className="size-10 border border-zinc-800 flex relative overflow-hidden rounded-full">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user.fullName}
                        className="object-cover rounded-full size-10"
                        style={{ objectFit: "cover", objectPosition: "center" }}
                      />
                      <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900  ${
                        onlineUsers.has(user._id)
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">
                        {user.username}
                      </span>
                      {isPlaying && (
                        <Music className="size-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    {isPlaying ? (
                      <div className="mt-1">
                        <div className="mt-1 text-sm text-white font-medium truncate">
                          {activity.replace("Playing ", "").split(" by ")[0]}
                        </div>
                        <div className="text-xs text-zinc-400 truncate">
                          {activity.split(" by ")[1]}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-zinc-400">Idle</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
       ):(
        <div className="flex flex-col items-center justify-center mt-[14.5rem] h-full space-y-6">
							<img
								src="/bb.png"
								alt="BeatBuzz"
								className="size-12 animate-bounce rounded-full"
							/>
							<div className="text-center">
								<h3 className="text-zinc-300 text-lg font-medium mb-1">
									No Online Users
								</h3>
								<p className="text-zinc-500 text-sm">Wait for users to join</p>
							</div>
						</div>
       )}
      </ScrollArea>
    </div>
  );
};

export default FriendsActivity;

const LoginPrompt = () => (
  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
    <div className="relative">
      <div
        className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur-lg
       opacity-75 animate-pulse"
        aria-hidden="true"
      />
      <div className="relative bg-zinc-900 rounded-full p-4">
        <HeadphonesIcon className="size-8 text-emerald-400" />
      </div>
    </div>

    <div className="space-y-2 max-w-[250px]">
      <h3 className="text-lg font-semibold text-white">
        See What Friends Are Playing
      </h3>
      <p className="text-sm text-zinc-400">
        Login to discover what music your friends are enjoying right now
      </p>
    </div>
  </div>
);
