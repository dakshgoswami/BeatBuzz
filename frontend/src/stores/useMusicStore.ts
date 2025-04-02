import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";

interface MusicStore {
  albums: Album[];
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  currentAlbum: Album | null;
  featuredSongs: Song[];
  trendingSongs: Song[];
  madeForYouSongs: Song[];
  stats: Stats;

  fetchAlbums: () => Promise<void>;
  fetchAlbumById: (id: string) => Promise<void>;
  fetchFeaturedSongs: () => Promise<void>;
  fetchTrendingSongs: () => Promise<void>;
  fetchMadeForYouSongs: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchSongs: () => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
}

interface MusicState {
  currentSongId: string | null;
  playingUsers: string[]; // Array of user IDs
  setCurrentSong: (songId: string | null) => void;
  setPlayingUsers: (users: string[]) => void;
}

export const useMusicState = create<MusicState>((set) => ({
  currentSongId: null,
  playingUsers: [],
  setCurrentSong: (songId) => set({ currentSongId: songId }),
  setPlayingUsers: (users) => set({ playingUsers: users }),
}));

export const useMusicStore = create<MusicStore>((set) => ({
  albums: [],
  songs: [],
  isLoading: false,
  error: null,
  currentAlbum: null,
  featuredSongs: [],
  trendingSongs: [],
  madeForYouSongs: [],
  stats: {
    totalSongs: 0,
    totalAlbums: 0,
    totalUsers: 0,
    totalArtists: 0,
  },

  fetchAlbums: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/albums", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // console.log(response.data);
      set({ albums: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbumById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/albums/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // console.log(response.data);
      set({ currentAlbum: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeaturedSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/featured", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // console.log(response.data);
      set({ featuredSongs: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMadeForYouSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/made-for-you", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      set({ madeForYouSongs: response.data });
      // console.log(response.data);
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrendingSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs/trending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      set({ trendingSongs: response.data });
      // console.log(response.data);
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      set({ stats: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/songs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      set({ songs: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSong: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/songs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      set((state) => ({
        songs: state.songs.filter((song) => song._id !== id),
      }));
      toast.success("Song deleted successfully");
    } catch (error: any) {
      // console.log("Error in deleteSong", error);
      toast.error("Error deleting song");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAlbum: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/albums/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      set((state) => ({
        albums: state.albums.filter((album) => album._id !== id),
        songs: state.songs.map((song) =>
          song.albumId === state.albums.find((a) => a._id === id)?.title
            ? { ...song, album: null }
            : song
        ),
      }));
      toast.success("Album deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete album: " + error.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
