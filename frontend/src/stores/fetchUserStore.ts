import { create } from "zustand";
import axios from "axios";

interface UserStore {
  isPremium: boolean;
  showAd: boolean;
  fetchUser: (token?: string) => Promise<void>;
  setShowAd: (value: boolean) => void;
  fetchCurrentUser: (token?: string) => void;
  setCurrentUser: (user: any) => void;
  currentUser: any;
  users: any[];
}

const useUserFetchStore = create<UserStore>((set) => ({
  isPremium: false,
  showAd: false,
  currentUser: null,
  users: [],
  fetchUser: async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/allusers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("User Fetch Response:", response?.data);

      set({
        users: response?.data,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  },

  setShowAd: (value) => set({ showAd: value }),

  fetchCurrentUser: async (token) => {
    // const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/current",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("Current User Response:", response.data);

      set({
        currentUser: response?.data.user,
        isPremium: response?.data.user.isPremiumUser,
      });
      // console.log("Current User isPremium:", response.data.user.isPremiumUser);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
}));

export default useUserFetchStore;
