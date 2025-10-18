import { Router } from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
} from "../controllers/notification.controller.js";
import { veryfyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route to get all notifications for the logged-in user
router.route("/").get(veryfyJWT, getNotifications);

// Route to get the count of unread notifications
router.route("/unread-count").get(veryfyJWT, getUnreadCount);

// Route to mark a specific notification as read
router.route("/:id/read").patch(veryfyJWT, markAsRead);

export default router;
