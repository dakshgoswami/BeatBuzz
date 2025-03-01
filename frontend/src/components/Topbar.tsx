import {
  SignedOut,
  SignedIn,
  SignOutButton,
  UserButton,
} from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButton from "./SignInOAuthButton.tsx";
import { useAuthStore } from "@/stores/useAuthStore.ts";
import { cn } from "@/lib/utils.ts";
import { buttonVariants } from "./ui/button.tsx";
import { IoDiamondOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import useUserFetchStore from "@/stores/fetchUserStore";
import "./Topbar.css";

const Topbar = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { isPremium } = useUserFetchStore();
  // console.log(isAdmin);
  const navigate = useNavigate();
  const handlePremiumClick = () => {
    navigate("/premium");
  };

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
      <div className="flex items-center">
        <span className="font-bold text-white">B</span>eat
        <span className="font-bold text-white">B</span>uzz
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LayoutDashboardIcon className="size-4 mr-2" />
            Admin Dashboard
          </Link>
        )}

        <button
          className={`btn-premium flex items-center justify-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-green-500 hover:text-white transition-all duration-300 ${
            isPremium ? "text-green-500" : "text-white"
          }`}
          onClick={handlePremiumClick}
        >
          {" "}
          <IoDiamondOutline className="size-4" />
          {isPremium ? "Premium User" : "Get Premium"}
        </button>

        <SignedIn>
          <SignOutButton />
        </SignedIn>

        <SignedOut>
          <SignInOAuthButton />
        </SignedOut>

        <UserButton />
      </div>
    </div>
  );
};

export default Topbar;
