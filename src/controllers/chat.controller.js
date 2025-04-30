import { Chat } from "../model/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResonse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createChat = asyncHandler(async (req, res) => {
  const { participants, isGroupChat } = req.body;
  const groupProfilePicture = req.file?.path || req.body.groupProfilePicture;

  if (!participants || participants.length === 0) {
    throw new ApiError(400, "Participants are required to create a chat.");
  }

  if (participants.length > 38) {
    throw new ApiError(
      400,
      "A group chat can have a maximum of 38 participants."
    );
  }

  if (participants.some((participant) => participant === req.user._id)) {
    throw new ApiError(
      400,
      "You cannot create a chat with yourself as a participant."
    );
  }

  if (!isGroupChat && participants.length !== 2) {
    throw new ApiError(
      400,
      "For one-on-one chat, exactly two participants are required."
    );
  }

  if (isGroupChat && !req.body.groupName) {
    throw new ApiError(400, "Group name is required for group chat.");
  }

  const newChat = new Chat({
    participants,
    isGroupChat,
    groupName: isGroupChat ? req.body.groupName : undefined,
    groupProfilePicture: isGroupChat ? req.body.groupProfilePicture : undefined,
  });

  if (!newChat) {
    throw new ApiError(500, "Failed to create a new chat.");
  }

  await newChat.save();

  res
    .status(201)
    .json(new ApiResponse(201, "Chat created successfully", newChat));
});

export const getChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const chats = await Chat.find({
    participants: userId,
    deletedBy: { $ne: userId },
  })
    .populate("participants", "username email profilePicture")
    .populate("lastMessage");

  const chatWithProfiles = chats.map((chat) => {
    if (!chat.isGroupChat) {
      // One-on-one chat
      const otherParticipant = chat.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      return {
        ...chat.toObject(),
        otherParticipantProfile: otherParticipant,
        displayPicture: otherParticipant?.profilePicture,
      };
    } else {
      // Group chat
      return {
        ...chat.toObject(),
        displayPicture: chat.groupProfilePicture,
        groupName: chat.groupName,
      };
    }
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Chats retrieved successfully", chatWithProfiles)
    );
});

export const deleteChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(400, "Chat ID is required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  const isParticipant = chat.participants.some(
    (participant) => participant.toString() === userId.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this chat");
  }

  const alreadyDeleted = chat.deletedBy.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyDeleted) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Chat already deleted from your side"));
  }

  chat.deletedBy.push(userId);
  await chat.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Chat deleted from your side successfully"));
});

export default{
  createChat,
  getChats,
  deleteChat,
}