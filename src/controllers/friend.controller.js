import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResonse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Friends } from '../model/friend.model.js'
import { User } from "../model/user.model.js"

const addFriend = asyncHandler(async(req, res) => {
    const user1 = req.user?.id  // user who is logged in
    const username = req.body   // user whome you want to add as friend

    if(!username){
        throw new ApiError(400, "username is required")
    }

    if(user1 === username){
        throw new ApiError(400, "You cannot add yourself as friend")
    }

    const userByusername = await User.findOne({username: username})
    if(!userByusername){
        throw new ApiError(400, "User not found")
    }

    const user2Id = userByusername._id

    const existingUser = await Friends.findOne({
        $or: [
            {user1, user2: user2Id},
            {user1: user2Id, user2: user1}
        ]
    })

    if(existingUser) {
        throw new ApiError(400, "Friendship already exists")
    }

    const newFriend = await Friends.create({user1, user2: user2Id})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            newFriend,
            "Friend Added Succesfully"
        )
    )
})

export {
    addFriend
}