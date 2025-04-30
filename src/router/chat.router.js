import { Router } from "express";
import {
    createChat,
    getChats,
    deleteChat,
} from "../controllers/chat.controller.js";
import { veryfyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route to create a new group chat
router.route("/createGroup").post(veryfyJWT, createChat);

// Route to get all chats for the logged-in user
router.route("/").get(veryfyJWT, getChats);

// Route to delete a chat
router.route("/:chatId").delete(veryfyJWT, deleteChat);



export default router;