import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { useAuth } from "../hooks/useAuth"; // Assume you have an auth hook
import useUserFetchStore from "@/stores/fetchUserStore"; // Custom hook to fetch user data
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
const MyProfile = () => {
  const { currentUser, fetchCurrentUser } = useUserFetchStore(); // Fetch logged-in user data
  console.log("Current User:", currentUser); // Debugging line to check the fetched user data
  useEffect(() => {
    fetchCurrentUser();
  }, []);
  const navigate = useNavigate(); // For navigation
  const handleEditProfile = () => {
    navigate("/editprofile"); // Navigate to the edit profile page
  };
  if (!currentUser) {
    return (
      <div className="text-green-500 flex flex-col justify-center items-center min-h-screen">
        <img
          src="/bb.png"
          alt="BeatBuzz"
          className="size-12 animate-bounce rounded-full"
        />
        Loading...
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <Card className="w-full shadow-lg rounded-2xl p-6 h-screen bg-zinc-900">
        <CardContent className="flex flex-col items-center">
          <div className="flex bg-zinc-800 px-4 py-2 rounded-lg w-full max-w-lg">
            <Avatar className="size-20 mb-4">
              <AvatarImage
                src={currentUser.imageUrl || "/default-avatar.png"}
                alt="Profile Picture"
                className="w-full h-full object-cover"
              />
              <AvatarFallback>
                {currentUser.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col ml-4">
              <h2 className="text-sm font-medium text-gray-500">
                Fullname:{" "}
                <span className="text-green-400">{currentUser.fullName}</span>
              </h2>
              <h2 className="text-sm font-medium text-gray-500">
                Username:{" "}
                <span className="text-green-400">{currentUser.username}</span>
              </h2>
              <p className="text-gray-500 text-[.8rem]">
                E-mail:{" "}
                <span className="text-green-400">{currentUser.email}</span>
              </p>
              <div className="mt-4 text-[.8rem] text-gray-600 flex gap-5">
                <p className="text-gray-500">
                  Joined:{" "}
                  <span className="text-green-400">
                    {" "}
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p className="tetx-gray-500">
                  isPremium:{" "}
                  <span className="text-green-400">
                    {currentUser.isPremiumUser ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <Button className="mt-6 w-full max-w-lg" onClick={handleEditProfile}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;
