import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {jwtDecode} from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const isTokenExpired = (token: string) => {
  if (!token) return true; // If no token, treat as expired

  try {
    const decoded = jwtDecode(token);
    return decoded.exp !== undefined && decoded.exp * 1000 < Date.now(); // Convert exp (in seconds) to ms
  } catch (error) {
    return true; // If token is invalid, treat as expired
  }
};
