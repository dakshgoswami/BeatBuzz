import { useMusicStore } from "@/stores/useMusicStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import PlayButton from "./PlayButton";
import { MdDownload } from "react-icons/md";
import useUserFetchStore from "@/stores/fetchUserStore";

const FeaturedSection = () => {
  const { isLoading, featuredSongs, error } = useMusicStore();
  const { currentUser } = useUserFetchStore();

  if (isLoading) return <FeaturedGridSkeleton />;

  if (error) return <p className="text-red-500 mb-4 text-lg">{error}</p>;

  const handleDownload = ({ fileUrl, fileName }: { fileUrl: string; fileName?: string }) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "song.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {featuredSongs.map((song) => (
        <div
          key={song._id}
          className="flex items-center bg-zinc-800/50 rounded-md overflow-hidden
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative"
        >
          <div className="imgDown relative flex-shrink-0">
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-16 sm:w-20 h-16 sm:h-20 object-cover flex-shrink-0"
            />
            {currentUser?.isPremiumUser === true && (
              <button
                className="downloadBtn opacity-0 hover:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-zinc-800/50 rounded-full hover:bg-zinc-800 "
                onClick={() =>
                  handleDownload({
                    fileUrl: song.audioUrl,
                    fileName: song.title,
                  })
                }
              >
                <MdDownload />
              </button>
            )}
          </div>
          <div className="flex-1 p-4">
            <p className="font-medium truncate max-sm:text-base">
              {song.title}
            </p>
            <p className="text-sm text-zinc-400 truncate max-sm:text-xs">
              {song.artist}
            </p>
          </div>
          <PlayButton song={song} />
        </div>
      ))}
    </div>
  );
};
export default FeaturedSection;
