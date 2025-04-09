import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? `${process.env.VITE_BACKEND_URL}/api` : "/api",
});