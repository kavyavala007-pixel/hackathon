import Message from '../models/Message.js';

/**
 * @route  GET /chat/:userId
 * @access Private
 * Get conversation history between logged-in user and another user
 */
export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role');

    // Mark as read
    await Message.updateMany(
      { senderId: userId, receiverId: myId, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /chat
 * @access Private
 * Store a message (also emitted via Socket.io in socketHandler)
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content,
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};
