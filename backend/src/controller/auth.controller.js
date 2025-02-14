import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
  try {
    // console.log("Auth callback triggered");

    const { id, firstName, lastName, imageUrl, emailAddresses, username } = req.body;
    // console.log("Request body:", req.body);

    const email =
      emailAddresses && emailAddresses.length > 0
        ? emailAddresses[0].emailAddress
        : null;

    // console.log("Extracted data:", { id, firstName, lastName, imageUrl, email });
    let user = await User.findOne({ clerkId: id });
    // console.log("User found in MongoDB:", user);

    if (!user) {
      console.log("User not found, creating new user...");
       user = await User.create({
        clerkId: id,
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
        imageUrl,
        email,
        username,
      });
      // console.log("User successfully created in MongoDB!");
    } else {
      console.log("User already exists in MongoDB.");
    }

    // console.log("User successfully processed!");
    // User.save();

    return res.status(200).json({
      success: true,
      message: "User processed successfully",
      user,
    });
  } catch (error) {
    console.log("Error in auth callback:", error);
    next(error);
  }
};
