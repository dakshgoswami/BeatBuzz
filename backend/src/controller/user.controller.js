import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Razorpay from "razorpay";
import transactionModel from "../models/transaction.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import crypto from "crypto"; // Ensure crypto module is imported
const __dirname = path.resolve();
dotenv.config();
const otpStore = {}; // Temporary storage for OTPs

export const getAllUsersForChat = async (req, res, next) => {
  // console.log(req.user);
  try {
    const currentUserId = req.user.userId;
    // console.log(req.auth);
    const users = await User.find({ _id: { $ne: currentUserId } });
    // console.log(users);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  // console.log(req.user);
  try {
    // const currentUserId = req.user.userId;
    // console.log(req.auth);
    const users = await User.find();
    // console.log(users);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUsers = async (req, res, next) => {
  // console.log('for current user',req.user);
  try {
    const currentUserId = req.user.userId;
    // console.log(req.auth);
    const user = await User.findById(currentUserId);
    // console.log(users);
    res.status(200).json({ success: true, user });
    // console.log(user);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const receiverId = req.params.userId;

    // console.log("Converted Sender ID:", senderId);
    // console.log("Converted Receiver ID:", receiverId);

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recieverId: receiverId },
        { senderId: receiverId, recieverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    // console.log("Messages Found:", messages);

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    next(error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, email, userId } = req.body;
    // console.log(req.body);
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.username !== username || user.email !== email) {
      let existingUser = await User.findOne({
        $or: [{ username }, { email }],
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username or Email already exists",
        });
      }
    }

    let imageUrl = user.imageUrl; // Keep existing image if not updated

    // Ensure the uploads directory exists
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process new profile image if uploaded
    if (req.files && req.files.image) {
      const file = req.files.image;
      // console.log("File received:", req.files);
      const filePath = path.join(uploadDir, file.name);

      await file.mv(filePath); // Move file to the uploads folder

      // Delete old profile image if exists
      if (user.imageUrl) {
        const oldImagePath = path.join(uploadDir, path.basename(user.imageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      imageUrl = `https://beatbuzz.onrender.com/uploads/${file.name}`; // URL for frontend
    }

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, username, email, imageUrl },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const razorPayment = async (req, res) => {
  //   console.log("Received Request Headers:", req.headers);
  //   console.log("Received Request Body:", req.body);

  try {
    const { planId, userId } = req.body;
    console.log("Received Plan ID:", planId);
    console.log("Received User ID:", userId);
    if (!planId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "planId and userId are required" });
    }

    const plans = {
      1: { name: "Basic Plan", price: 150 },
      2: { name: "Premium Plan", price: 250 },
      3: { name: "Pro Plan", price: 350 },
    };

    if (!plans[planId]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Plan ID" });
    }

    const plan = plans[planId];

    const options = {
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
      payment_capture: 1,
      //   notes: { userId },
    };

    const order = await razorpayInstance.orders.create(options);
    console.log("Order created:", order);
    res.json({ success: true, order, userId });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // Fetch order details to get userId
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    const userId = order.notes?.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not found in payment" });
    }

    // Create a transaction record (optional)
    const transaction = await transactionModel.create({
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    // Update User model (Set isPremiumUser to true and store planId)
    await User.findOneAndUpdate(
      { userId },
      { isPremiumUser: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified successfully, user upgraded to premium",
      userId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const signupUser = async (req, res, next) => {
  try {
    let profilePicUrl = "";
    console.log("Received Request Body:", req.body);
    // console.log("Received Request Files:", req.files);
    // 🔹 Handle Profile Picture Upload
    if (req.files && req.files.profilePic) {
      const file = req.files.profilePic;
      const uploadDir = path.join(__dirname, "uploads");

      // Ensure the uploads directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, uniqueName);
      await file.mv(filePath);
      profilePicUrl = `https://beatbuzz.onrender.com/uploads/${uniqueName}`;
      
    }

    const { email, password, fullName } = req.body;
    const username = req.body.username.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already exists"
            : "Username already exists",
      });
    }

    // 🔹 Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password and profile pic URL
    const newUser = await User.create({
      email,
      password: hashedPassword, // Use hashed password
      fullName,
      username,
      imageUrl: profilePicUrl, // Store the generated image URL
    });
    console.log("New User Created:", newUser);
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error during signup:", error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    // const token = user.generateToken();
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req, res) => {
  const { email, username } = req.body;
  // console.log("Received Email:", email);
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  // console.log("Generated OTP:", otp);
  otpStore[email] = otp; // Store OTP temporarily

  // Setup email transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "dakshgoswami95@gmail.com",
      pass: "tenp pcnr exfh fhdi",
    },
  });

  const mailOptions = {
    from: "dakshgoswami95@gmail.com",
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP for signing up is: ${otp}. It is valid for 5 minutes.`,
  };

  try {
    if (!email || !username) {
      return res
        .status(400)
        .json({ success: false, message: "Email and username are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already exists"
            : "Username already exists",
      });
    }

    await transporter.sendMail(mailOptions);
    // console.log("OTP Email Sent Successfully");
    res.json({ success: true, message: "OTP sent" });

    setTimeout(() => {
      delete otpStore[email];
    }, 5 * 60 * 1000); // OTP expires in 5 minutes
  } catch (error) {
    console.error("Failed to send OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Received Email:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("User Found:", user);
    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "dakshgoswami95@gmail.com",
        pass: "tenp pcnr exfh fhdi",
      },
    });

    const resetUrl = `https://beatbuzz-frontend.onrender.com/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: user.email,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  console.log("Received Token:", token);
  const { password } = req.body;
  console.log("Received Password:", password);
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check token expiry
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Update password
    user.password = hashedPassword; // Encrypt this in real-world apps
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// export const sendRequest = async (req, res) => {
//   try {
//     const { userId } = req.params; // The user receiving the request
//     console.log(userId);
//     const senderId = req.body.senderId; // The logged-in user sending request
//     console.log(senderId);
//     const receiver = await User.findById(userId);
//     if (!receiver) return res.status(404).json({ message: "User not found" });

//     if (receiver.pendingRequests.includes(senderId))
//       return res.status(400).json({ message: "Request already sent" });

//     receiver.pendingRequests.push(senderId);
//     await receiver.save();

//     res.status(200).json({ message: "Friend request sent!" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// export const acceptRequest = async (req, res) => {
//   try {
//     const { userId } = req.params; // ID of the sender
//     console.log(userId);
//     const userIdfromBody = req.body.userId; // Logged-in user accepting request
//     console.log(req.body);
//     const user = await User.findById(userId);
//     const sender = await User.findById(userIdfromBody);

//     if (!user || !sender) return res.status(404).json({ message: "User not found" });

//     if (!user.pendingRequests.includes(userId))
//       return res.status(400).json({ message: "No pending request found" });

//     // Add each other as friends
//     user.friends.push(userIdfromBody);
//     sender.friends.push(userId);

//     // Remove from pendingRequests
//     user.pendingRequests = user.pendingRequests.filter((req) => req !== userId);
//     await user.save();
//     await sender.save();

//     res.status(200).json({ message: "Friend request accepted!" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
