import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Razorpay from "razorpay";
import transactionModel from "../models/transaction.model.js";
import dotenv from "dotenv";
dotenv.config();

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
    // console.log(req.auth);
    const users = await User.find({ clerkId: { $ne: currentUserId } });
    // console.log(users);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const myId = req.auth.userId;
    const { userId } = req.params;

    // console.log(myId, userId);
    const messages = await Message.find({
      $or: [
        { senderId: userId, recieverId: myId },
        { senderId: myId, recieverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
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
      { clerkId: userId },
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
