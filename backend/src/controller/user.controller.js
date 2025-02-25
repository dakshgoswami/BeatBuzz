import User from "../models/user.model.js";
import Message from "../models/message.model.js";
export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
    // console.log(req.auth);
    const users = await User.find({ clerkId: { $ne: currentUserId } });
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
