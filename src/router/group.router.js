import { Router } from "express"
import {
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    transferAdmin,
    getAllMember
} from "../controllers/group.controller.js"
import { veryfyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/createGroup").post(veryfyJWT, createGroup)
router.route("/updateGroup").post(veryfyJWT, updateGroup)
router.route("/deleteGroup").post(veryfyJWT, deleteGroup)
router.route("/addMember").post(veryfyJWT, addMember)
router.route("/removeMember").post(veryfyJWT, removeMember)
router.route("/transferAdmin").post(veryfyJWT, transferAdmin)
router.route("/getAllMember").post(veryfyJWT, getAllMember)

export default router


