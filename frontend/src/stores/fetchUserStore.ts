import { create } from "zustand";
import axios from "axios";

interface UserStore {
  isPremium: boolean;
  showAd: boolean;
  fetchUser: (token: string) => Promise<void>; // Accept token as a parameter
  setShowAd: (value: boolean) => void;
}

const useUserFetchStore = create<UserStore>((set) => ({
  isPremium: false,
  showAd: false,

  fetchUser: async (token) => { // Accept token from component
    try {
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response.data);
      set({ isPremium: response.data[0]?.isPremiumUser || false });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  },

  setShowAd: (value) => set({ showAd: value }),
}));

export default useUserFetchStore;
