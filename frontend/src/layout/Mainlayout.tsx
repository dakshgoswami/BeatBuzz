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

const Mainlayout = () => {
  const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);  
  
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <ResizablePanelGroup direction="horizontal" className="flex-1 flex h-full overflow-hidden p-2">
        <AudioPlayer />
        {/* left sidebar */}
        <ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30}> <LeftSidebar /></ResizablePanel>
        <ResizableHandle className="bg-black w-2 rounded-lg transition-colors"/>
        {/* main content */}
        <ResizablePanel defaultSize={isMobile ? 80 : 60}><Outlet /></ResizablePanel>
        {!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

						{/* right sidebar */}
						<ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
							<FriendsActivity />
						</ResizablePanel>
					</>
				)}
      </ResizablePanelGroup>
      <PlaybackControls />
    </div>
  );
};

export default Mainlayout;
