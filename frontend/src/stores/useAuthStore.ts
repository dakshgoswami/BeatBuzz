import { create } from "zustand";
// import {axiosInstance} from "@/lib/axios";
import axios from "axios";
interface AuthStore {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  checkAdminStatus: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAdmin: false,
  isLoading: false,
  error: null,

  checkAdminStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      // console.log(token);
      const response = await axios.get(
        "http://localhost:5000/api/admin/check",
       {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
       }
      );
      // console.log(response.data);
	  set({ isAdmin: response.data.admin });
    } catch (error: any) {
      set({ isAdmin: false, error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({ isAdmin: false, isLoading: false, error: null });
  },
}));
