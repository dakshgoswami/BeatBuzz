import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages } from "../controller/user.controller.js";
// import { razorPayment, verifyPayment } from "../controller/user.controller.js";
import User from "../models/user.model.js";
// import Message from "../models/message.model.js";

import Razorpay from "razorpay";
import transactionModel from "../models/transaction.model.js";
import dotenv from "dotenv";
import crypto from "crypto"; // Ensure crypto module is imported

dotenv.config();
const router = Router();
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);

router.post("/payment", protectRoute, async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Missing authorization token" });
    }

    const { planId, userId } = req.body;
    if (!planId || !userId) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    console.log("Received Request Body:", req.body);

    const plans = {
      101: { name: "Basic Plan", price: 150 },
      102: { name: "Premium Plan", price: 250 },
      103: { name: "Pro Plan", price: 350 },
    };

    if (!plans[planId]) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Plan ID" });
    }

    const plan = plans[planId];
    console.log("Selected Plan:", plan);
    const options = {
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: { userId }, // ✅ Ensure userId is stored in the order notes
    };

    const order = await razorpayInstance.orders.create(options);
    console.log("Order created:", order);

    res.json({ success: true, order, userId, plan });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verifypayment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response;
    console.log("Received Request Body:", req.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("Computed Signature:", body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    console.log("Expected Signature:", expectedSignature);

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // ✅ Fetch order details correctly
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    console.log("Fetched Order:", order);
    const userId = order.notes?.userId;
    console.log("User ID from Order:", userId);

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not found in payment" });
    }

    const plans = {
      101: { name: "Basic Plan", price: 150 },
      102: { name: "Premium Plan", price: 250 },
      103: { name: "Pro Plan", price: 350 },
    };

    // ✅ Create transaction record
    await transactionModel.create({
      userId: userId,
      // plan: plans[101].name,
      amount: order.amount / 100,
      payment: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    // ✅ Update User model (Ensure it updates correctly)
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { isPremiumUser: true },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message:
        "Payment verified successfully, user upgraded to premium membership",
      userId,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
