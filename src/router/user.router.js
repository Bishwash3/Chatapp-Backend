import { Router } from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateProfilePic,
    getUserProfile,
    checkStatus
} from "../controllers/user.controller.js"
import { veryfyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(upload.single("profilePicture"), registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(veryfyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(veryfyJWT, changePassword)
router.route("/get-current-user").get(getCurrentUser)
router.route("/update-account").patch(veryfyJWT, updateAccountDetails)
router.route("/update-profile-picture").patch(veryfyJWT, upload.single("profilePicture"), updateProfilePic)
router.route("/:username").get(veryfyJWT, getUserProfile)
router.route("/status").get(veryfyJWT, checkStatus)

export default router
