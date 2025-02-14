import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";

const LeftSidebar = () => {

const { albums, isLoading, fetchAlbums} = useMusicStore();

useEffect(() => {
    fetchAlbums();
}, [fetchAlbums]);

// console.log(albums);

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Navigation links */}
      <div className="rounded-lg bg-zinc-900 p-4">
        <div className="space-y-2">
          <Link
            to="/"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-start text-white hover:bg-zinc-800",
              })
            )}
          >
            <HomeIcon className="mr-2 size-5" /> <span>Home</span>
          </Link>

          <SignedIn>
            <Link
              to="/chat"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className:
                    "w-full justify-start text-white hover:bg-zinc-800",
                })
              )}
            >
              <MessageCircle className="mr-2 size-5" /> <span>Messages</span>
            </Link>
          </SignedIn>
        </div>
      </div>
      {/* Library links */}
      <div className="flex-1 rounded-lg bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-white px-2">
            <Library className="mr-2 size-5" />
            <span className="hidden md:inline">Playlists</span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2">
            {isLoading ? <PlaylistSkeleton /> : (
              albums.map((album: any) => (
                <Link
                  key={album._id}
                  to={`/albums/${album._id}`}
                  className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer"
                >
                    <img src={album.imageUrl} alt="Playlist image" className="size-12 rouded-md flex-shrink-0 object-cover"/>
                  <div className="flex-1 min-w-0 hidden md:block">
                    <p className="font-medium truncate">{album.title}</p>
                    <p className="text-zinc-400 text-sm truncate">{album.artist}</p>
                  </div>
                </Link>
            )))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSidebar;
