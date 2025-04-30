import { Chat } from "../model/chat.model.js";
import { Message } from "../model/message.model.js";
import { ApiResponse } from "../utils/ApiResonse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { recipientId, content } = req.body;

  if (!recipientId || !content) {
    throw new ApiError(400, "Recipient and content are required");
  }

  if (senderId === recipientId) {
    throw new ApiError(400, "You cannot send a message to yourself");
  }

  if (!chat) {
    chat = new Chat({
      participants: [senderId, recipientId],
      isGroupChat: false,
    });
    await chat.save();
  }

  let chat = await Chat.findOne({
    isGroupChat: false,
    participants: { $all: [senderId, recipientId], $size: 2 },
  });

  const newMessage = new Message({
    chatId: chat._id,
    senderId,
    recipientId,
    content,
    isGroupMessage: false,
  });

  if(!newMessage) {
    throw new ApiError(500, "Failed to create message");
  }

  await newMessage.save();

  chat.lastMessage = newMessage._id;
  await chat.save();

  res.status(201).json(
    new ApiResponse(201, "Message sent successfully", {
      message: newMessage,
      chat,
    })
  );
});

export const sendGroupMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { groupId, content } = req.body;

  if (!groupId || !content) {
    throw new ApiError(400, "Group ID and content are required");
  }

  const chat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!chat) {
    throw new ApiError(404, "Group chat not found");
  }

  if (!chat.participants.includes(senderId)) {
    throw new ApiError(403, "You are not a participant of this group");
  }

  const newMessage = new Message({
    chatId: groupId,
    senderId,
    content,
    isGroupMessage: true,
  });

  if (!newMessage) {
    throw new ApiError(500, "Failed to create group message");
  }

  await newMessage.save();

  chat.lastMessage = newMessage._id;
  await chat.save();

  res.status(201).json(
    new ApiResponse(201, "Group message sent successfully", {
      message: newMessage,
      chat,
    })
  );
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(400, "Chat ID is required");
  }

  const messages = await Message.find({ chatId }).populate("senderId", "username profilePicture");

  if (!messages) {
    throw new ApiError(404, "No messages found for this chat");
  }

  res.status(200).json(
    new ApiResponse(200, "Messages retrieved successfully", messages)
  );
});

export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  await Message.updateMany(
    { chatId, recipientId: userId, isRead: false },
    { isRead: true }
  );

  res.status(200).json(
    new ApiResponse(200, "Messages marked as read")
  );
});

export const getUnreadMessagesCount = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  if(!chatId || !userId) {
    throw new ApiError(400, "Chat ID and user ID are required");
  }

  const unreadCount = await Message.countDocuments({
    chatId,
    recipientId: userId,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(200, "Unread messages count retrieved", { unreadCount })
  );
});

export const searchMessagesByIndividual = asyncHandler(async (req, res) => {
  const senderId = req.user._id; // Current logged-in user
  const { recipientId } = req.query; // Individual to search messages with

  if (!recipientId) {
    throw new ApiError(400, "Recipient ID is required for searching messages");
  }

  // Find the one-on-one chat between the sender and recipient
  const chat = await Chat.findOne({
    isGroupChat: false,
    participants: { $all: [senderId, recipientId], $size: 2 },
  });

  if (!chat) {
    throw new ApiError(404, "No chat found with the specified individual");
  }

  // Retrieve all messages from the chat
  const messages = await Message.find({ chatId: chat._id }).populate(
    "senderId",
    "username profilePicture"
  );

  res.status(200).json(
    new ApiResponse(200, "Messages retrieved successfully", messages)
  );
});

export const searchMessagesByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.query; // Group ID to search messages in

  if (!groupId) {
    throw new ApiError(400, "Group ID is required for searching messages");
  }

  // Find the group chat
  const chat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!chat) {
    throw new ApiError(404, "Group chat not found");
  }

  // Retrieve all messages from the group chat
  const messages = await Message.find({ chatId: groupId }).populate(
    "senderId",
    "username profilePicture"
  );

  res.status(200).json(
    new ApiResponse(200, "Messages retrieved successfully", messages)
  );
});

export default {
  sendMessage,
  sendGroupMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadMessagesCount,
  searchMessagesByIndividual,
  searchMessagesByGroup,
}