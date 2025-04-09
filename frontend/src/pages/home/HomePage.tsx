import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";

import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket'],
});
const HomePage = () => {
  const { initializeQueue } = usePlayerStore();
  const {
    featuredSongs,
    trendingSongs,
    madeForYouSongs,
    isLoading,
    fetchFeaturedSongs,
    fetchTrendingSongs,
    fetchMadeForYouSongs,
  } = useMusicStore();

  useEffect(() => {
    fetchFeaturedSongs();
    fetchTrendingSongs();
    fetchMadeForYouSongs();
  }, []);

  useEffect(() => {
    if (
      madeForYouSongs.length > 0 &&
      featuredSongs.length > 0 &&
      trendingSongs.length > 0
    ) {
      const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs];
      initializeQueue(allSongs);
    }
  }, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs]);

  useEffect(() => {
    // Handle incoming socket message
    const handleMessageNotification = ({ message, username }: { message: string; username: string }) => {
      toast.info(
        `📩 New message from ${username}: ${message || "📎 Sent a file"}`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    };

    socket.on("message_notification", handleMessageNotification);

    return () => {
      // Cleanup socket listener when component unmounts
      socket.off("message_notification", handleMessageNotification);
    };
  }, []);

  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900">
      <Topbar />
      <ToastContainer />
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl max-sm:text-xl font-bold mb-6">
            Good afternoon
          </h1>
          <FeaturedSection />
          <div className="space-y-8">
            <SectionGrid
              title="Made For You"
              songs={madeForYouSongs}
              isLoading={isLoading}
            />
            <SectionGrid
              title="Trending"
              songs={trendingSongs}
              isLoading={isLoading}
            />
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default HomePage;
