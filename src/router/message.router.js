import { Router } from "express";
import {
    sendMessage,
    sendGroupMessage,
    getMessages,
    markMessagesAsRead,
    getUnreadMessagesCount,
    searchMessagesByIndividual,
    searchMessagesByGroup,
} from "../controllers/message.controller.js";
import { veryfyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route to send a message in a one-on-one chat
router.route("/send").post(veryfyJWT, sendMessage);

// Route to send a message in a group chat
router.route("/sendGroup").post(veryfyJWT, sendGroupMessage);

// Route to get all messages in a chat
router.route("/:chatId").get(veryfyJWT, getMessages);


// Route to mark all messages in a chat as read
router.route("/:chatId/markAsRead").patch(veryfyJWT, markMessagesAsRead);

// Route to get the count of unread messages in a chat
router.route("/:chatId/unreadCount").get(veryfyJWT, getUnreadMessagesCount);

// Route to search messages by individual
router.route("/searchByIndividual").get(veryfyJWT, searchMessagesByIndividual);

// Route to search messages by group
router.route("/searchByGroup").get(veryfyJWT, searchMessagesByGroup);

export default router;