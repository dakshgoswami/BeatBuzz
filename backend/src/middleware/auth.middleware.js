import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Import your User model

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    // console.log('token', token);
    // console.log("Authorization Header:", req.headers.authorization);
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided." });
    }

    // Verify token
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] },
      (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid Token" });
        }
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Unauthorized - Invalid token." });
  }
};

export const requireAdmin = async (req, res, next) => {
  // console.log("for admin", req.user);
  try {
    // Check if user data exists in the request object
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - You must be logged in." });
    }

    // Fetch user from database using MongoDB _id
    const currentUser = await User.findById(req.user.userId);
    // console.log('current user', currentUser);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("Admin Email from .env:", process.env.ADMIN_EMAIL);
    // console.log("Current User Email:", currentUser.email);

    // Check if user is admin (assuming you have an 'isAdmin' field)
    if (currentUser.email.trim().toLowerCase().toString() !== process.env.ADMIN_EMAIL.trim().toLowerCase()) {
      return res.status(403).json({ message: "Unauthorized - Admin access required." });
    }

    next();
  } catch (error) {
    console.error("Error in requireAdmin", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
