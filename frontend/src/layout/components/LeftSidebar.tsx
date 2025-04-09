import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
// import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";
// import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";
import { FaRegUser } from "react-icons/fa";
// import { CgMenuGridO } from "react-icons/cg";
import { LayoutDashboardIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore.ts";
import { IoDiamondOutline } from "react-icons/io5";

const LeftSidebar = () => {
  const { albums, isLoading, fetchAlbums } = useMusicStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const user = localStorage.getItem("token");
  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // console.log(albums);

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Navigation links */}
      <div className="rounded-lg bg-zinc-900 p-4 max-sm:p-2 flex flex-col justify-center items-center">
        <div className="space-y-3 w-full text-lg">
          <Link
            to="/"
            className={
              "w-full p-2 flex gap-2 justify-start items-center max-sm:justify-center text-white hover:bg-zinc-800"
            }
          >
            <HomeIcon className="size-5 max-sm:size-5 lg:size-7" />{" "}
            <span className="max-sm:hidden md:text-sm lg:text-xl">Home</span>
          </Link>

          {user && (
            <Link
              to="/chat"
              className={
                "w-full p-2 flex gap-2 justify-start items-center max-sm:justify-center text-white hover:bg-zinc-800"
              }
            >
              <MessageCircle className="size-5 max-sm:size-5 md:size-6 lg:size-7 w-full" />{" "}
              <span className="max-sm:hidden md:text-sm lg:text-xl">
                Messages
              </span>
            </Link>
          )}

          {user && (
            <Link
              to="/myprofile"
              className={
                "w-full p-2 flex gap-2 justify-start items-center max-sm:justify-center text-white hover:bg-zinc-800"
              }
            >
              <FaRegUser className="size-5 max-sm:size-5 lg:size-7" />
              <span className="max-sm:hidden md:text-sm lg:text-xl">
                My Profile
              </span>
            </Link>
          )}

          {user && (
            <Link
              to="/premium"
              className={
                "w-full p-2 flex gap-2 justify-start items-center max-sm:justify-center text-white hover:bg-zinc-800"
              }
            >
              <IoDiamondOutline className="size-5 max-sm:size-5 md:size-6 lg:size-7" />
              <span className="max-sm:hidden md:text-sm lg:text-xl">
                Premium
              </span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="w-full p-2 flex gap-2 max-sm:mt-[14px] max-sm:mb-2 justify-start max-sm:justify-center hover:bg-zinc-800 text-white"
            >
              <LayoutDashboardIcon className="size-5 max-sm:size-5 lg:size-7" />
              <span className="max-sm:hidden md:text-sm lg:text-xl">
                Dashboard
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Library links */}
      <div className="flex-1 rounded-lg bg-zinc-900 p-4 max-sm:px-2 max-sm:flex-col items-center justify-center">
        <div className="flex items-center max-sm:justify-center mb-4">
          <div className="flex items-center max-sm:justify-center gap-2 text-white px-2">
            <Library className="size-5 max-sm:size-5 lg:size-7" />
            <span className="hidden md:inline max-sm:hidden md:text-sm lg:text-xl text-xl">
              Playlists
            </span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-500px)] max-sm:h-[calc(100vh-420px)] md:h-[calc(100vh-470px)] lg:h-[calc(100vh-500px)]">
          <div className="space-y-2 max-sm:space-y-4">
            {isLoading ? (
              <PlaylistSkeleton />
            ) : (
              albums.map((album: any) => (
                <Link
                  key={album._id}
                  to={`/albums/${album._id}`}
                  className="p-2 max-sm:p-0 hover:bg-zinc-800 rounded-md flex items-center md:flex-col lg:flex-row md:items-start justify-center gap-3 group cursor-pointer"
                >
                  <img
                    src={album.imageUrl}
                    alt="Playlist image"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    className="size-12 rouded-md flex-shrink-0 object-cover max-sm:size-15 lg:size-18"
                  />
                  <div className="flex-1 min-w-0 hidden md:block max-sm:hidden">
                    <p className="font-medium truncate md:text-[10px] lg:text-base">
                      {album.title}
                    </p>
                    <p className="text-zinc-400 text-xs md:text-[10px]  lg:text-sm truncate">
                      {album.artist}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSidebar;
