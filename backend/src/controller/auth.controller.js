import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
  try {
    // console.log("Auth callback hit", req.body); // Debugging log

    const { id, firstName, lastName, imageUrl, emailAddresses, username } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is missing" });
    }

    const email = emailAddresses?.[0]?.emailAddress || null;

    let user = await User.findOne({ clerkId: id });

    if (!user) {
      // console.log("User not found in MongoDB, creating new user...");
      user = await User.create({
        clerkId: id,
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
        imageUrl,
        email,
        username,
      });
    } else {
      console.log("User already exists in MongoDB.");
    }

    return res.status(200).json({
      success: true,
      message: "User processed successfully",
      user,
    });
  } catch (error) {
    console.error("Error in auth callback:", error);
    next(error);
  }
};
