import { Router } from "express"
import {
    addFriend,
    removeFriend
} from "../controllers/friend.controller.js"
import { veryfyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/addFriend").post(veryfyJWT, addFriend)
router.route("/removeFriend").post(veryfyJWT, removeFriend)

export default router
