import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useUserFetchStore from "@/stores/fetchUserStore";
import {axiosInstance} from "@/lib/axios";
import { useNavigate } from "react-router-dom"; // For navigation
import { toast, ToastContainer } from "react-toastify";
// import { describe } from "node:test";
interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  imageUrl?: string;
  imageFile?: File;
}

const EditProfile = () => {
  const { currentUser, fetchCurrentUser } = useUserFetchStore();
  const [isLoading, setIsLoading] = useState(false); // For loading state
  const navigate = useNavigate(); // For navigation
  const [formData, setFormData] = useState<UserProfile>({
    fullName: "",
    username: "",
    email: "",
    imageUrl: "",
    imageFile: undefined,
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        imageUrl: currentUser.imageUrl || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        imageFile: file,
        imageUrl: URL.createObjectURL(file), // Show preview
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUser(formData);
    } catch (error) {
      // console.error("Error updating profile:", error);
      toast.error("Failed to update profile!");
    }
    finally {
      setIsLoading(false); // Hide loading state
    }
  };

  const updateUser = async (updatedUser: UserProfile) => {
    try {
      if (!updatedUser) return;

      const formDataToSend = new FormData();
      formDataToSend.append("username", updatedUser.username);
      formDataToSend.append("fullName", updatedUser.fullName);
      formDataToSend.append("email", updatedUser.email);
      if (updatedUser.imageFile) {
        formDataToSend.append("image", updatedUser.imageFile);
      }
      formDataToSend.append("userId", currentUser._id);
      
      const response = await axiosInstance.post(
        `/users/update-profile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // ✅ Re-fetch updated user data
        fetchCurrentUser(); // Ensure latest data is available

        setTimeout(() => navigate("/"), 1000);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to update profile");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <ToastContainer />
      <Card className="w-full max-w-lg shadow-lg rounded-2xl bg-zinc-900 h-screen flex justify-center items-center">
        <CardContent className="flex flex-col items-center">
          <Avatar className="size-20 mb-4">
            <AvatarImage
              src={formData.imageUrl || "/default-avatar.png"}
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
            <AvatarFallback>
              {formData.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-2 mt-4 max-sm:w-[90%]"
          >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-white max-sm:text-xs"
          />
           <div>
           <label htmlFor="fullName" className="text-white max-sm:text-xs">Full Name</label>
           <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              id="fullName"
              className="px-4 py-2 max-sm:px-2 max-sm:py-1 max-sm:text-sm rounded bg-zinc-800 text-white w-full outline-none border border-green-500"
            />
           </div>
            
            <div>
            <label htmlFor="username" className="text-white max-sm:text-xs">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username.toLowerCase().trim()}
              onChange={handleChange}
              placeholder="Username"
              id="username"
              className="px-4 py-2 max-sm:px-2 max-sm:py-1 max-sm:text-sm rounded bg-zinc-800 text-white w-full outline-none border border-green-500"
            />
            </div>
           
           <div>
           <label htmlFor="email" className="text-white max-sm:text-xs">Email</label>
           <input
              type="email"
              name="email"
              value={formData.email.toLowerCase()}
              onChange={handleChange}
              placeholder="Email"
              id="email"
              className="px-4 py-2 max-sm:px-2 max-sm:py-1 max-sm:text-sm rounded bg-zinc-800 text-white w-full outline-none border border-green-500"
            />
           </div>
            <div className="flex gap-3 max-sm:flex-col max-sm:gap-2 mt-4 w-full">
              <Button type="submit" className="w-full">
                {isLoading ? "Updating..." : "Update"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {return navigate("/myprofile")}}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
