import { Outlet } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import LeftSidebar from "./components/LeftSidebar";
import AudioPlayer from "./components/AudioPlayer";
import FriendsActivity from "./components/FriendsActivity";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserFetchStore from "@/stores/fetchUserStore";
import { useChatStore } from "@/stores/useChatStore";
// import { useAuth } from "@clerk/clerk-react";
const Mainlayout = () => {
  const { isPremium, showAd, setShowAd } = useUserFetchStore();
  const { selectedUser } = useChatStore();
  // console.log("isPremium", isPremium);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  // const { getToken } = useAuth(); // Get token inside component
  const token = localStorage.getItem("token");
  const fetchUser = useUserFetchStore((state) => state.fetchUser);

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        fetchUser(token); // Pass token to Zustand function
      }
    };

    fetchData();
  }, [token, fetchUser]);

  useEffect(() => {
    if (!isPremium && token) {
      const interval = setInterval(() => {
        setShowAd(true);
      }, 60000); // Show ad every 60 seconds

      return () => clearInterval(interval);
    }
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isPremium, setShowAd]);

  return (
    <>
      <div className="relative h-screen w-screen bg-black text-white">
        {/* Ad Overlay - Only for Non-Premium Users */}
        {showAd && !isPremium && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center justify-between max-sm:w-2/3 w-1/3 relative">
              <div>
                <img src="/ad.jpg" alt="" />
                <button
                  className="ml-4 text-red-500 hover:text-red-700 absolute right-5 top-5"
                  onClick={() => setShowAd(false)}
                >
                  ✖
                </button>
              </div>
              <div className="flex justify-center flex-col items-center mt-4">
                <span className="text-white text-sm max-sm:text-xs text-center">
                  🚀 Special Offer! Get Premium Now
                </span>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 max-sm:px-2 max-sm:text-sm"
                  onClick={() => navigate("/premium")}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout - Disabled When Ad is Active */}
        <div
          className={`flex flex-col h-full transition-opacity duration-300 ${
            showAd ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 flex h-full overflow-hidden p-2"
          >
            <AudioPlayer />
            {/* left sidebar */}
            <ResizablePanel
              defaultSize={16}
              minSize={isMobile ? 0 : 0}
              maxSize={20}
              className={`max-sm:max-w-[60px] ${
                selectedUser ? "hidden" : "block"
              } duration-700 transition-transform`}
            >
              <LeftSidebar />
            </ResizablePanel>
            <ResizableHandle className="bg-black w-2 rounded-lg transition-colors" />
            {/* main content */}
            <ResizablePanel defaultSize={isMobile ? 80 : 60}>
              <Outlet />
            </ResizablePanel>
            {!isMobile && (
              <>
                <ResizableHandle className="w-2 bg-black rounded-lg transition-colors max-sm:hidden" />
                {/* right sidebar */}
                <ResizablePanel
                  defaultSize={20}
                  minSize={0}
                  maxSize={25}
                  collapsedSize={0}
                  className="max-sm:hidden"
                >
                  <FriendsActivity />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
          <PlaybackControls />
        </div>
      </div>
    </>
  );
};

export default Mainlayout;
