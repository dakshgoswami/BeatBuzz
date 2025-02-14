import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
  // console.log(req.auth);
  if (!req.auth.userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized - you must be logged in." });
  }

  next();
};

export const requireAdmin = async (req, res, next) => {
  try {
    const currentUser = await clerkClient.users.getUser(req.auth.userId);
    console.log(currentUser);
    const isAdmin =
      process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;

    if (!isAdmin) {
      return res
        .status(401)
        .json({ message: "Unauthorized - you must be an admin" });
    }

    next();
  } catch (error) {
    console.log("Error in requireAdmin", error);
    next(error);
  }
};
