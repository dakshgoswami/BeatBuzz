import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { axiosInstance } from "@/lib/axios";
const AuthCallbackPage = () => {
  const { isLoaded, user } = useUser();
  const { isSignedIn, userId } = useAuth();
  console.log(user);
  const navigate = useNavigate();
  const syncAttempted = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user || syncAttempted.current) return;
      try {
        syncAttempted.current = true;

        if (isSignedIn && user) {
          const response = await axiosInstance.post("/auth/callback", {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            emailAddresses: user.emailAddresses,
            username: user.username,
          });

          if (response.status === 200 && response.data.user) {
            console.log("User successfully synced:", response.data);
            localStorage.setItem("beatbuzzUser", JSON.stringify(response.data.user)); // ✅ Store User Data
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        }
      } catch (error) {
        console.log("Error in auth callback", error);
      }
    };

    syncUser();
  }, [isLoaded, user, navigate, isSignedIn]);
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <Card className="w-[90%] max-w-md bg-zinc-900 border-zinc-800">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Loader className="size-6 text-emerald-500 animate-spin" />
          <h3 className="text-zinc-400 text-xl font-bold">Logging you in</h3>
          <p className="text-zinc-400 text-sm">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
