import { Song } from "@/types";
// import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
// import PlayButton from "./PlayButton";
import { MdDownload } from "react-icons/md";
import useUserFetchStore from "@/stores/fetchUserStore";
type SectionGridProps = {
  title: string;
  songs: Song[];
  isLoading: boolean;
};
const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
  // if (isLoading) return <SectionGridSkeleton />;
  const { currentUser } = useUserFetchStore();
  const handleDownload = ({ fileUrl, fileName }) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "song.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 max-sm:flex-col max-sm:items-start">
        <h2 className="text-xl max-sm:text-2xl font-bold">{title}</h2>
        <Button
          variant="link"
          className="text-sm text-zinc-400 hover:text-white max-sm:-ml-[14px]"
        >
          Show all
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {songs.map((song) => (
          <div
            key={song._id}
            className="bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer"
          >
            <div className="relative mb-4">
              <div className="aspect-square rounded-md shadow-lg overflow-hidden">
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-300 
									group-hover:scale-105"
                />
                {currentUser?.isPremiumUser === true && (
					<button
					className="absolute top-2 right-2 p-2 bg-zinc-800/50 rounded-full hover:bg-zinc-800 "
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
              <PlayButton song={song} />
            </div>
            <h3 className="font-medium mb-2 truncate">{song.title}</h3>
            <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SectionGrid;
