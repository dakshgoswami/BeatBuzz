// import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
// import SignInOAuthButton from "./SignInOAuthButton.tsx";
import { useAuthStore } from "@/stores/useAuthStore.ts";
// import { cn } from "@/lib/utils.ts";
// import { buttonVariants } from "./ui/button.tsx";
// import { IoDiamondOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import useUserFetchStore from "@/stores/fetchUserStore";
// import "./Topbar.css";
import { useEffect } from "react";
import { isTokenExpired } from "@/lib/utils"; // Update the path to the correct location

const Topbar = () => {
  // const isAdmin = useAuthStore((state) => state.isAdmin);
  const checkAdminStatus = useAuthStore((state) => state.checkAdminStatus); // Get function from store
  const { fetchCurrentUser, currentUser, setCurrentUser } =
    useUserFetchStore();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  // const handlePremiumClick = () => {
  //   navigate("/premium");
  // };
  // console.log("Current User:", currentUser);
  useEffect(() => {
    if (token) {
      const checkAdmin = async () => {
        await checkAdminStatus();
      };
      checkAdmin();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    }
  }, [token, fetchCurrentUser]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("token"); // Remove expired token
        navigate("/"); // Redirect to login page
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [navigate]);
  // console.log("Current User:", currentUser);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/");
  };
  return (
    <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
      <div className="flex flex-col items-start justify-center">
        <div className="flex items-center max-sm:text-sm text-xl">
          <span className="font-bold text-white">B</span>eat
          <span className="font-bold text-white">B</span>uzz
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* {isAdmin && (
          <Link
            to="/admin"
            className="flex  max-sm:hidden items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded font-semibold max-sm:py-1 max-sm:px-3"
          >
            <LayoutDashboardIcon className="size-4 mr-2" />
            Admin Dashboard
          </Link>
        )} */}

        {/* {token && (<button
          className={`btn-premium w-full flex items-center justify-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-green-500 hover:text-white transition-all duration-300 ${
            isPremium ? "text-green-500" : "text-white"
          } max-sm:hidden`}
          onClick={handlePremiumClick}
        >
          {" "}
          <IoDiamondOutline className="size-5" />
          {isPremium ? "Premium Member" : "Go Premium"}
        </button>)} */}

        {/* <SignedIn>
          <SignOutButton />
        </SignedIn>

        <SignedOut>
          <SignInOAuthButton />
        </SignedOut> */}

        <p className="text-[1rem] font-thin max-sm:hidden">
          Hello, {currentUser?._id ? currentUser.username : "Buddy"}
        </p>
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold max-sm:py-1 max-sm:px-3"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold max-sm:py-1 max-sm:px-3"
          >
            Login
          </Link>
        )}
        {/* <UserButton /> */}
      </div>
    </div>
  );
};

export default Topbar;
